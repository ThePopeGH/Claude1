import { prisma } from '@/lib/prisma';

export async function GET() {
  const drinks = await prisma.drink.findMany({ where: { active: true }, orderBy: { name: 'asc' } });
  return Response.json(drinks);
}
