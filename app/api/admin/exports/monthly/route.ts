import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-api';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, true); if (auth.error) return auth.error;
  const year = Number(req.nextUrl.searchParams.get('year'));
  const month = Number(req.nextUrl.searchParams.get('month'));
  const rows = await prisma.monthlyInvoice.findMany({ where: { year, month }, include: { user: true } });
  const csv = ['User,Year,Month,TotalCents,Paid,PaidAt', ...rows.map((r)=>`${r.user.name},${r.year},${r.month},${r.totalCents},${r.paid},${r.paidAt?.toISOString() ?? ''}`)].join('\n');
  return new Response(csv, { headers: { 'content-type': 'text/csv; charset=utf-8' } });
}
