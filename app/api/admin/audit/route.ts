import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-api';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req, true); if (auth.error) return auth.error;
  const q = req.nextUrl.searchParams;
  const logs = await prisma.auditLog.findMany({
    where: { action: q.get('action') ?? undefined, entity: q.get('entity') ?? undefined },
    orderBy: { createdAt: 'desc' },
    take: 300
  });
  return Response.json(logs);
}
