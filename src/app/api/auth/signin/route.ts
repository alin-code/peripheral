import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { generateAuthToken, verifyAuthToken } from '@/lib/auth';
import { findUserByEmail, findUserById, updateLastLoginAt } from '@/lib/user-repository';
interface SignInRequest {
  email: string;
  password: string;
}

// 邮箱格式验证
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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

    if (!process.env.POSTGRES_URL) {
      return NextResponse.json(
        { success: false, error: '服务配置错误，请联系管理员' },
        { status: 500 }
      );
    }

    const user = await findUserByEmail(email);
    if (!user) {
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
    await updateLastLoginAt(user.id);

    // 生成 token
    const token = generateAuthToken({ userId: user.id, email: user.email });

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

    const payload = verifyAuthToken(token);
    if (!payload) {
      return NextResponse.json({
        authenticated: false,
        error: 'Token已过期，请重新登录'
      });
    }

    if (!process.env.POSTGRES_URL) {
      return NextResponse.json({
        authenticated: false,
        error: '服务配置错误'
      });
    }

    const user = await findUserById(payload.userId);
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
