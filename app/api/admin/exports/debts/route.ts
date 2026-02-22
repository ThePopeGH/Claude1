import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/admin-api';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, true); if (auth.error) return auth.error;
  const url = new URL('/api/admin/debts', req.url);
  const resp = await fetch(url, { headers: { cookie: req.headers.get('cookie') ?? '' } });
  const data = await resp.json();
  const csv = ['Rank,User,OpenCents,OpenMonths', ...data.map((d: any)=>`${d.rank},${d.user.name},${d.openCents},${d.openMonths}`)].join('\n');
  return new Response(csv, { headers: { 'content-type': 'text/csv; charset=utf-8' } });
}
