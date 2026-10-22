import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { AuthSession } from '@/types';

const COOKIE_NAME = 'ja_session_token';
const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'japanese_places_auction_default_secret_fallback_key_2026'
);

// Argon2id hashing and verification
export async function hashPassword(plainText: string): Promise<string> {
  try {
    const { hash } = await import('@node-rs/argon2');
    return await hash(plainText, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
  } catch (err) {
    // Fallback if native addon has issue on some platforms
    const crypto = await import('crypto');
    return crypto.scryptSync(plainText, 'ja_salt_2026', 64).toString('hex');
  }
}

export async function verifyPassword(plainText: string, passwordHash: string): Promise<boolean> {
  try {
    const { verify } = await import('@node-rs/argon2');
    return await verify(passwordHash, plainText);
  } catch (err) {
    const crypto = await import('crypto');
    const computed = crypto.scryptSync(plainText, 'ja_salt_2026', 64).toString('hex');
    return computed === passwordHash;
  }
}

// Session JWT Generation
export async function createSessionToken(payload: AuthSession): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

// Session JWT Verification
export async function verifySessionToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as 'ADMIN' | 'TEAM',
      teamId: payload.teamId as string | undefined,
      teamName: payload.teamName as string | undefined,
    };
  } catch (err) {
    return null;
  }
}

// Get session from incoming cookies (Server Component / Route Handler)
export async function getCurrentSession(): Promise<AuthSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

// Set Session Cookie
export function setSessionCookie(token: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  cookies().set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

// Clear Session Cookie
export function clearSessionCookie() {
  cookies().set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}
