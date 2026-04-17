import { createClient } from '@supabase/supabase-js';

// Supabase 配置
// 注意：在生产环境中，这些值应该从环境变量读取
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// 数据库类型定义
export interface User {
  id: string;
  email: string;
  password_hash: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

// 用户注册数据
export interface SignUpData {
  email: string;
  password: string;
  username?: string;
}

// 用户登录数据
export interface SignInData {
  email: string;
  password: string;
}

// API响应类型
export interface AuthResponse {
  success: boolean;
  user?: User;
  session?: {
    access_token: string;
    refresh_token: string;
  };
  error?: string;
}
