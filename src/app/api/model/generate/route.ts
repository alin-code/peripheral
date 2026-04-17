import { NextRequest, NextResponse } from 'next/server';
import { requestArkImageGeneration } from '@/lib/ark';

interface ModelRequest {
  imageUrl?: string;
  base64Data?: string;
  characterName: string;
  material?: 'resin' | 'plush' | 'vinyl' | 'mixed';
  scale?: '1:6' | '1:8' | '1:12';
  businessInfo?: {
    name?: string;
    scope?: string;
    contact?: string;
  };
}

// 材质建议映射
const MATERIAL_SUGGESTIONS = {
  resin: {
    name: 'PVC软胶/ABS树脂',
    description: '适合精细雕刻，可表现复杂服饰纹理和金属配件',
    pros: '细节表现好，耐久性强，表面光滑',
    cons: '脆性较大，大尺寸需中空减重',
    recommendedScale: '1:6 或 1:8'
  },
  plush: {
    name: '高级毛绒面料',
    description: '适合可爱风格，柔软触感',
    pros: '手感好，安全无毒，适合儿童玩具',
    cons: '细节表现有限，配件需单独处理',
    recommendedScale: '1:8 或 1:12'
  },
  vinyl: {
    name: '乙烯基塑料',
    description: '适合潮流手办，可动关节设计',
    pros: '柔韧性好，色彩鲜艳，可动性强',
    cons: '细节精度较低，长期摆放可能变形',
    recommendedScale: '1:6 或 1:12'
  },
  mixed: {
    name: '混合材质（树脂+PVC）',
    description: '主体树脂+可动关节PVC，兼顾细节与把玩性',
    pros: '最佳细节表现，可动设计，高端定位',
    cons: '工艺复杂，成本较高',
    recommendedScale: '1:6'
  }
};

function generateModelPrompt({
  characterName,
  material,
  scale,
  businessInfo,
}: {
  characterName: string;
  material: keyof typeof MATERIAL_SUGGESTIONS;
  scale: string;
  businessInfo?: ModelRequest['businessInfo'];
}) {
  const materialInfo = MATERIAL_SUGGESTIONS[material] || MATERIAL_SUGGESTIONS.mixed;
  const businessNotes = [
    businessInfo?.name ? `商家名称：${businessInfo.name}` : '',
    businessInfo?.scope ? `业务方向：${businessInfo.scope}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return [
    `Based on the reference image, create a high-quality toy figure model sheet for the character "${characterName}".`,
    'Keep the character identity, facial features, hairstyle, clothing silhouette, accessories, and proportions recognizable.',
    'Generate a clean professional turnaround sheet showing front view, side view, and back view in one composition.',
    'Use a centered three-view layout, white or very light neutral background, strong contour clarity, consistent lighting, and production-friendly presentation.',
    'The character should look like a manufacturable collectible figure or statue reference, with clear costume structure and readable shape breakdown.',
    'Do not add decorative background elements, cinematic scene effects, watermark, logo, or unrelated props.',
    'Do not add measurement labels, paragraphs, UI panels, or extra design boards.',
    'Style: polished model sheet, product concept art, precise silhouette, high detail, clear edges, realistic material separation, studio presentation.',
    `Preferred material direction: ${materialInfo.name}. Material note: ${materialInfo.description}.`,
    `Target collectible scale: ${scale}.`,
    businessNotes,
  ]
    .filter(Boolean)
    .join('\n');
}

// 生成建模图描述
function generateModelDescription(characterName: string): {
  front: string;
  side: string;
  back: string;
  details: string;
} {
  return {
    front: `正面视图：${characterName}站立姿态，双脚与肩同宽，双手自然下垂或呈特定姿势。面部特征清晰，眼睛正视前方，嘴巴自然闭合或微张。服饰正面细节完整可见，如领口、纽扣、口袋等。整体比例协调，身体中心线垂直。`,
    side: `侧面视图：${characterName}右侧或左侧视角，可见完整的侧面轮廓。头部侧面形态、发型侧面轮廓清晰。手臂自然下垂位置可见手部轮廓。身体侧面厚度均匀，服饰侧面褶皱可见。腿部侧面可见膝盖弯曲角度（如有）。整体侧面线条流畅。`,
    back: `背面视图：${characterName}背面正视图，可见完整的后背轮廓。发型/头部后方细节清晰。背部中心线可见，服饰背面设计如拉链、口袋、装饰等。手臂自然下垂位置的后侧轮廓。后腿及脚跟轮廓清晰可见。整体背面对称或明确不对称设计。`,
    details: `细节说明：${characterName}角色特征分析——服装材质纹理建议采用刻线或水贴表现；金属配件（武器、装饰）建议独立开模后组装；面部细节需根据原画精雕；头发建议采用半透明PVC或单独部件表现层次感。关节设计建议隐藏式球关节，保持外观完整性。`
  };
}

// 计算标准尺寸
function calculateDimensions(scale: string): {
  height: number;
  headDiameter: number;
  chestWidth: number;
  waistWidth: number;
  shoulderWidth: number;
  armLength: number;
  legLength: number;
} {
  // 基础尺寸（假设角色身高175cm原型）
  const baseHeight = 175;
  const scaleValue = parseInt(scale.split(':')[1]);
  const scaledHeight = Math.round(baseHeight / scaleValue);
  
  return {
    height: scaledHeight,
    headDiameter: Math.round(scaledHeight * 0.19), // 头身比约1:5.2
    chestWidth: Math.round(scaledHeight * 0.35),
    waistWidth: Math.round(scaledHeight * 0.30),
    shoulderWidth: Math.round(scaledHeight * 0.40),
    armLength: Math.round(scaledHeight * 0.45),
    legLength: Math.round(scaledHeight * 0.50)
  };
}

// 周边建模图生成API
export async function POST(request: NextRequest) {
  try {
    const body: ModelRequest = await request.json();
    const { imageUrl, base64Data, characterName, material = 'mixed', scale = '1:8', businessInfo } = body;

    // 参数验证
    if (!characterName) {
      return NextResponse.json(
        { success: false, error: '请提供角色名称' },
        { status: 400 }
      );
    }

    // 至少需要一种图片输入
    if (!imageUrl && !base64Data) {
      return NextResponse.json(
        { success: false, error: '请提供图片URL或上传图片文件' },
        { status: 400 }
      );
    }

    // 处理图片输入
    let referenceImage: string | string[] | undefined;
    
    if (base64Data) {
      referenceImage = [base64Data];
    } else if (imageUrl) {
      referenceImage = [imageUrl];
    }

    // 生成建模参考图 - 使用参考图片
    const modelPrompt = generateModelPrompt({
      characterName,
      material,
      scale,
      businessInfo,
    });

    console.log('正在生成建模图，使用参考图片:', referenceImage ? '是' : '否');

    const response = await requestArkImageGeneration({
      prompt: modelPrompt,
      size: '4K',
      image: referenceImage,
      watermark: false
    });
    const imageUrls = response.data
      .filter((item) => !item.error && item.url)
      .map((item) => item.url as string);

    // 生成建模参数文档
    const descriptions = generateModelDescription(characterName);
    const dimensions = calculateDimensions(scale);
    const materialInfo = MATERIAL_SUGGESTIONS[material as keyof typeof MATERIAL_SUGGESTIONS] || MATERIAL_SUGGESTIONS.mixed;

    const modelData = {
      success: true,
      model: {
        characterName,
        scale,
        referenceImage: imageUrls.length > 0 ? imageUrls[0] : null,
        views: descriptions,
        dimensions: {
          高度: `${dimensions.height}cm`,
          头部直径: `${dimensions.headDiameter}cm`,
          胸宽: `${dimensions.chestWidth}cm`,
          腰宽: `${dimensions.waistWidth}cm`,
          肩宽: `${dimensions.shoulderWidth}cm`,
          臂长: `${dimensions.armLength}cm`,
          腿长: `${dimensions.legLength}cm`,
          单位: '厘米（cm）',
          备注: '基于标准7头身比例计算，实际尺寸可根据角色特征微调'
        },
        material: {
          材质名称: materialInfo.name,
          材质描述: materialInfo.description,
          优点: materialInfo.pros,
          缺点: materialInfo.cons,
          推荐比例: materialInfo.recommendedScale
        },
        productionNotes: [
          '1. 建议先制作1:1泥塑原型确认形态',
          '2. 复杂细节建议独立开模保证精度',
          '3. 关节设计需考虑把玩耐久性',
          '4. 涂装建议采用环保无毒水性漆',
          '5. 成品需通过安全标准检测（CE/CCC）'
        ],
        fileFormat: {
          推荐格式: ['STEP (.stp)', 'IGES (.igs)', 'FBX (.fbx)', 'OBJ (.obj)'],
          建议精度: '≥300 DPI（打印稿）',
          分辨率: '≥4096x4096 px（参考图）'
        },
        businessInfo: businessInfo ? {
          商家名称: businessInfo.name || '未提供',
          业务范围: businessInfo.scope || '未提供',
          联系方式: businessInfo.contact || '未提供',
          订单入口: '已记录商家信息，将有专人对接'
        } : null
      }
    };

    return NextResponse.json(modelData);

  } catch (error) {
    console.error('建模图生成错误:', error);
    return NextResponse.json(
      { success: false, error: '服务异常，请稍后重试' },
      { status: 500 }
    );
  }
}

// 获取支持的材料选项
export async function GET() {
  return NextResponse.json({
    materials: [
      { value: 'resin', name: 'PVC软胶/ABS树脂', description: '精细雕刻，高端定位' },
      { value: 'plush', name: '高级毛绒面料', description: '可爱风格，柔软触感' },
      { value: 'vinyl', name: '乙烯基塑料', description: '潮流手办，可动关节' },
      { value: 'mixed', name: '混合材质（树脂+PVC）', description: '最佳细节，高端把玩' }
    ],
    scales: [
      { value: '1:6', description: '约29cm（经典比例）' },
      { value: '1:8', description: '约22cm（主流手办）' },
      { value: '1:12', description: '约15cm（迷你收藏）' }
    ],
    minRequirements: {
      imageResolution: '≥1080x1080',
      supportedFormats: ['JPG', 'PNG', 'WEBP'],
      maxFileSize: '10MB'
    }
  });
}
