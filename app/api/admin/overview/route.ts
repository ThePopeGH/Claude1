import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-api';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, true); if (auth.error) return auth.error;
  const now = new Date();
  const [openSum, debts, drinks, today, seven] = await Promise.all([
    prisma.monthlyInvoice.aggregate({ _sum: { totalCents: true }, where: { totalCents: { gt: 0 } } }),
    prisma.monthlyInvoice.findMany({ where: { totalCents: { gt: 0 } }, include: { user: true }, orderBy: { totalCents: 'desc' }, take: 5 }),
    prisma.drink.findMany({ include: { stockMovements: true } }),
    prisma.consumption.count({ where: { createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } } }),
    prisma.consumption.count({ where: { createdAt: { gte: new Date(now.getTime() - 7*24*60*60*1000) } } })
  ]);
  const lowStock = drinks.map((d)=>({name:d.name, stock:d.stockMovements.reduce((s,m)=>s+m.deltaQty,0), min:d.minimumStock})).filter((d)=>d.stock<d.min);
  return Response.json({ openTotalCents: openSum._sum.totalCents ?? 0, topDebts: debts, lowStock, bookingsToday: today, bookingsLast7Days: seven });
}
