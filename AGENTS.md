# 电影周边建模与表情包定制服务 - AI助手

## 项目概述

这是一个专业的电影周边建模与表情包定制服务AI助手，为用户提供精准的表情包生成和周边建模图输出服务，同时支撑订阅模式与商家订单对接。

### 核心服务

- **表情包生成服务**：针对网络冲浪者，根据电影视频/图片生成3-5个高质量表情包
- **周边建模图生成服务**：针对周边制作商家，输出包含三视图、尺寸标注、材质建议的建模图
- **订阅管理**：支撑产品订阅额度管理
- **商家对接**：为商家提供订单对接入口

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **图片生成**: coze-coding-dev-sdk (ImageGenerationClient)

## 目录结构

```
├── public/                     # 静态资源
├── scripts/                    # 构建与启动脚本
├── src/
│   ├── app/                    # 页面路由
│   │   ├── api/               # API 路由
│   │   │   ├── emoticon/      # 表情包生成API
│   │   │   └── model/         # 周边建模图API
│   │   ├── layout.tsx        # 根布局
│   │   └── page.tsx          # 首页（服务选择）
│   ├── components/            # 组件
│   │   ├── service-select.tsx    # 服务类型选择
│   │   ├── emoticon-generator.tsx # 表情包生成器
│   │   ├── model-generator.tsx   # 建模图生成器
│   │   ├── subscription-manager.tsx # 订阅管理
│   │   └── merchant-connect.tsx   # 商家对接
│   └── lib/                   # 工具库
│       ├── config.ts         # 应用配置
│       └── utils.ts          # 通用工具函数
```

## 核心功能

### 1. 表情包生成

**输入**：
- 电影视频片段（≤30秒）或图片（≥1080×1080）
- 角色/场景指定（可选）

**输出**：
- 3-5个高质量表情包
- 适配微信/抖音比例（1:1或4:3）
- 保留角色核心特征
- 简洁趣味文字（≤10字）

**技术实现**：
- 使用 ImageGenerationClient 生成基础图片
- 应用图片处理生成多个表情包变体
- 添加文字叠加和比例调整

### 2. 周边建模图生成

**输入**：
- 电影视频片段或高清图片
- 指定核心角色

**输出**：
- 三视图（正面/侧面/背面）
- 关键尺寸标注（单位：cm）
- 材质建议（树脂/毛绒等）
- 细节说明（服饰纹理、配件形状）

**技术实现**：
- 分析图片提取角色特征
- 生成三视图结构化描述
- 生成标准化的建模参数文档

### 3. 订阅管理

- 订阅方案展示
- 额度追踪（表情包生成次数、建模图生成次数）
- 升级引导

### 4. 商家对接

- 商家资质收集
- 订单入口
- 供应链资源匹配

## API 设计

### POST /api/emoticon/generate
生成表情包

**Request**:
```json
{
  "imageUrl": "string",      // 素材图片URL
  "characterName": "string", // 角色名称（可选）
  "sceneDescription": "string", // 场景描述（可选）
  "count": 3-5              // 生成数量
}
```

**Response**:
```json
{
  "success": true,
  "emoticons": [
    {
      "id": "string",
      "url": "string",
      "caption": "string",
      "platform": "wechat|douyin"
    }
  ]
}
```

### POST /api/model/generate
生成周边建模图

**Request**:
```json
{
  "imageUrl": "string",
  "characterName": "string",
  "material": "resin|plush|vinyl", // 材质偏好
  "businessInfo": {  // 商家信息（可选）
    "name": "string",
    "scope": "string"
  }
}
```

**Response**:
```json
{
  "success": true,
  "model": {
    "characterName": "string",
    "views": {
      "front": "string",  // 正面视图描述
      "side": "string",   // 侧面视图描述
      "back": "string"    // 背面视图描述
    },
    "dimensions": {
      "height": "number (cm)",
      "headDiameter": "number (cm)",
      "chestWidth": "number (cm)"
    },
    "material": "string",
    "details": "string"
  }
}
```

## 质量标准

### 表情包
- ✅ 画面清晰无模糊
- ✅ 保留角色核心特征
- ✅ 适配主流社交平台比例
- ✅ 趣味文字简洁（≤10字）
- ❌ 禁止低俗、违规文字
- ❌ 禁止过度变形导致角色无法识别

### 周边建模图
- ✅ 包含三视图与尺寸标注
- ✅ 严格依据用户提供的素材
- ❌ 禁止虚构不存在的角色特征
- ❌ 无标注视为不合格

## 开发规范

### Hydration 问题防范
1. 严禁在 JSX 渲染逻辑中直接使用动态数据
2. 必须使用 'use client' 并配合 useEffect + useState
3. 严禁非法 HTML 嵌套

### 图片生成规范
- 使用 coze-coding-dev-sdk 的 ImageGenerationClient
- 必须仅在服务端代码中使用 SDK
- 使用 HeaderUtils.extractForwardHeaders 处理请求头

### 包管理
**仅允许使用 pnpm**
- 安装依赖：`pnpm add <package>`
- 移除依赖：`pnpm remove <package>`

## 部署说明

- 开发环境：使用 `pnpm dev` 启动（端口 5000）
- 生产环境：使用 `pnpm build && pnpm start`

## 注意事项

- 所有输出需关联用户提供的电影素材
- 订阅额度限制优先于生成请求
- 商家信息仅商家可获取完整参数
