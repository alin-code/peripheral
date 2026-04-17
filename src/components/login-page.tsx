'use client';

import { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Lock, 
  User, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

interface LoginPageProps {
  onBack?: () => void;
  onLoginSuccess?: (user: { id: string; email: string; username?: string }) => void;
}

interface FormErrors {
  email?: string;
  password?: string;
  username?: string;
  general?: string;
}

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function LoginPage({ onBack, onLoginSuccess }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // 登录表单状态
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // 注册表单状态
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileWidgetKey, setTurnstileWidgetKey] = useState(0);

  // 验证邮箱格式
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 验证密码强度
  const validatePassword = (password: string): { valid: boolean; message: string } => {
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
  };

  const resetTurnstile = () => {
    setTurnstileToken('');
    setTurnstileWidgetKey(prev => prev + 1);
  };

  const switchToLogin = (email?: string, message?: string) => {
    if (email) {
      setLoginEmail(email);
    }
    if (message) {
      setLoginError(message);
    }
    setActiveTab('login');
  };

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // 验证
    if (!loginEmail || !loginPassword) {
      setLoginError('请填写邮箱和密码');
      return;
    }

    if (!isValidEmail(loginEmail)) {
      setLoginError('请输入有效的邮箱地址');
      return;
    }

    setIsLoggingIn(true);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        onLoginSuccess?.(data.user);
      } else {
        setLoginError(data.error || '登录失败');
      }
    } catch (error) {
      setLoginError('网络错误，请稍后重试');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 处理注册
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    // 验证
    if (!signupEmail || !signupPassword || !signupConfirmPassword) {
      setSignupError('请填写所有必填项');
      return;
    }

    if (!isValidEmail(signupEmail)) {
      setSignupError('请输入有效的邮箱地址');
      return;
    }

    const passwordCheck = validatePassword(signupPassword);
    if (!passwordCheck.valid) {
      setSignupError(passwordCheck.message);
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupError('两次输入的密码不一致');
      return;
    }

    if (!turnstileSiteKey) {
      setSignupError('验证码配置缺失，请联系管理员');
      return;
    }

    if (!turnstileToken) {
      setSignupError('请先完成人机验证');
      return;
    }

    setIsSigningUp(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          username: signupUsername || undefined,
          turnstileToken
        })
      });

      const data = await response.json();

      if (data.success) {
        setSignupSuccess(true);
        // 3秒后自动切换到登录
        setTimeout(() => {
          switchToLogin(signupEmail, '注册成功，请使用刚刚创建的账号登录');
        }, 3000);
      } else {
        if (response.status === 409 || data.error === '该邮箱已被注册') {
          switchToLogin(signupEmail, '该邮箱已注册，请直接登录');
          resetTurnstile();
          return;
        }

        setSignupError(data.error || '注册失败');
        resetTurnstile();
      }
    } catch (error) {
      setSignupError('网络错误，请稍后重试');
      resetTurnstile();
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        {/* Back Button */}
        {onBack && (
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="absolute top-8 left-8 text-gray-700 hover:bg-white/70"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        )}

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              电影周边服务
            </span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            欢迎回来
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            登录或注册
          </p>
        </div>

        {/* Auth Card */}
        <Card className="w-full max-w-md shadow-xl">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none rounded-t-xl bg-[#efe3dc] p-1.5">
              <TabsTrigger
                value="login"
                className="rounded-lg border border-transparent font-semibold text-[#6a5750] data-[state=active]:border-[#2d2220] data-[state=active]:bg-[#1c1413] data-[state=active]:text-white data-[state=active]:shadow-[0_8px_20px_rgba(28,20,19,0.18)]"
              >
                登录
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-lg border border-transparent font-semibold text-[#6a5750] data-[state=active]:border-[#4f3596] data-[state=active]:bg-[#7c3aed] data-[state=active]:text-white data-[state=active]:shadow-[0_8px_20px_rgba(124,58,237,0.2)]"
              >
                注册
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  登录账号
                </CardTitle>
                <CardDescription>输入邮箱和密码</CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="login-email">邮箱</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="login-password">密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="输入密码"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {loginError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-600 dark:text-red-400">{loginError}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full border border-purple-300/40 bg-gradient-to-r from-purple-600 to-pink-500 font-semibold text-white shadow-[0_12px_30px_rgba(147,51,234,0.22)] hover:from-purple-700 hover:to-pink-600"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        登录中...
                      </>
                    ) : (
                      '登录'
                    )}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  注册账号
                </CardTitle>
                <CardDescription>创建新账号</CardDescription>
              </CardHeader>
              
              <CardContent>
                {signupSuccess ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-600">注册成功！</h3>
                    <p className="text-sm text-gray-500">
                      账号已创建，请使用新账号登录
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">邮箱 <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your@email.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-username">用户名（可选）</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="signup-username"
                          type="text"
                          placeholder="设置一个昵称"
                          value={signupUsername}
                          onChange={(e) => setSignupUsername(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">密码 <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="设置密码"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">确认密码 <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="signup-confirm-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="再次输入密码"
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-xs text-blue-700 dark:text-blue-400 mb-2 font-medium">
                        密码要求：
                      </p>
                      <ul className="text-xs text-blue-600 dark:text-blue-500 space-y-1">
                        <li className={signupPassword.length >= 8 ? 'text-green-600' : ''}>
                          {signupPassword.length >= 8 ? '✓' : '○'} 至少8个字符
                        </li>
                        <li className={/[A-Z]/.test(signupPassword) ? 'text-green-600' : ''}>
                          {/[A-Z]/.test(signupPassword) ? '✓' : '○'} 包含大写字母
                        </li>
                        <li className={/[a-z]/.test(signupPassword) ? 'text-green-600' : ''}>
                          {/[a-z]/.test(signupPassword) ? '✓' : '○'} 包含小写字母
                        </li>
                        <li className={/[0-9]/.test(signupPassword) ? 'text-green-600' : ''}>
                          {/[0-9]/.test(signupPassword) ? '✓' : '○'} 包含数字
                        </li>
                      </ul>
                    </div>

                    {/* Error */}
                    {signupError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-600 dark:text-red-400">{signupError}</p>
                      </div>
                    )}

                    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/40">
                      {turnstileSiteKey ? (
                        <Turnstile
                          key={turnstileWidgetKey}
                          siteKey={turnstileSiteKey}
                          onSuccess={(token) => {
                            setSignupError('');
                            setTurnstileToken(token);
                          }}
                          onExpire={() => {
                            setTurnstileToken('');
                          }}
                          onError={() => {
                            setTurnstileToken('');
                            setSignupError('人机验证加载失败，请刷新后重试');
                          }}
                        />
                      ) : (
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          验证码配置缺失，请联系管理员处理
                        </p>
                      )}
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={isSigningUp || !turnstileToken}
                      className="w-full border border-cyan-300/40 bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.22)] hover:from-blue-700 hover:to-cyan-600"
                    >
                      {isSigningUp ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          注册中...
                        </>
                      ) : (
                        '注册'
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          登录即表示同意{' '}
          <a href="#" className="text-purple-600 hover:underline">服务条款</a>
          {' '}和{' '}
          <a href="#" className="text-purple-600 hover:underline">隐私政策</a>
        </p>
      </div>
    </div>
  );
}
