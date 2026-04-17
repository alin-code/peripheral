const DEFAULT_ARK_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3';
const DEFAULT_ARK_IMAGE_MODEL = 'doubao-seedream-5-0-260128';

type ArkImageGenerationRequest = {
  prompt: string;
  size?: string;
  watermark?: boolean;
  image?: string | string[];
  responseFormat?: 'url' | 'b64_json';
  sequentialImageGeneration?: 'auto' | 'disabled';
  model?: string;
};

export type ArkImageGenerationResponse = {
  model: string;
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    size?: string;
    error?: {
      code?: string;
      message?: string;
      [key: string]: unknown;
    };
  }>;
  usage?: Record<string, unknown>;
  error?: {
    code?: string;
    message?: string;
    [key: string]: unknown;
  };
};

function getArkApiKey() {
  return process.env.ARK_API_KEY?.replace(/^Bearer\s+/i, '').trim() || '';
}

function getArkBaseUrl() {
  return process.env.ARK_IMAGE_BASE_URL?.trim() || DEFAULT_ARK_BASE_URL;
}

function getArkModel() {
  return process.env.ARK_IMAGE_MODEL?.trim() || DEFAULT_ARK_IMAGE_MODEL;
}

function appendNoProxyHost(host: string) {
  const currentValue = process.env.NO_PROXY || process.env.no_proxy || '';
  const items = currentValue
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (!items.includes(host)) {
    items.push(host);
  }

  const nextValue = items.join(',');
  process.env.NO_PROXY = nextValue;
  process.env.no_proxy = nextValue;
}

function disableLocalProxyEnv() {
  const proxyKeys = [
    'HTTP_PROXY',
    'HTTPS_PROXY',
    'ALL_PROXY',
    'http_proxy',
    'https_proxy',
    'all_proxy',
  ] as const;

  proxyKeys.forEach((key) => {
    const value = process.env[key];

    if (value && (value.includes('127.0.0.1:1080') || value.includes('localhost:1080'))) {
      delete process.env[key];
    }
  });
}

function prepareArkNetworkEnv() {
  disableLocalProxyEnv();

  try {
    const url = new URL(getArkBaseUrl());
    appendNoProxyHost(url.hostname);
  } catch {
    // Ignore invalid URLs and let fetch surface the real error.
  }
}

function normalizeArkImageGenerationResponse(response: unknown): ArkImageGenerationResponse {
  const raw = response as Record<string, unknown> | null;

  if (raw?.error && typeof raw.error === 'object') {
    const error = raw.error as { message?: string; code?: string };
    throw new Error(`Ark 图片生成失败：${error.message || '未知错误'}${error.code ? `（code: ${error.code}）` : ''}`);
  }

  if (raw && Array.isArray(raw.data)) {
    return raw as unknown as ArkImageGenerationResponse;
  }

  throw new Error(`无法识别的 Ark 图片生成响应结构: ${JSON.stringify(response).slice(0, 600)}`);
}

export async function requestArkImageGeneration(
  request: ArkImageGenerationRequest,
): Promise<ArkImageGenerationResponse> {
  const apiKey = getArkApiKey();

  if (!apiKey) {
    throw new Error('ARK_API_KEY 未配置');
  }

  prepareArkNetworkEnv();

  const body: Record<string, unknown> = {
    model: request.model || getArkModel(),
    prompt: request.prompt,
    sequential_image_generation: request.sequentialImageGeneration || 'disabled',
    response_format: request.responseFormat || 'url',
    size: request.size || '2K',
    stream: false,
    watermark: request.watermark ?? true,
  };

  if (request.image) {
    body.image = request.image;
  }

  const response = await fetch(`${getArkBaseUrl()}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(async () => ({
    error: {
      message: await response.text(),
    },
  }));

  if (!response.ok) {
    const message =
      typeof payload?.error?.message === 'string'
        ? payload.error.message
        : typeof payload?.msg === 'string'
          ? payload.msg
          : '未知错误';

    throw new Error(`Ark 图片生成失败：${message}${payload?.code ? `（code: ${payload.code}）` : ''}`);
  }

  return normalizeArkImageGenerationResponse(payload);
}

