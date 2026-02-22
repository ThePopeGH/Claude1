import { describe, it, expect } from 'vitest';
import { computeInvoiceTotal, idempotentCreate } from '@/lib/billing';

describe('invoice calculation', () => {
  it('computes monthly total as consumptions + adjustments - payments', () => {
    const total = computeInvoiceTotal([{ qty: 2, priceCentsAtTime: 150 }, { qty: 1, priceCentsAtTime: 180 }], 50, 200);
    expect(total).toBe(330);
  });
});

describe('idempotency helper', () => {
  it('returns existing record without creating duplicate', () => {
    const existing = { id: 'a' };
    const result = idempotentCreate(existing, () => ({ id: 'b' }));
    expect(result.id).toBe('a');
  });
});
