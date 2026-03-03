// Simple in-memory rate limiter
const rateLimit = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 20,
  windowMs: number = 60000
): { success: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimit.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimit.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count };
}

// Clean up old entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    rateLimit.forEach((value, key) => {
      if (now > value.resetAt) {
        rateLimit.delete(key);
      }
    });
  }, 60000);
}
