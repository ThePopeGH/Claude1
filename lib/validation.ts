import { z } from 'zod';

export const consumeSchema = z.object({
  userId: z.string().min(1),
  drinkId: z.string().min(1),
  qty: z.number().int().positive().max(99),
  clientUuid: z.string().uuid()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
