import { NextRequest, NextResponse } from 'next/server';

// 文件大小限制 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// 支持的图片格式
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

interface UploadRequest {
  imageData?: string;  // Base64 编码的图片数据
  filename?: string;  // 文件名
}

// 生成随机文件名
function generateFilename(originalName?: string): string {
  const ext = originalName?.split('.').pop() || 'png';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `upload_${timestamp}_${random}.${ext}`;
}

// 文件上传API
export async function POST(request: NextRequest) {
  try {
    const body: UploadRequest = await request.json();
    const { imageData, filename } = body;

    if (!imageData) {
      return NextResponse.json(
        { success: false, error: '请提供图片数据' },
        { status: 400 }
      );
    }

    // 提取图片类型和实际数据
    const matches = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        { success: false, error: '无效的图片数据格式' },
        { status: 400 }
      );
    }

    const mimeType = `image/${matches[1]}`;
    const base64Data = matches[2];

    // 验证文件类型
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { success: false, error: '不支持的图片格式，请上传 JPG、PNG、WebP 或 GIF' },
        { status: 400 }
      );
    }

    // 验证文件大小
    const bufferSize = Buffer.byteLength(base64Data, 'base64');
    if (bufferSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: '文件大小超过限制（最大10MB）' },
        { status: 400 }
      );
    }

    const newFilename = generateFilename(filename);

    return NextResponse.json({
      success: true,
      message: '图片上传成功',
      imageData: `data:${mimeType};base64,${base64Data}`,
      filename: newFilename,
      size: bufferSize,
      mimeType: mimeType
    });

  } catch (error) {
    console.error('文件上传错误:', error);
    return NextResponse.json(
      { success: false, error: '服务异常，请稍后重试' },
      { status: 500 }
    );
  }
}

// 获取上传限制信息
export async function GET() {
  return NextResponse.json({
    maxFileSize: MAX_FILE_SIZE,
    maxFileSizeMB: MAX_FILE_SIZE / (1024 * 1024),
    allowedTypes: ALLOWED_TYPES,
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  });
}
