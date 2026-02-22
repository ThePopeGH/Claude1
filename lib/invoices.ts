import { prisma } from './prisma';

export async function recalculateInvoice(userId: string, year: number, month: number) {
  const [cons, adjs, pays, config] = await Promise.all([
    prisma.consumption.findMany({
      where: { userId, createdAt: { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) } },
      select: { qty: true, priceCentsAtTime: true }
    }),
    prisma.adjustment.aggregate({ where: { userId, year, month }, _sum: { amountCents: true } }),
    prisma.payment.aggregate({ where: { userId, year, month }, _sum: { amountCents: true } }),
    prisma.appConfig.findUnique({ where: { id: 'default' } })
  ]);

  const consTotal = cons.reduce((sum, item) => sum + item.qty * item.priceCentsAtTime, 0);
  const total = consTotal + (adjs._sum.amountCents ?? 0) - (pays._sum.amountCents ?? 0);
  const paid = config?.autoMarkPaidOnZero ? total <= 0 : false;

  return prisma.monthlyInvoice.upsert({
    where: { userId_year_month: { userId, year, month } },
    update: { totalCents: total, paid, paidAt: paid ? new Date() : null },
    create: { userId, year, month, totalCents: total, paid, paidAt: paid ? new Date() : null }
  });
}
