import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-api';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, true); if (auth.error) return auth.error;
  return Response.json(await prisma.drink.findMany({ orderBy: { name: 'asc' } }));
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req); if (auth.error) return auth.error;
  const data = await req.json();
  const created = await prisma.drink.create({ data: { name: data.name, priceCents: data.priceCents, imageUrl: data.imageUrl ?? null, active: data.active ?? true, minimumStock: data.minimumStock ?? 0 } });
  return Response.json(created, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req); if (auth.error) return auth.error;
  const data = await req.json();
  const updated = await prisma.drink.update({ where: { id: data.id }, data: { name: data.name, priceCents: data.priceCents, imageUrl: data.imageUrl ?? null, active: data.active, minimumStock: data.minimumStock ?? 0 } });
  return Response.json(updated);
}
