import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-api';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, true); if (auth.error) return auth.error;
  const invoices = await prisma.monthlyInvoice.findMany({ where: { totalCents: { gt: 0 } }, include: { user: true }, orderBy: { totalCents: 'desc' } });
  const byUser = new Map<string, { user: (typeof invoices)[number]['user']; total: number; months: number }>();
  for (const i of invoices) {
    const row = byUser.get(i.userId) ?? { user: i.user, total: 0, months: 0 };
    row.total += i.totalCents; row.months += 1; byUser.set(i.userId, row);
  }
  return Response.json([...byUser.values()].sort((a,b)=>b.total-a.total).map((r, index)=>({rank:index+1, user:r.user, openCents:r.total, openMonths:r.months})));
}
