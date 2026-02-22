import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';

export async function POST(req: Request) {
  const parsed = loginSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  const { email, password } = parsed.data;
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin || !admin.active || !(await bcrypt.compare(password, admin.passwordHash))) {
    return Response.json({ error: 'Login fehlgeschlagen' }, { status: 401 });
  }
  const token = await createToken({ sub: admin.id, role: admin.role });
  cookies().set('kk_admin', token, { httpOnly: true, sameSite: 'lax', secure: false, path: '/' });
  return Response.json({ ok: true, role: admin.role });
}
