import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'portal-contab-secret-key-change-in-production'
);
const COOKIE_NAME = 'pc_session';
const VALID_PROVIDERS = ['PROCARE', 'NEWLAND', 'CLIENTE01'];

export interface SessionPayload {
  provider: string;
  login: string;
  nome: string;
  role: string;
}

export async function createToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export { COOKIE_NAME, VALID_PROVIDERS };
