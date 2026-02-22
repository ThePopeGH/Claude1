import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-api';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, true); if (auth.error) return auth.error;
  const drinks = await prisma.drink.findMany({ include: { stockMovements: true } });
  return Response.json(drinks.map((d) => ({ ...d, stock: d.stockMovements.reduce((sum, m) => sum + m.deltaQty, 0) })));
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req); if (auth.error) return auth.error;
  const data = await req.json();
  const config = await prisma.appConfig.findUnique({ where: { id: 'default' } });
  const movements = await prisma.stockMovement.findMany({ where: { drinkId: data.drinkId } });
  const currentStock = movements.reduce((sum, m) => sum + m.deltaQty, 0);
  if (!config?.allowNegativeStock && currentStock + data.deltaQty < 0) return Response.json({ error: 'Negativbestand nicht erlaubt' }, { status: 400 });
  const created = await prisma.stockMovement.create({ data: { drinkId: data.drinkId, deltaQty: data.deltaQty, reason: data.reason, note: data.note, adminUserId: auth.session!.sub } });
  return Response.json(created, { status: 201 });
}
