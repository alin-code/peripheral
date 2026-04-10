import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 表情包配置
const EMOTICON_CAPTIONS = {
  wechat: [
    "绝了！",
    "我太难了",
    "救命🆘",
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
  imageUrl?: string;
  characterName?: string;
  sceneDescription?: string;
  count?: number;
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

// 生成提示词
function generatePrompt(characterName?: string, sceneDescription?: string): string {
  let prompt = 'High quality emoticon/sticker, ';
  
  if (characterName) {
    prompt += `character "${characterName}", `;
  }
  
  if (sceneDescription) {
    prompt += `${sceneDescription}, `;
  }
  
  prompt += 'exaggerated expression, clear image, white or transparent background, ';
  prompt += 'suitable for messaging app stickers, vibrant colors, cartoon style, ';
  prompt += 'without text overlay';
  
  return prompt;
}

// 表情包生成API
export async function POST(request: NextRequest) {
  try {
    const body: EmoticonRequest = await request.json();
    const { imageUrl, characterName, sceneDescription, count = 3, platform = 'both' } = body;

    // 参数验证
    if (!imageUrl && !characterName && !sceneDescription) {
      return NextResponse.json(
        { success: false, error: '请提供图片URL或角色/场景描述' },
        { status: 400 }
      );
    }

    // 提取请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 初始化图片生成客户端
    const config = new Config();
    const client = new ImageGenerationClient(config, customHeaders);

    // 生成基础提示词
    const basePrompt = generatePrompt(characterName, sceneDescription);
    const captionCount = Math.min(Math.max(count, 3), 5);
    
    // 生成不同表情变体
    const emotionVariations = [
      'surprised expression, wide eyes, open mouth',
      'happy expression, big smile, closed eyes',
      'crazy expression, messed up hair, excited',
      'speechless expression, flat mouth, sweat drops',
      'angry expression, furrowed brows, red face'
    ];

    // 生成多个表情包
    const emoticonRequests = [];
    for (let i = 0; i < captionCount; i++) {
      const emotionPrompt = `${basePrompt}, ${emotionVariations[i % emotionVariations.length]}`;
      emoticonRequests.push({
        prompt: emotionPrompt,
        size: '2K',
        image: imageUrl ? [imageUrl] : undefined
      });
    }

    // 批量生成
    const responses = await client.batchGenerate(emoticonRequests);
    
    const emoticons: Array<{
      id: string;
      url: string;
      caption: string;
      platform: 'wechat' | 'douyin';
      emotionType: string;
    }> = [];
    const captions = getRandomCaptions(platform, captionCount);

    responses.forEach((response, index) => {
      const helper = client.getResponseHelper(response);
      if (helper.success && helper.imageUrls.length > 0) {
        const isWechat = platform === 'wechat' || platform === 'both';
        emoticons.push({
          id: `emoticon-${Date.now()}-${index}`,
          url: helper.imageUrls[0],
          caption: captions[index] || '',
          platform: isWechat ? 'wechat' : (index % 2 === 0 ? 'wechat' : 'douyin'),
          emotionType: emotionVariations[index % emotionVariations.length].split(' expression')[0]
        });
      }
    });

    if (emoticons.length === 0) {
      return NextResponse.json(
        { success: false, error: '表情包生成失败，请稍后重试' },
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
