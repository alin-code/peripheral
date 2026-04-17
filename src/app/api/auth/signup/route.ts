import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { createUser, findUserByEmail } from '@/lib/user-repository';

interface SignUpRequest {
  email: string;
  password: string;
  username?: string;
}

// 邮箱格式验证
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 密码强度验证
function isValidPassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: '密码长度至少8位' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: '密码需包含至少一个大写字母' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: '密码需包含至少一个小写字母' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: '密码需包含至少一个数字' };
  }
  return { valid: true, message: '' };
}

// 用户注册
export async function POST(request: NextRequest) {
  try {
    const body: SignUpRequest = await request.json();
    const { email, password, username } = body;

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

    // 密码强度验证
    const passwordCheck = isValidPassword(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { success: false, error: passwordCheck.message },
        { status: 400 }
      );
    }

    if (!process.env.POSTGRES_URL) {
      return NextResponse.json(
        { success: false, error: '服务配置错误，请联系管理员' },
        { status: 500 }
      );
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '该邮箱已被注册' },
        { status: 409 }
      );
    }

    // 密码哈希
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await createUser(email, passwordHash, username);

    // 返回成功响应（不包含密码哈希）
    return NextResponse.json({
      success: true,
      message: '注册成功',
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        created_at: newUser.created_at
      }
    }, { status: 201 });

  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      return NextResponse.json(
        { success: false, error: '该邮箱已被注册' },
        { status: 409 }
      );
    }

    console.error('注册错误:', error);
    return NextResponse.json(
      { success: false, error: '服务异常，请稍后重试' },
      { status: 500 }
    );
  }
}

// 获取注册配置
export async function GET() {
  return NextResponse.json({
    emailRequired: true,
    passwordMinLength: 8,
    passwordRequirements: [
      '至少8个字符',
      '包含至少一个大写字母',
      '包含至少一个小写字母',
      '包含至少一个数字'
    ],
    usernameOptional: true
  });
}
