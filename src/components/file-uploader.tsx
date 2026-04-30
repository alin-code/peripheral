'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File, previewUrl: string) => void;
  onFileRemove?: () => void;
  accept?: string;
  maxSizeMB?: number;
  currentFile?: { preview: string; name: string } | null;
}

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

export default function FileUploader({
  onFileSelect,
  onFileRemove,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  maxSizeMB = 10,
  currentFile
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
    success: false
  });
  const [preview, setPreview] = useState<string | null>(currentFile?.preview || null);
  const [fileName, setFileName] = useState<string>(currentFile?.name || '');

  const handleFile = useCallback((file: File) => {
    // 验证文件类型
    if (!accept.split(',').some(type => file.type.includes(type.split('/')[1]))) {
      setUploadState(prev => ({ ...prev, error: '不支持的图片格式' }));
      return;
    }

    // 验证文件大小
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadState(prev => ({ ...prev, error: `文件大小超过${maxSizeMB}MB限制` }));
      return;
    }

    // 创建预览
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewUrl = e.target?.result as string;
      setPreview(previewUrl);
      setFileName(file.name);
      setUploadState({ uploading: false, progress: 0, error: null, success: true });
      onFileSelect(file, previewUrl);
    };
    reader.onerror = () => {
      setUploadState(prev => ({ ...prev, error: '文件读取失败' }));
    };
    reader.readAsDataURL(file);
  }, [accept, maxSizeMB, onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    setPreview(null);
    setFileName('');
    setUploadState({ uploading: false, progress: 0, error: null, success: false });
    onFileRemove?.();
  }, [onFileRemove]);

  if (preview) {
    return (
      <div className="relative rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        {/* Preview Image */}
        <div className="relative aspect-square max-w-[200px] mx-auto mb-3">
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full rounded-lg object-contain"
          />
          {uploadState.success && (
            <div className="absolute -right-2 -top-2 rounded-full bg-emerald-500 p-1">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="text-center space-y-2">
          <p className="mx-auto max-w-[200px] truncate text-sm font-medium text-[#2f271f]">
            {fileName}
          </p>
          <p className="text-xs text-[#6d6256]">
            图片已准备就绪
          </p>
        </div>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          className="absolute right-2 top-2 h-8 w-8 bg-white/85 hover:bg-white"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Upload Progress */}
        {uploadState.uploading && (
          <div className="mt-3">
            <Progress value={uploadState.progress} className="h-1" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-lg border border-dashed bg-[#fbf7f1] transition-all duration-200 ${
        isDragging 
          ? 'border-[#ff6848] bg-[#fff1eb]' 
          : 'border-[#decfbd] hover:border-[#171513]'
      } ${uploadState.error ? 'border-red-400' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      <div className="flex flex-col items-center justify-center py-8 px-4">
        {uploadState.uploading ? (
          <>
            <Loader2 className="mb-3 h-10 w-10 animate-spin text-[#ff6848]" />
            <p className="text-sm text-[#6d6256]">
              上传中... {uploadState.progress}%
            </p>
            <Progress value={uploadState.progress} className="w-32 mt-2" />
          </>
        ) : uploadState.error ? (
          <>
            <AlertCircle className="mb-3 h-10 w-10 text-red-500" />
            <p className="text-sm text-red-600">
              {uploadState.error}
            </p>
            <p className="mt-1 text-xs text-[#6d6256]">
              请重新选择文件上传
            </p>
          </>
        ) : (
          <>
            <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-lg ${
              isDragging 
                ? 'bg-[#ffe1d7]' 
                : 'bg-white'
            }`}>
              {isDragging ? (
                <Upload className="h-8 w-8 text-[#ff6848]" />
              ) : (
                <ImageIcon className="h-8 w-8 text-[#8a7f73]" />
              )}
            </div>
            
            <p className="mb-1 text-sm font-medium text-[#2f271f]">
              {isDragging ? '释放以上传文件' : '点击或拖拽上传图片'}
            </p>
            
            <p className="text-xs text-[#6d6256]">
              支持 JPG、PNG、WebP、GIF，最大 {maxSizeMB}MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}
