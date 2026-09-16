interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const loginAttempts = new Map<string, RateLimitEntry>();

const LOGIN_WINDOW_MS = 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;
const MAX_TRACKED_KEYS = 10_000;

/**
 * Small in-process guard for the unauthenticated login endpoint. The database
 * cleanup remains the durable protection; this limits bursts against one
 * running instance without adding another service or table.
 */
export function consumeLoginRateLimit(key: string): boolean {
  const now = Date.now();

  for (const [entryKey, entry] of loginAttempts) {
    if (entry.resetAt <= now) loginAttempts.delete(entryKey);
  }

  const current = loginAttempts.get(key);
  if (!current || current.resetAt <= now) {
    if (loginAttempts.size >= MAX_TRACKED_KEYS) {
      const oldestKey = loginAttempts.keys().next().value;
      if (oldestKey) loginAttempts.delete(oldestKey);
    }
    loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return true;
  }

  if (current.count >= LOGIN_MAX_ATTEMPTS) return false;
  current.count += 1;
  return true;
}
