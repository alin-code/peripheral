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
      <div className="relative rounded-lg border-2 border-dashed border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 p-4">
        {/* Preview Image */}
        <div className="relative aspect-square max-w-[200px] mx-auto mb-3">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-contain rounded-lg"
          />
          {uploadState.success && (
            <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px] mx-auto">
            {fileName}
          </p>
          <p className="text-xs text-gray-500">
            图片已准备就绪
          </p>
        </div>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          className="absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
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
      className={`relative rounded-lg border-2 border-dashed transition-all duration-200 ${
        isDragging 
          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
          : 'border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600'
      } ${uploadState.error ? 'border-red-400 dark:border-red-700' : ''}`}
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
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              上传中... {uploadState.progress}%
            </p>
            <Progress value={uploadState.progress} className="w-32 mt-2" />
          </>
        ) : uploadState.error ? (
          <>
            <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
            <p className="text-sm text-red-600 dark:text-red-400">
              {uploadState.error}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              请重新选择文件上传
            </p>
          </>
        ) : (
          <>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              isDragging 
                ? 'bg-purple-100 dark:bg-purple-900/30' 
                : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              {isDragging ? (
                <Upload className="w-8 h-8 text-purple-500" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isDragging ? '释放以上传文件' : '点击或拖拽上传图片'}
            </p>
            
            <p className="text-xs text-gray-500">
              支持 JPG、PNG、WebP、GIF，最大 {maxSizeMB}MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}
