import type { Env } from "./types";

/**
 * Fixed-window rate limiter backed by KV. Cheap and good enough for abuse
 * control on login / AI / submit endpoints. Returns true if ALLOWED.
 */
export async function rateLimit(
  env: Env,
  bucket: string,
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const window = Math.floor(Date.now() / 1000 / windowSeconds);
  const key = `rl:${bucket}:${identifier}:${window}`;
  let count: number;
  try {
    const cur = await env.KV.get(key);
    count = cur ? parseInt(cur, 10) || 0 : 0;
  } catch {
    return { allowed: true, remaining: limit }; // fail-open on KV error
  }
  if (count >= limit) return { allowed: false, remaining: 0 };
  try {
    await env.KV.put(key, String(count + 1), { expirationTtl: windowSeconds + 5 });
  } catch {
    /* best effort */
  }
  return { allowed: true, remaining: Math.max(0, limit - count - 1) };
}

/** Best-effort client IP for keying + hashing. */
export function clientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "0.0.0.0"
  );
}
