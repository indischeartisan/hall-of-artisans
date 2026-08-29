type CacheEntry = { expiresAt: number; value: unknown };

const values = new Map<string, CacheEntry>();
const pending = new Map<string, Promise<unknown>>();

export async function withTtlCache<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const cached = values.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value as T;
  const running = pending.get(key);
  if (running) return running as Promise<T>;
  const request = load().then(value => {
    values.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  }).finally(() => pending.delete(key));
  pending.set(key, request);
  return request;
}

export function invalidateTtlCache(prefix: string) {
  for (const key of values.keys()) if (key.startsWith(prefix)) values.delete(key);
}
