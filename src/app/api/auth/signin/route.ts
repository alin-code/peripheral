import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';

// Supabase 配置 - 从环境变量获取
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret-key';

interface SignInRequest {
  email: string;
  password: string;
}

// 邮箱格式验证
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 简单的 JWT 生成（生产环境建议使用专业的 JWT 库）
function generateToken(payload: { userId: string; email: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64');
  const signature = Buffer.from(`${header}.${body}.${jwtSecret}`).toString('base64');
  return `${header}.${body}.${signature}`;
}

// 验证 JWT token
function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const [header, body, signature] = token.split('.');
    const expectedSignature = Buffer.from(`${header}.${body}.${jwtSecret}`).toString('base64');
    if (signature !== expectedSignature) return null;
    
    const payload = JSON.parse(Buffer.from(body, 'base64').toString());
    if (payload.exp < Date.now()) return null;
    
    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}

// 创建 Supabase 管理员客户端
function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// 用户登录
export async function POST(request: NextRequest) {
  try {
    const body: SignInRequest = await request.json();
    const { email, password } = body;

    // 参数验证
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '邮箱和密码不能为空' },
        { status: 400 }
      );
    }

    // 邮箱格式验证
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: '请输入有效的邮箱地址' },
        { status: 400 }
      );
    }

    // 检查 Supabase 配置
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, error: '服务配置错误，请联系管理员' },
        { status: 500 }
      );
    }

    const supabase = getSupabaseAdmin();

    // 查询用户
    const { data: user, error: queryError } = await supabase
      .from('users')
      .select('id, email, password_hash, username, avatar_url, is_active')
      .eq('email', email.toLowerCase())
      .single();

    if (queryError || !user) {
      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 检查账号是否激活
    if (!user.is_active) {
      return NextResponse.json(
        { success: false, error: '账号已被禁用，请联系管理员' },
        { status: 403 }
      );
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 更新最后登录时间
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    // 生成 token
    const token = generateToken({ userId: user.id, email: user.email });

    // 设置 cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7天
      path: '/'
    });

    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar_url: user.avatar_url
      },
      token
    });

  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { success: false, error: '服务异常，请稍后重试' },
      { status: 500 }
    );
  }
}

// 获取当前登录状态
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({
        authenticated: false,
        user: null
      });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({
        authenticated: false,
        error: 'Token已过期，请重新登录'
      });
    }

    // 检查 Supabase 配置
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        authenticated: false,
        error: '服务配置错误'
      });
    }

    const supabase = getSupabaseAdmin();

    // 查询用户信息
    const { data: user } = await supabase
      .from('users')
      .select('id, email, username, avatar_url, created_at')
      .eq('id', payload.userId)
      .single();

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        error: '用户不存在'
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar_url: user.avatar_url
      }
    });

  } catch (error) {
    console.error('验证错误:', error);
    return NextResponse.json(
      { success: false, error: '服务异常' },
      { status: 500 }
    );
  }
}

// 退出登录
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    
    return NextResponse.json({
      success: true,
      message: '已退出登录'
    });
  } catch (error) {
    console.error('退出登录错误:', error);
    return NextResponse.json(
      { success: false, error: '服务异常' },
      { status: 500 }
    );
  }
}
