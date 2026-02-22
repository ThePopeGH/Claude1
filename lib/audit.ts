import { ActorType } from '@prisma/client';
import { prisma } from './prisma';

export async function logAudit(input: {
  actorType: ActorType;
  actorId: string;
  action: string;
  entity: string;
  metaJson?: unknown;
  adminUserId?: string;
}) {
  await prisma.auditLog.create({ data: { ...input, metaJson: input.metaJson as object | undefined } });
}
