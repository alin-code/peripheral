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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
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
        <EmoticonGenerator onBack={handleBack} />
      )}
      {currentService === 'model' && (
        <ModelGenerator onBack={handleBack} />
      )}
      <Toaster />
    </>
  );
}
