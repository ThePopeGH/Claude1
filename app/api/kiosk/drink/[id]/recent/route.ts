import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const recent = await prisma.consumption.findMany({
    where: { drinkId: params.id },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  return Response.json(recent);
}
