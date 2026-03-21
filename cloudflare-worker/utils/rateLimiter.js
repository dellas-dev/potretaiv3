/**
 * rateLimiter.js — Per-user generation rate limiter
 *
 * Limits each user_id to 4 generations per 60-second window.
 * Uses RATE_LIMIT KV with key: rate:{user_id}   TTL: 60s
 *
 * Separate from the IP-based rate limiter in worker.js (FACE_CACHE).
 * This one tracks authenticated users by user_id for finer control.
 *
 * Requires binding in wrangler.toml:
 *   [[kv_namespaces]]
 *   binding = "RATE_LIMIT"
 */

const MAX_PER_WINDOW = 4;    // max generations per window
const WINDOW_TTL     = 60;   // window size in seconds

function now() {
  return Math.floor(Date.now() / 1000);
}

// ─────────────────────────────────────────────────────────────────────────────
// checkRateLimit
// Returns true if the user is within limit, false if limit exceeded.
// Silently allows if RATE_LIMIT KV is not configured.
// ─────────────────────────────────────────────────────────────────────────────

export async function checkRateLimit(user_id, env) {
  if (!env?.RATE_LIMIT) return true;   // fail open if binding missing
  if (!user_id)         return true;   // no user_id — let IP limiter handle it

  const key = `rate:${user_id}`;

  try {
    const value = await env.RATE_LIMIT.get(key);

    if (!value) {
      // First request in this window
      await env.RATE_LIMIT.put(
        key,
        JSON.stringify({ count: 1, started_at: now() }),
        { expirationTtl: WINDOW_TTL }
      );
      return true;
    }

    const data = JSON.parse(value);

    if (data.count >= MAX_PER_WINDOW) {
      console.warn(`[rateLimiter] Limit hit: user=${user_id} count=${data.count}/${MAX_PER_WINDOW}`);
      return false;
    }

    data.count++;
    await env.RATE_LIMIT.put(key, JSON.stringify(data), { expirationTtl: WINDOW_TTL });
    return true;

  } catch (err) {
    console.warn('[rateLimiter] checkRateLimit error — allowing:', err.message);
    return true;   // fail open: never block user due to KV outage
  }
}
