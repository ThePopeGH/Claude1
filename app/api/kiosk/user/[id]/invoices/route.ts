import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const now = new Date();
  const current = await prisma.monthlyInvoice.findUnique({ where: { userId_year_month: { userId: params.id, year: now.getFullYear(), month: now.getMonth() + 1 } } });
  const history = await prisma.monthlyInvoice.findMany({ where: { userId: params.id }, orderBy: [{ year: 'desc' }, { month: 'desc' }], take: 6 });
  const items = await prisma.consumption.findMany({
    where: { userId: params.id, createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } },
    include: { drink: true },
    orderBy: { createdAt: 'desc' }
  });
  return Response.json({ current, history, items });
}
