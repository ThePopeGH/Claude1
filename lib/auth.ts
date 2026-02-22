import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-secret-change-me');

export type Session = { sub: string; role: 'ADMIN' | 'VIEWER' };

export async function createToken(session: Session) {
  return new SignJWT(session).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(secret);
}

export async function verifyToken(token: string): Promise<Session> {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as Session;
}

export async function getSessionFromRequest(req: NextRequest): Promise<Session | null> {
  const token = req.cookies.get('kk_admin')?.value;
  if (!token) return null;
  try { return await verifyToken(token); } catch { return null; }
}

export async function getSessionFromCookies(): Promise<Session | null> {
  const token = cookies().get('kk_admin')?.value;
  if (!token) return null;
  try { return await verifyToken(token); } catch { return null; }
}
