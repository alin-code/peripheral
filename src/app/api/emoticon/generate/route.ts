import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';
import { requestArkImageGeneration } from '@/lib/ark';

// 表情包配置
const EMOTICON_CAPTIONS = {
  wechat: [
    "绝了！",
    "我太难了",
    "救命",
    "爱了爱了",
    "冲鸭！",
    "绝了绝了",
    "太香了",
    "笑死",
    "无语了",
    "OMG"
  ],
  douyin: [
    "绝了绝了",
    "家人们谁懂",
    "太上头了",
    "冲冲冲",
    "救命",
    "爱了",
    "绝了",
    "太牛了",
    "笑不活",
    "真的栓Q"
  ]
};

interface EmoticonRequest {
  imageUrl?: string;       // 图片URL
  base64Data?: string;     // Base64图片数据
  characterName?: string;  // 角色名称
  sceneDescription?: string; // 场景描述
  count?: number;          // 生成数量
  platform?: 'wechat' | 'douyin' | 'both';
}

// 随机获取表情文字
function getRandomCaptions(platform: string, count: number): string[] {
  const captions = platform === 'both' 
    ? [...EMOTICON_CAPTIONS.wechat, ...EMOTICON_CAPTIONS.douyin]
    : EMOTICON_CAPTIONS[platform as keyof typeof EMOTICON_CAPTIONS] || EMOTICON_CAPTIONS.wechat;
  
  const shuffled = [...captions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// 从base64提取MIME类型
function extractMimeType(base64Data: string): string | null {
  const match = base64Data.match(/^data:image\/(\w+);base64,/);
  return match ? `image/${match[1]}` : null;
}

// 从base64提取纯数据部分
function extractBase64Data(base64Data: string): string {
  return base64Data.replace(/^data:image\/\w+;base64,/, '');
}

// 生成提示词
function generatePrompt(characterName?: string, sceneDescription?: string, isReference = false): string {
  let prompt = '';
  
  if (isReference) {
    prompt = 'Based on the reference image, ';
  }
  
  prompt += 'High quality emoticon/sticker for messaging app, ';
  
  if (characterName) {
    prompt += `character "${characterName}", `;
  }
  
  if (sceneDescription) {
    prompt += `${sceneDescription}, `;
  }
  
  prompt += 'exaggerated expression, clear image, white or transparent background, ';
  prompt += 'vibrant colors, cartoon style, clean lines, ';
  prompt += 'without text overlay, multiple variations';
  
  return prompt;
}

// 表情包生成API
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token || !verifyAuthToken(token)) {
      return NextResponse.json(
        { success: false, error: '请先登录后再生成表情包' },
        { status: 401 }
      );
    }

    const body: EmoticonRequest = await request.json();
    const { imageUrl, base64Data, characterName, sceneDescription, count = 3, platform = 'both' } = body;

    // 参数验证 - 至少需要一种图片输入
    if (!imageUrl && !base64Data) {
      return NextResponse.json(
        { success: false, error: '请提供图片URL或上传图片文件' },
        { status: 400 }
      );
    }

    // 处理图片输入 - 优先使用base64
    let referenceImage: string | string[] | undefined;
    
    if (base64Data) {
      // Base64数据 - 直接作为参考图片
      referenceImage = [base64Data];
    } else if (imageUrl) {
      // URL数据
      referenceImage = [imageUrl];
    }

    // 生成基础提示词
    const basePrompt = generatePrompt(characterName, sceneDescription, !!referenceImage);
    const captionCount = Math.min(Math.max(count, 3), 5);
    
    // 生成不同表情变体的提示词
    const emotionVariations = [
      'surprised expression, wide eyes, open mouth, shocked',
      'happy expression, big smile, closed eyes, joyful',
      'funny expression, messed up hair, silly face',
      'speechless expression, flat mouth, sweat drops',
      'angry expression, furrowed brows, frustrated'
    ];

    // 生成多个表情包
    const emoticonRequests = [];
    for (let i = 0; i < captionCount; i++) {
      const emotionPrompt = `${basePrompt}, emotion variation ${i + 1}: ${emotionVariations[i % emotionVariations.length]}`;
      emoticonRequests.push({
        prompt: emotionPrompt,
        size: '2K',
        image: referenceImage
      });
    }

    console.log('正在生成表情包，使用参考图片:', referenceImage ? '是' : '否');
    console.log('提示词示例:', emoticonRequests[0]?.prompt.substring(0, 100) + '...');

    // 批量生成
    const responses = await Promise.all(
      emoticonRequests.map((item) =>
        requestArkImageGeneration({
          prompt: item.prompt,
          size: item.size,
          image: item.image,
          responseFormat: 'url',
          watermark: false,
        }),
      ),
    );
    
    const emoticons: Array<{
      id: string;
      url: string;
      caption: string;
      platform: 'wechat' | 'douyin';
      emotionType: string;
    }> = [];
    const captions = getRandomCaptions(platform, captionCount);

    responses.forEach((response, index) => {
      const imageUrls = response.data
        .filter((item) => !item.error && item.url)
        .map((item) => item.url as string);

      if (imageUrls.length > 0) {
        const isWechat = platform === 'wechat' || platform === 'both';
        emoticons.push({
          id: `emoticon-${Date.now()}-${index}`,
          url: imageUrls[0],
          caption: captions[index] || '',
          platform: isWechat ? 'wechat' : (index % 2 === 0 ? 'wechat' : 'douyin'),
          emotionType: emotionVariations[index % emotionVariations.length].split(',')[0]
        });
      }
    });

    if (emoticons.length === 0) {
      return NextResponse.json(
        { success: false, error: '表情包生成失败，请稍后重试或检查图片格式' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: emoticons.length,
      emoticons,
      platform适配: platform === 'both' ? '微信/抖音双平台' : (platform === 'wechat' ? '微信' : '抖音')
    });

  } catch (error) {
    console.error('表情包生成错误:', error);
    return NextResponse.json(
      { success: false, error: '服务异常，请稍后重试' },
      { status: 500 }
    );
  }
}

// 获取支持的平台
export async function GET() {
  return NextResponse.json({
    platforms: ['wechat', 'douyin', 'both'],
    maxCount: 5,
    minCount: 3,
    captionMaxLength: 10
  });
}
