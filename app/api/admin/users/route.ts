import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-api';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, true); if (auth.error) return auth.error;
  return Response.json(await prisma.user.findMany({ orderBy: { name: 'asc' } }));
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req); if (auth.error) return auth.error;
  const data = await req.json();
  const created = await prisma.user.create({ data: { name: data.name, photoUrl: data.photoUrl ?? null, active: data.active ?? true } });
  return Response.json(created, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req); if (auth.error) return auth.error;
  const data = await req.json();
  const updated = await prisma.user.update({ where: { id: data.id }, data: { name: data.name, photoUrl: data.photoUrl ?? null, active: data.active } });
  return Response.json(updated);
}
