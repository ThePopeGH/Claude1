import { NextRequest } from 'next/server';
import { getSessionFromRequest } from './auth';
import { rateLimit } from './rate-limit';

export async function requireAdmin(req: NextRequest, allowViewer = false) {
  const session = await getSessionFromRequest(req);
  if (!session) return { error: Response.json({ error: 'Nicht eingeloggt' }, { status: 401 }) };
  if (!allowViewer && session.role !== 'ADMIN') return { error: Response.json({ error: 'Keine Berechtigung' }, { status: 403 }) };
  const ip = req.headers.get('x-forwarded-for') ?? 'local';
  if (!rateLimit(`${session.sub}:${ip}`)) return { error: Response.json({ error: 'Rate limit exceeded' }, { status: 429 }) };
  return { session };
}
