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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 text-gray-700 hover:bg-white/70"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回服务选择
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              电影表情包生成
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            上传素材并生成表情包
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card>
            <CardHeader>
              <CardTitle>素材上传</CardTitle>
              <CardDescription>支持上传或粘贴链接</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Input Mode Tabs */}
              <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'upload' | 'url')}>
                <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl border border-[#e2d4cb] bg-[#eaded7] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                  <TabsTrigger
                    value="upload"
                    className="h-11 gap-2 rounded-xl border border-transparent text-sm font-semibold text-[#5f514c] data-[state=active]:border-[#2b201d] data-[state=active]:bg-[#1d1413] data-[state=active]:text-white data-[state=active]:shadow-[0_8px_20px_rgba(29,20,19,0.18)]"
                  >
                    <Sparkles className="w-4 h-4" />
                    本地上传
                  </TabsTrigger>
                  <TabsTrigger
                    value="url"
                    className="h-11 gap-2 rounded-xl border border-transparent text-sm font-semibold text-[#5f514c] data-[state=active]:border-[#4a342d] data-[state=active]:bg-[#3a2a25] data-[state=active]:text-white data-[state=active]:shadow-[0_8px_20px_rgba(58,42,37,0.18)]"
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
                  onChange={(e) => setSceneDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Platform Selection */}
              <div className="space-y-2">
                <Label>适配平台</Label>
                <div className="flex gap-2">
                  <Button
                    variant={platform === 'wechat' ? 'default' : 'outline'}
                    onClick={() => setPlatform('wechat')}
                    className={
                      platform === 'wechat'
                        ? 'border-green-600 bg-green-600 text-white shadow-sm hover:bg-green-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700'
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
                        ? 'border-black bg-black text-white shadow-sm hover:bg-gray-900'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-black hover:bg-gray-100 hover:text-black'
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
                        ? 'border-purple-600 bg-purple-600 text-white shadow-sm hover:bg-purple-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-purple-500 hover:bg-purple-50 hover:text-purple-700'
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
                className="w-full border border-pink-300/40 bg-gradient-to-r from-pink-500 to-purple-500 font-semibold text-white shadow-[0_12px_30px_rgba(191,90,242,0.22)] hover:from-pink-600 hover:to-purple-600"
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
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Tips */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                  提示
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                  <li>• 高清原图效果更好</li>
                  <li>• 可下载 PNG</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card>
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
                    className="rounded-[30px]"
                  />

                  <div className="rounded-2xl border border-purple-200/50 bg-gradient-to-r from-pink-50 via-white to-purple-50 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">生成进度</span>
                      <span className="font-semibold text-purple-600">{progress}%</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      正在提取角色特征、组合文案并生成多张适配图。
                    </p>
                  </div>
                </div>
              ) : emoticons.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
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
                      className="relative p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex gap-4">
                        {/* Image Preview */}
                        <div className="w-32 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
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
                          
                          <div className="text-lg font-medium text-gray-900 dark:text-white">
                            {emoticon.caption}
                          </div>
                          
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            适配平台：{emoticon.platform === 'wechat' ? '微信表情商店' : '抖音贴纸'}
                          </p>
                        </div>

                        {/* Download Button */}
                        <Button
                          variant="outline"
                          onClick={() => downloadImage(emoticon)}
                          className="flex-shrink-0 rounded-xl border-[#2e221f] bg-[#2a1d1a] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(42,29,26,0.2)] hover:border-[#1d1413] hover:bg-[#1d1413]"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          下载
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Success Message */}
                  <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
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
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2">
                      平台说明
                    </h4>
                    <div className="space-y-2 text-sm text-purple-700 dark:text-purple-400">
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
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              当前额度：
            </span>
            <Badge className="bg-pink-500">表情包 1/10</Badge>
            <span className="text-sm text-gray-500">|</span>
            <Button variant="link" className="text-sm text-purple-600 p-0 h-auto">
              升级 →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
