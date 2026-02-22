export function computeInvoiceTotal(
  consumptions: Array<{ qty: number; priceCentsAtTime: number }>,
  adjustments: number,
  payments: number
): number {
  return consumptions.reduce((sum, c) => sum + c.qty * c.priceCentsAtTime, 0) + adjustments - payments;
}

export function idempotentCreate<T>(existing: T | null, creator: () => T): T {
  if (existing) return existing;
  return creator();
}
