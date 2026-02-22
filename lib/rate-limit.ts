const bucket = new Map<string, { count: number; ts: number }>();

export function rateLimit(key: string, limit = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const current = bucket.get(key);
  if (!current || now - current.ts > windowMs) {
    bucket.set(key, { count: 1, ts: now });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}
