'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Upload, 
  Loader2, 
  CheckCircle2,
  Box,
  Ruler,
  Palette,
  Building2,
  Sparkles,
  FileText,
  Layers
} from 'lucide-react';

interface ModelGeneratorProps {
  onBack: () => void;
}

interface ModelData {
  characterName: string;
  scale: string;
  referenceImage?: string | null;
  views: {
    front: string;
    side: string;
    back: string;
  };
  dimensions: Record<string, string>;
  material: {
    材质名称: string;
    材质描述: string;
    优点: string;
    缺点: string;
    推荐比例: string;
  };
  productionNotes: string[];
  fileFormat: {
    推荐格式: string[];
    建议精度: string;
    分辨率: string;
  };
  businessInfo?: {
    商家名称: string;
    业务范围: string;
    联系方式: string;
    订单入口: string;
  } | null;
}

export default function ModelGenerator({ onBack }: ModelGeneratorProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [material, setMaterial] = useState<'resin' | 'plush' | 'vinyl' | 'mixed'>('mixed');
  const [scale, setScale] = useState<'1:6' | '1:8' | '1:12'>('1:8');
  
  // 商家信息
  const [isMerchant, setIsMerchant] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [businessScope, setBusinessScope] = useState('');
  const [businessContact, setBusinessContact] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modelData, setModelData] = useState<ModelData | null>(null);
  const [error, setError] = useState('');

  const materialOptions = [
    { value: 'resin', name: 'PVC软胶/ABS树脂', desc: '精细雕刻，高端定位' },
    { value: 'plush', name: '高级毛绒面料', desc: '可爱风格，柔软触感' },
    { value: 'vinyl', name: '乙烯基塑料', desc: '潮流手办，可动关节' },
    { value: 'mixed', name: '混合材质', desc: '最佳细节，高端把玩' }
  ];

  const scaleOptions = [
    { value: '1:6', desc: '约29cm（经典比例）' },
    { value: '1:8', desc: '约22cm（主流手办）' },
    { value: '1:12', desc: '约15cm（迷你收藏）' }
  ];

  const handleGenerate = async () => {
    if (!characterName) {
      setError('请提供角色名称');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setError('');
    setModelData(null);

    try {
      // 模拟进度
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 8, 90));
      }, 400);

      const response = await fetch('/api/model/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: imageUrl || undefined,
          characterName,
          material,
          scale,
          businessInfo: isMerchant ? {
            name: businessName,
            scope: businessScope,
            contact: businessContact
          } : undefined
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (data.success) {
        setModelData(data.model);
      } else {
        setError(data.error || '生成失败，请重试');
      }
    } catch (err) {
      setError('网络错误，请检查连接后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回服务选择
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <Box className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              周边建模图生成
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            为周边制作商家输出标准建模图，包含三视图、尺寸标注、材质建议
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>基础信息</CardTitle>
                <CardDescription>
                  提供角色素材和基本信息用于建模
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Image URL */}
                <div className="space-y-2">
                  <Label htmlFor="modelImageUrl">角色素材 URL</Label>
                  <div className="relative">
                    <Input
                      id="modelImageUrl"
                      type="url"
                      placeholder="https://example.com/character.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                    <Upload className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">
                    高清原图可提高建模精度，建议≥1080×1080
                  </p>
                </div>

                {/* Character Name */}
                <div className="space-y-2">
                  <Label htmlFor="modelCharacterName">
                    角色名称 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="modelCharacterName"
                    placeholder="例如：钢铁侠、迪士尼公主"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                  />
                </div>

                {/* Material Selection */}
                <div className="space-y-2">
                  <Label>材质偏好</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {materialOptions.map(option => (
                      <Button
                        key={option.value}
                        variant={material === option.value ? 'default' : 'outline'}
                        onClick={() => setMaterial(option.value as any)}
                        className={material === option.value ? 'bg-blue-500 hover:bg-blue-600' : ''}
                        size="sm"
                      >
                        <Palette className="w-4 h-4 mr-1" />
                        {option.name}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {materialOptions.find(m => m.value === material)?.desc}
                  </p>
                </div>

                {/* Scale Selection */}
                <div className="space-y-2">
                  <Label>模型比例</Label>
                  <div className="flex gap-2">
                    {scaleOptions.map(option => (
                      <Button
                        key={option.value}
                        variant={scale === option.value ? 'default' : 'outline'}
                        onClick={() => setScale(option.value as any)}
                        className={scale === option.value ? 'bg-cyan-500 hover:bg-cyan-600' : ''}
                      >
                        <Ruler className="w-4 h-4 mr-1" />
                        {option.value}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {scaleOptions.find(s => s.value === scale)?.desc}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Merchant Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      商家信息（可选）
                    </CardTitle>
                    <CardDescription>
                      完善商家信息可获取更多技术支持
                    </CardDescription>
                  </div>
                  <Button
                    variant={isMerchant ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsMerchant(!isMerchant)}
                  >
                    {isMerchant ? '已启用' : '启用'}
                  </Button>
                </div>
              </CardHeader>
              
              {isMerchant && (
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">商家名称</Label>
                    <Input
                      id="businessName"
                      placeholder="例如：某某手办工作室"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessScope">业务范围</Label>
                    <Textarea
                      id="businessScope"
                      placeholder="例如：树脂手办制作、PVC可动人偶、景品代工"
                      value={businessScope}
                      onChange={(e) => setBusinessScope(e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessContact">联系方式</Label>
                    <Input
                      id="businessContact"
                      placeholder="电话/微信/邮箱"
                      value={businessContact}
                      onChange={(e) => setBusinessContact(e.target.value)}
                    />
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      💡 完善商家信息后，我们将为你匹配供应链资源并提供订单对接服务
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  正在生成建模图...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  开始生成建模图
                </>
              )}
            </Button>

            {/* Progress */}
            {isGenerating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">生成进度</span>
                  <span className="text-blue-600">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Output Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                建模图输出
              </CardTitle>
              <CardDescription>
                {modelData 
                  ? '建模图已生成，可直接用于生产'
                  : '点击生成后将在这里展示标准建模文档'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {!modelData ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Box className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    暂无建模图
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    请填写信息并点击生成按钮
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Reference Image */}
                  {modelData.referenceImage && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        参考图
                      </Label>
                      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        <img
                          src={modelData.referenceImage}
                          alt="建模参考图"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Character Info */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{modelData.characterName}</h3>
                      <Badge className="bg-blue-500">{modelData.scale}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      材质：{modelData.material.材质名称}
                    </p>
                  </div>

                  {/* Dimensions */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Ruler className="w-4 h-4" />
                      关键尺寸（单位：cm）
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(modelData.dimensions)
                        .filter(([key]) => !['单位', '备注'].includes(key))
                        .map(([key, value]) => (
                          <div key={key} className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                            <div className="text-xs text-gray-500 mb-1">{key}</div>
                            <div className="font-semibold text-blue-600">{value}</div>
                          </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      {modelData.dimensions.备注}
                    </p>
                  </div>

                  {/* Three Views */}
                  <div className="space-y-2">
                    <Label>三视图描述</Label>
                    <div className="space-y-3">
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="font-medium text-sm mb-1 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">正面</Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {modelData.views.front}
                        </p>
                      </div>
                      
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="font-medium text-sm mb-1 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">侧面</Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {modelData.views.side}
                        </p>
                      </div>
                      
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="font-medium text-sm mb-1 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">背面</Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {modelData.views.back}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Material Info */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      材质建议
                    </Label>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg space-y-2">
                      <p className="text-sm font-medium">{modelData.material.材质名称}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {modelData.material.材质描述}
                      </p>
                      <div className="flex gap-4 text-xs">
                        <span className="text-green-600">✓ {modelData.material.优点}</span>
                        <span className="text-orange-600">✗ {modelData.material.缺点}</span>
                      </div>
                      <p className="text-xs text-blue-600">
                        推荐比例：{modelData.material.推荐比例}
                      </p>
                    </div>
                  </div>

                  {/* Production Notes */}
                  <div className="space-y-2">
                    <Label>生产工艺提示</Label>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      {modelData.productionNotes.map((note, i) => (
                        <li key={i}>{note}</li>
                      ))}
                    </ul>
                  </div>

                  {/* File Format */}
                  <div className="space-y-2">
                    <Label>文件格式要求</Label>
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {modelData.fileFormat.推荐格式.map((format: string) => (
                          <Badge key={format} variant="secondary">{format}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        建议精度：{modelData.fileFormat.建议精度} | 分辨率：{modelData.fileFormat.分辨率}
                      </p>
                    </div>
                  </div>

                  {/* Success Message */}
                  <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        建模图生成完成！
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        可直接用于生产，如需完整工程文件请联系客服
                      </p>
                    </div>
                  </div>

                  {/* Business Info */}
                  {modelData.businessInfo && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2">
                        商家对接信息
                      </h4>
                      <div className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                        <p>商家名称：{modelData.businessInfo.商家名称}</p>
                        <p>业务范围：{modelData.businessInfo.业务范围}</p>
                        <p>联系方式：{modelData.businessInfo.联系方式}</p>
                        <p className="font-medium mt-2">✓ {modelData.businessInfo.订单入口}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Subscription Hint */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              当前订阅额度：
            </span>
            <Badge className="bg-blue-500">建模图 1/5</Badge>
            <span className="text-sm text-gray-500">|</span>
            <Button variant="link" className="text-sm text-blue-600 p-0 h-auto">
              升级解锁更多额度 →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
