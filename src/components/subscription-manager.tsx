'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Crown, 
  Building2, 
  Check, 
  ArrowRight,
  MessageCircle,
  Box,
  Users,
  Headphones
} from 'lucide-react';

interface SubscriptionManagerProps {
  onClose?: () => void;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
  emoticonQuota: number;
  modelQuota: number;
  recommended?: boolean;
}

export default function SubscriptionManager({ onClose }: SubscriptionManagerProps) {
  const [currentPlan] = useState('free');
  const [emoticonUsed] = useState(1);
  const [modelUsed] = useState(1);

  const plans: Plan[] = [
    {
      id: 'free',
      name: '免费版',
      price: '¥0',
      emoticonQuota: 10,
      modelQuota: 5,
      features: [
        '表情包生成 10次/日',
        '建模图生成 5次/日',
        '基础素材库',
        '标准输出质量',
        '社区支持'
      ]
    },
    {
      id: 'pro',
      name: '专业版',
      price: '¥99/月',
      emoticonQuota: 100,
      modelQuota: 50,
      recommended: true,
      features: [
        '表情包生成 100次/日',
        '建模图生成 50次/日',
        '高清素材库',
        '优先生成队列',
        '商家对接服务',
        '邮件支持'
      ]
    },
    {
      id: 'enterprise',
      name: '企业版',
      price: '¥299/月',
      emoticonQuota: -1,
      modelQuota: -1,
      features: [
        '无限次数生成',
        '专属高清素材库',
        'API接口调用',
        '优先生成队列',
        '专属客户经理',
        '7x24技术支持',
        '批量订单对接'
      ]
    }
  ];

  const currentPlanData = plans.find(p => p.id === currentPlan) || plans[0];

  return (
    <div className="design-page">
      <div className="design-shell max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center text-white">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 backdrop-blur">
            <Crown className="w-5 h-5 text-[#ffcf75]" />
            <span className="text-sm font-medium text-white/78">
              订阅管理
            </span>
          </div>
          
          <h1 className="mb-4 text-4xl font-semibold tracking-normal text-white">
            解锁更多生成能力
          </h1>
          
          <p className="text-lg text-white/62">
            选择适合你的订阅方案，开启无限创意
          </p>
        </div>

        {/* Current Usage */}
        <Card className="design-panel mb-12 rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              当前使用情况
            </CardTitle>
            <CardDescription>
              你的每日生成额度使用情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#ff6848]" />
                    <span className="text-sm font-medium">表情包生成</span>
                  </div>
                  <Badge variant="outline">
                    {emoticonUsed}/{currentPlanData.emoticonQuota === -1 ? '∞' : currentPlanData.emoticonQuota}
                  </Badge>
                </div>
                <Progress 
                  value={(emoticonUsed / (currentPlanData.emoticonQuota === -1 ? emoticonUsed : currentPlanData.emoticonQuota)) * 100} 
                  className="h-2"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-[#31c5ff]" />
                    <span className="text-sm font-medium">建模图生成</span>
                  </div>
                  <Badge variant="outline">
                    {modelUsed}/{currentPlanData.modelQuota === -1 ? '∞' : currentPlanData.modelQuota}
                  </Badge>
                </div>
                <Progress 
                  value={(modelUsed / (currentPlanData.modelQuota === -1 ? modelUsed : currentPlanData.modelQuota)) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`design-panel relative overflow-hidden rounded-lg transition-all duration-300 hover:-translate-y-1 ${
                plan.recommended ? 'border-[#ff6848] shadow-xl' : ''
              }`}
            >
              {plan.recommended && (
                <div className="absolute left-0 right-0 top-0 bg-[#ff6848] py-1 text-center text-xs font-medium text-white">
                  推荐方案
                </div>
              )}
              
              <CardHeader className={`pt-12 ${!plan.recommended ? 'pt-8' : ''}`}>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-[#171513]">
                    {plan.price}
                  </span>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-[#6d6256]">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.id === currentPlan 
                      ? 'cursor-not-allowed bg-gray-400' 
                      : plan.recommended 
                        ? 'bg-[#ff6848] hover:bg-[#e8583d]'
                        : 'bg-[#171513] hover:bg-[#2a2320]'
                  }`}
                  disabled={plan.id === currentPlan}
                >
                  {plan.id === currentPlan ? '当前方案' : '立即升级'}
                  {plan.id !== currentPlan && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Merchant Service */}
        <Card className="design-panel mb-12 rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              商家专属服务
            </CardTitle>
            <CardDescription>
              如果你是周边制作商家，我们提供更多专属服务
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="design-muted-card rounded-lg p-4">
                <Users className="mb-2 h-8 w-8 text-[#ff6848]" />
                <h4 className="font-medium mb-1">供应链对接</h4>
                <p className="text-sm text-[#6d6256]">
                  匹配优质原材料供应商和代工厂
                </p>
              </div>
              
              <div className="design-muted-card rounded-lg p-4">
                <Headphones className="mb-2 h-8 w-8 text-[#31c5ff]" />
                <h4 className="font-medium mb-1">专属客服</h4>
                <p className="text-sm text-[#6d6256]">
                  1对1技术支持和订单跟进
                </p>
              </div>
              
              <div className="design-muted-card rounded-lg p-4">
                <Box className="mb-2 h-8 w-8 text-emerald-600" />
                <h4 className="font-medium mb-1">批量订单</h4>
                <p className="text-sm text-[#6d6256]">
                  支持大批量定制生产
                </p>
              </div>
            </div>
            
            <Button className="design-primary">
              <Building2 className="w-4 h-4 mr-2" />
              申请商家资质
            </Button>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="design-panel rounded-lg">
          <CardHeader>
            <CardTitle>常见问题</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="design-muted-card rounded-lg p-4">
              <h4 className="font-medium mb-2">额度多久重置？</h4>
              <p className="text-sm text-[#6d6256]">
                每日额度在每天00:00重置，未使用的额度不会累积到下一天
              </p>
            </div>
            
            <div className="design-muted-card rounded-lg p-4">
              <h4 className="font-medium mb-2">如何升级套餐？</h4>
              <p className="text-sm text-[#6d6256]">
                点击「立即升级」按钮，选择支付方式完成付款即可立即生效
              </p>
            </div>
            
            <div className="design-muted-card rounded-lg p-4">
              <h4 className="font-medium mb-2">商家资质如何申请？</h4>
              <p className="text-sm text-[#6d6256]">
                在建模图生成页面填写商家信息，或直接联系客服提交资质证明
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
