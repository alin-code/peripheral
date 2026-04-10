'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Box, 
  Zap, 
  Shield, 
  Clock,
  Sparkles,
  Users
} from 'lucide-react';

interface ServiceSelectProps {
  onSelectService: (service: 'emoticon' | 'model') => void;
}

export default function ServiceSelect({ onSelectService }: ServiceSelectProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              AI智能生成服务
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            电影周边建模与表情包定制
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            基于你喜爱的电影角色，AI智能生成高质量表情包和周边建模图
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Emoticon Service */}
          <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 hover:border-pink-300 dark:hover:border-pink-600">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <CardHeader className="relative pb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl shadow-lg">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">表情包生成</CardTitle>
                  <CardDescription>网络冲浪者专属</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                根据电影视频/图片，生成3-5个高质量表情包，保留角色核心特征，适配微信/抖音平台
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>高清画质，无模糊</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>批量生成3-5个</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>角色特征完整保留</span>
                </div>
              </div>

              <Button 
                onClick={() => onSelectService('emoticon')}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                size="lg"
              >
                立即生成表情包
              </Button>

              <div className="flex items-center gap-2 justify-center">
                <Badge variant="secondary" className="text-xs">适配微信</Badge>
                <Badge variant="secondary" className="text-xs">适配抖音</Badge>
                <Badge variant="secondary" className="text-xs">趣味文字</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Model Service */}
          <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 hover:border-blue-300 dark:hover:border-blue-600">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <CardHeader className="relative pb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <Box className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">周边建模图</CardTitle>
                  <CardDescription>商家制作专属</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                为周边制作商家输出标准建模图，包含三视图、尺寸标注、材质建议，可直接用于生产
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Box className="w-4 h-4 text-blue-500" />
                  <span>三视图（正/侧/背）</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>关键尺寸标注</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>材质与工艺说明</span>
                </div>
              </div>

              <Button 
                onClick={() => onSelectService('model')}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                size="lg"
              >
                立即生成建模图
              </Button>

              <div className="flex items-center gap-2 justify-center">
                <Badge variant="secondary" className="text-xs">工程图纸标准</Badge>
                <Badge variant="secondary" className="text-xs">可落地生产</Badge>
                <Badge variant="secondary" className="text-xs">批量订单</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-gray-200">
            为什么选择我们的服务
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold mb-1">快速生成</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI智能分析，即时输出</p>
            </div>
            
            <div className="p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold mb-1">精准还原</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">保留角色核心特征</p>
            </div>
            
            <div className="p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl">
              <div className="text-3xl mb-2">📐</div>
              <h3 className="font-semibold mb-1">标准规范</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">符合生产标准</p>
            </div>
            
            <div className="p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-semibold mb-1">安全可靠</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">版权合规，服务稳定</p>
            </div>
          </div>
        </div>

        {/* Subscription Hint */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            💡 提示：当前为免费试用额度，生成次数有限
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              已用额度：
            </span>
            <Badge className="bg-purple-500">表情包 0/10</Badge>
            <Badge className="bg-blue-500">建模图 0/5</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
