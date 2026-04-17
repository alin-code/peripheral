'use client';

import { useState, useEffect } from 'react';
import ServiceSelect from '@/components/service-select';
import EmoticonGenerator from '@/components/emoticon-generator';
import ModelGenerator from '@/components/model-generator';
import LoginPage from '@/components/login-page';
import { Toaster } from '@/components/ui/sonner';

type ServiceType = 'select' | 'emoticon' | 'model';

interface User {
  id: string;
  email: string;
  username?: string;
}

export default function Home() {
  const [currentService, setCurrentService] = useState<ServiceType>('select');
  const [showLogin, setShowLogin] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingService, setPendingService] = useState<ServiceType | null>(null);

  // 检查登录状态
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'GET'
      });
      const data = await response.json();
      
      if (data.authenticated && data.user) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectService = (service: 'emoticon' | 'model') => {
    if (service === 'emoticon' && !currentUser) {
      setPendingService(service);
      setShowLogin(true);
      return;
    }

    setCurrentService(service);
  };

  const handleBack = () => {
    setCurrentService('select');
  };

  const handleLogin = () => {
    setShowLogin(true);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setShowLogin(false);
    if (pendingService) {
      setCurrentService(pendingService);
      setPendingService(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/signin', {
        method: 'DELETE'
      });
      setCurrentUser(null);
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#f7efe4_0%,#f5e6d4_18%,#111016_70%)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full border-4 border-amber-100/35 border-t-transparent animate-spin"></div>
          <p className="text-sm uppercase tracking-[0.35em] text-white/55">加载中</p>
        </div>
      </div>
    );
  }

  if (showLogin) {
    return (
      <>
        <LoginPage 
          onBack={() => setShowLogin(false)}
          onLoginSuccess={handleLoginSuccess}
        />
        <Toaster />
      </>
    );
  }

  return (
    <>
      {currentService === 'select' && (
        <ServiceSelect 
          onSelectService={handleSelectService}
          onLogin={handleLogin}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}
      {currentService === 'emoticon' && (
        <EmoticonGenerator
          onBack={handleBack}
          currentUser={currentUser}
          onRequireLogin={handleLogin}
        />
      )}
      {currentService === 'model' && (
        <ModelGenerator onBack={handleBack} />
      )}
      <Toaster />
    </>
  );
}
