import { Prisma } from '@prisma/client';
import { consumeSchema } from '@/lib/validation';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { recalculateInvoice } from '@/lib/invoices';

export async function POST(req: Request) {
  const parsed = consumeSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const { userId, drinkId, qty, clientUuid } = parsed.data;
  const drink = await prisma.drink.findUnique({ where: { id: drinkId } });
  if (!drink?.active) return Response.json({ error: 'Getränk nicht verfügbar' }, { status: 400 });

  try {
    const created = await prisma.consumption.create({ data: { userId, drinkId, qty, clientUuid, priceCentsAtTime: drink.priceCents } });
    const now = new Date();
    await recalculateInvoice(userId, now.getFullYear(), now.getMonth() + 1);
    await logAudit({ actorType: 'KIOSK', actorId: userId, action: 'consume', entity: 'Consumption', metaJson: { createdId: created.id, qty } });
    return Response.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const existing = await prisma.consumption.findUnique({ where: { clientUuid } });
      return Response.json(existing, { status: 200 });
    }
    throw error;
  }
}
