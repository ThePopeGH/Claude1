import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-api';
import { recalculateInvoice } from '@/lib/invoices';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, true); if (auth.error) return auth.error;
  return Response.json(await prisma.payment.findMany({ include: { user: true }, orderBy: { paidAt: 'desc' }, take: 200 }));
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req); if (auth.error) return auth.error;
  const data = await req.json();
  const created = await prisma.payment.create({ data: { ...data, adminUserId: auth.session!.sub, paidAt: new Date(data.paidAt) } });
  await recalculateInvoice(data.userId, data.year, data.month);
  return Response.json(created, { status: 201 });
}
