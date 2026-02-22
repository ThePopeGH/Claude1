import { PrismaClient, AdminRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? 'admin1234', 10);
  await prisma.adminUser.upsert({
    where: { email: process.env.SEED_ADMIN_EMAIL ?? 'admin@kaffeekasse.local' },
    update: { passwordHash, role: AdminRole.ADMIN, active: true },
    create: {
      email: process.env.SEED_ADMIN_EMAIL ?? 'admin@kaffeekasse.local',
      passwordHash,
      role: AdminRole.ADMIN,
      active: true
    }
  });

  await prisma.appConfig.upsert({ where: { id: 'default' }, update: {}, create: { id: 'default' } });

  const users = ['Anna', 'Lukas', 'Mariam', 'Jonas'];
  for (const name of users) {
    await prisma.user.upsert({ where: { id: `seed-${name.toLowerCase()}` }, update: {}, create: { id: `seed-${name.toLowerCase()}`, name, active: true } });
  }

  const drinks = [
    { name: 'Cola', priceCents: 150, minimumStock: 6 },
    { name: 'Mate', priceCents: 180, minimumStock: 4 },
    { name: 'Wasser', priceCents: 100, minimumStock: 10 }
  ];
  for (const drink of drinks) {
    await prisma.drink.upsert({ where: { id: `seed-${drink.name.toLowerCase()}` }, update: drink, create: { id: `seed-${drink.name.toLowerCase()}`, ...drink } });
  }
}

main().finally(() => prisma.$disconnect());
