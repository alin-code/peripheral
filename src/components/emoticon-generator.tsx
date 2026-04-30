'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScannerCardStream } from '@/components/ui/scanner-card-stream';
import { 
  ArrowLeft, 
  Download, 
  CheckCircle2,
  MessageCircle,
  Instagram,
  Sparkles,
  Link
} from 'lucide-react';
import FileUploader from './file-uploader';

interface EmoticonGeneratorProps {
  onBack: () => void;
  currentUser?: { id: string; email: string; username?: string } | null;
  onRequireLogin?: () => void;
}

interface Emoticon {
  id: string;
  url: string;
  caption: string;
  platform: 'wechat' | 'douyin';
  emotionType?: string;
}

export default function EmoticonGenerator({
  onBack,
  currentUser,
  onRequireLogin,
}: EmoticonGeneratorProps) {
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [uploadedFile, setUploadedFile] = useState<{ preview: string; name: string } | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [sceneDescription, setSceneDescription] = useState('');
  const [platform, setPlatform] = useState<'wechat' | 'douyin' | 'both'>('both');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [emoticons, setEmoticons] = useState<Emoticon[]>([]);
  const [error, setError] = useState('');
  const loadingCardImages = uploadedFile?.preview
    ? [uploadedFile.preview]
    : imageUrl
      ? [imageUrl]
      : undefined;

  const handleFileSelect = (file: File, previewUrl: string) => {
    setUploadedFile({ preview: previewUrl, name: file.name });
    setImageUrl(previewUrl); // 使用 base64 预览作为临时URL
    setError('');
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
    setImageUrl('');
  };

  const handleGenerate = async () => {
    if (!currentUser) {
      setError('请先登录后再生成表情包');
      toast.error('请先登录后再生成表情包');
      onRequireLogin?.();
      return;
    }

    // 检查是否有图片素材
    if (!uploadedFile && !imageUrl) {
      setError('请上传图片或输入图片URL');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setError('');
    setEmoticons([]);

    try {
      // 模拟进度
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/emoticon/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: uploadedFile ? undefined : imageUrl, // base64直接传，其他用URL
          base64Data: uploadedFile ? uploadedFile.preview : undefined,
          characterName: characterName || undefined,
          sceneDescription: sceneDescription || undefined,
          count: 3,
          platform
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (data.success) {
        setEmoticons(data.emoticons);
      } else {
        setError(data.error || '生成失败，请重试');
        if (response.status === 401) {
          onRequireLogin?.();
        }
      }
    } catch (err) {
      setError('网络错误，请检查连接后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (emoticon: Emoticon) => {
    try {
      const response = await fetch(emoticon.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `emoticon-${emoticon.id}.png`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('下载失败:', err);
    }
  };

  return (
    <div className="design-page">
      <div className="design-shell">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 text-white/78 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回服务选择
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-[#ff6848] p-2">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
          <h1 className="text-3xl font-semibold tracking-normal text-white">
              电影表情包生成
            </h1>
          </div>
          <p className="text-white/62">
            上传素材并生成表情包
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card className="design-panel rounded-lg">
            <CardHeader>
              <CardTitle>素材上传</CardTitle>
              <CardDescription>支持上传或粘贴链接</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Input Mode Tabs */}
              <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'upload' | 'url')}>
                <TabsList className="grid h-auto w-full grid-cols-2 rounded-lg border border-[#e2d4cb] bg-[#eaded7] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                  <TabsTrigger
                    value="upload"
                    className="h-11 gap-2 rounded-md border border-transparent text-sm font-semibold text-[#5f514c] data-[state=active]:border-[#171513] data-[state=active]:bg-[#171513] data-[state=active]:text-white data-[state=active]:shadow-[0_8px_20px_rgba(29,20,19,0.18)]"
                  >
                    <Sparkles className="w-4 h-4" />
                    本地上传
                  </TabsTrigger>
                  <TabsTrigger
                    value="url"
                    className="h-11 gap-2 rounded-md border border-transparent text-sm font-semibold text-[#5f514c] data-[state=active]:border-[#171513] data-[state=active]:bg-[#171513] data-[state=active]:text-white data-[state=active]:shadow-[0_8px_20px_rgba(58,42,37,0.18)]"
                  >
                    <Link className="w-4 h-4" />
                    图片链接
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="mt-4">
                  <div className="space-y-3">
                    <FileUploader
                      onFileSelect={handleFileSelect}
                      onFileRemove={handleFileRemove}
                      currentFile={uploadedFile}
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      maxSizeMB={10}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="url" className="mt-4 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">图片 URL</Label>
                    <div className="relative">
                      <Input
                        id="imageUrl"
                        type="url"
                        placeholder="https://example.com/movie-poster.jpg"
                        value={imageUrl}
                        className="design-input"
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                          setUploadedFile(null);
                        }}
                      />
                      <Link className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500">建议高清图片</p>
                  </div>
                  
                  {/* URL Preview */}
                  {imageUrl && (
                    <div className="relative aspect-square max-w-[200px] mx-auto rounded-lg border bg-gray-50 dark:bg-gray-800 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt="URL Preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '';
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Character Name */}
              <div className="space-y-2">
                <Label htmlFor="characterName">角色名称（可选）</Label>
                <Input
                  id="characterName"
                  placeholder="例如：蜘蛛侠、钢铁侠"
                  value={characterName}
                  className="design-input"
                  onChange={(e) => setCharacterName(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  可选填写
                </p>
              </div>

              {/* Scene Description */}
              <div className="space-y-2">
                <Label htmlFor="sceneDescription">场景描述（可选）</Label>
                <Textarea
                  id="sceneDescription"
                  placeholder="描述你想要的场景，例如：主角举剑的经典画面、角色惊讶的表情特写"
                  value={sceneDescription}
                  className="design-input"
                  onChange={(e) => setSceneDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Platform Selection */}
              <div className="space-y-2">
                <Label>适配平台</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={platform === 'wechat' ? 'default' : 'outline'}
                    onClick={() => setPlatform('wechat')}
                    className={
                      platform === 'wechat'
                        ? 'border-[#171513] bg-[#171513] text-white shadow-sm hover:bg-[#2a2320]'
                        : 'design-secondary'
                    }
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    微信
                  </Button>
                  <Button
                    variant={platform === 'douyin' ? 'default' : 'outline'}
                    onClick={() => setPlatform('douyin')}
                    className={
                      platform === 'douyin'
                        ? 'border-[#171513] bg-[#171513] text-white shadow-sm hover:bg-[#2a2320]'
                        : 'design-secondary'
                    }
                  >
                    <Instagram className="w-4 h-4 mr-2" />
                    抖音
                  </Button>
                  <Button
                    variant={platform === 'both' ? 'default' : 'outline'}
                    onClick={() => setPlatform('both')}
                    className={
                      platform === 'both'
                        ? 'border-[#ff6848] bg-[#ff6848] text-white shadow-sm hover:bg-[#e8583d]'
                        : 'design-secondary'
                    }
                  >
                    双平台
                  </Button>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || (!uploadedFile && !imageUrl)}
                className="design-primary w-full font-semibold"
                size="lg"
              >
                {isGenerating ? (
                  <>正在生成...</>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    开始生成
                  </>
                )}
              </Button>

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Tips */}
                <div className="design-muted-card rounded-lg p-4">
                <h4 className="mb-2 font-medium text-[#2f271f]">
                  提示
                </h4>
                <ul className="space-y-1 text-sm text-[#6d6256]">
                  <li>• 高清原图效果更好</li>
                  <li>• 可下载 PNG</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card className="design-panel rounded-lg">
            <CardHeader>
              <CardTitle>生成结果</CardTitle>
              <CardDescription>
                {isGenerating
                  ? '正在解析素材并生成表情包'
                  : emoticons.length > 0 
                  ? `已生成 ${emoticons.length} 个表情包`
                  : '结果会显示在这里'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {isGenerating ? (
                <div className="space-y-5">
                  <ScannerCardStream
                    height={320}
                    cardImages={loadingCardImages}
                    repeat={6}
                    initialSpeed={170}
                    className="rounded-lg"
                  />

                  <div className="rounded-lg border border-[#eadfd2] bg-[#fbf7f1] p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">生成进度</span>
                      <span className="font-semibold text-[#ff6848]">{progress}%</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      正在提取角色特征、组合文案并生成多张适配图。
                    </p>
                  </div>
                </div>
              ) : emoticons.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-[#f1e8dc]">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    暂无生成结果
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {emoticons.map((emoticon, index) => (
                    <div 
                      key={emoticon.id}
                      className="relative rounded-lg border border-[#eadfd2] bg-white p-4 transition-shadow hover:shadow-lg"
                    >
                      <div className="flex gap-4">
                        {/* Image Preview */}
                        <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-[#f1e8dc]">
                          <img
                            src={emoticon.url}
                            alt={`表情包 ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={emoticon.platform === 'wechat' ? 'default' : 'secondary'}
                              className={emoticon.platform === 'wechat' ? 'bg-green-500' : 'bg-black'}
                            >
                              {emoticon.platform === 'wechat' ? '微信' : '抖音'}
                            </Badge>
                            <Badge variant="outline">
                              {emoticon.emotionType || '标准表情'}
                            </Badge>
                          </div>
                          
                          <div className="text-lg font-semibold text-[#171513]">
                            {emoticon.caption}
                          </div>
                          
                          <p className="text-sm text-[#6d6256]">
                            适配平台：{emoticon.platform === 'wechat' ? '微信表情商店' : '抖音贴纸'}
                          </p>
                        </div>

                        {/* Download Button */}
                        <Button
                          variant="outline"
                          onClick={() => downloadImage(emoticon)}
                          className="design-primary flex-shrink-0 rounded-lg px-4 text-sm font-semibold"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          下载
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Success Message */}
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        生成完成！
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        点击下载按钮保存到本地使用
                      </p>
                    </div>
                  </div>

                  {/* Platform适配说明 */}
                  <div className="design-muted-card rounded-lg p-4">
                    <h4 className="mb-2 font-medium text-[#2f271f]">
                      平台说明
                    </h4>
                    <div className="space-y-2 text-sm text-[#6d6256]">
                      <p><strong>微信：</strong>1:1</p>
                      <p><strong>抖音：</strong>1:1 / 9:16</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Subscription Hint */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#eadfd2] bg-white/90 px-6 py-3 shadow-md backdrop-blur-sm">
            <span className="text-sm text-[#5f5549]">
              当前额度：
            </span>
            <Badge className="bg-[#ff6848]">表情包 1/10</Badge>
            <span className="text-sm text-gray-500">|</span>
            <Button variant="link" className="h-auto p-0 text-sm text-[#171513]">
              升级 →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
