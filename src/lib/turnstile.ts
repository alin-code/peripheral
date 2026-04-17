interface TurnstileSiteVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
}

function getTurnstileErrorMessage(errorCodes?: string[]) {
  const primaryCode = errorCodes?.[0];

  switch (primaryCode) {
    case 'missing-input-response':
      return '请先完成人机验证';
    case 'invalid-input-response':
    case 'timeout-or-duplicate':
      return '验证码已失效，请重新验证';
    case 'missing-input-secret':
    case 'invalid-input-secret':
      return '验证码服务配置错误，请联系管理员';
    default:
      return '人机验证失败，请稍后重试';
  }
}

export async function verifyTurnstileToken(token: string, remoteIp?: string | null) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    return {
      success: false,
      error: '验证码服务配置错误，请联系管理员',
    };
  }

  const body = new URLSearchParams({
    secret: secretKey,
    response: token,
  });

  if (remoteIp) {
    body.set('remoteip', remoteIp);
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
    cache: 'no-store',
  });

  if (!response.ok) {
    return {
      success: false,
      error: '验证码校验服务暂时不可用，请稍后重试',
    };
  }

  const result = (await response.json()) as TurnstileSiteVerifyResponse;
  if (!result.success) {
    return {
      success: false,
      error: getTurnstileErrorMessage(result['error-codes']),
    };
  }

  return { success: true, error: null };
}
