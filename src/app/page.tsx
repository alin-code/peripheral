'use client';

import { useState } from 'react';
import ServiceSelect from '@/components/service-select';
import EmoticonGenerator from '@/components/emoticon-generator';
import ModelGenerator from '@/components/model-generator';
import { Toaster } from '@/components/ui/sonner';

type ServiceType = 'select' | 'emoticon' | 'model';

export default function Home() {
  const [currentService, setCurrentService] = useState<ServiceType>('select');

  const handleSelectService = (service: 'emoticon' | 'model') => {
    setCurrentService(service);
  };

  const handleBack = () => {
    setCurrentService('select');
  };

  return (
    <>
      {currentService === 'select' && (
        <ServiceSelect onSelectService={handleSelectService} />
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
