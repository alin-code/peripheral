export interface AuthPayload {
  userId: string;
  email: string;
}

const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret-key';

export function generateAuthToken(payload: AuthPayload): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }),
  ).toString('base64');
  const signature = Buffer.from(`${header}.${body}.${jwtSecret}`).toString('base64');

  return `${header}.${body}.${signature}`;
}

export function verifyAuthToken(token: string): AuthPayload | null {
  try {
    const [header, body, signature] = token.split('.');
    const expectedSignature = Buffer.from(`${header}.${body}.${jwtSecret}`).toString('base64');

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(body, 'base64').toString());
    if (payload.exp < Date.now()) {
      return null;
    }

    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}
