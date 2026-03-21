/**
 * costControl.js — Daily generation cost guard
 *
 * Prevents runaway API spend by capping total generations per day.
 * Uses USAGE_ANALYTICS KV with key: cost:{YYYY-MM-DD}
 *
 * Usage in generateQueue.js:
 *   const allowed = await checkDailyLimit(env);
 *   if (!allowed) { message.ack(); return; }
 *   await recordGenerationCost(env);
 */

const MAX_DAILY_GENERATE = 2000;
const COST_KEY_TTL       = 60 * 60 * 25;   // 25 hours — outlasts the day safely

function today() {
  return new Date().toISOString().split('T')[0];   // "YYYY-MM-DD"
}

// ─────────────────────────────────────────────────────────────────────────────
// checkDailyLimit
// Returns true if generation is allowed, false if daily cap is reached.
// Silently allows if USAGE_ANALYTICS KV is not configured.
// ─────────────────────────────────────────────────────────────────────────────

export async function checkDailyLimit(env) {
  if (!env?.USAGE_ANALYTICS) return true;

  try {
    const raw  = await env.USAGE_ANALYTICS.get(`cost:${today()}`);
    const data = raw ? JSON.parse(raw) : { generations: 0 };

    if (data.generations >= MAX_DAILY_GENERATE) {
      console.warn(`[costControl] Daily limit reached: ${data.generations}/${MAX_DAILY_GENERATE}`);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('[costControl] checkDailyLimit error — allowing:', err.message);
    return true;   // fail open: never block users due to KV outage
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// recordGenerationCost
// Increments the daily counter. Call after a successful generation.
// ─────────────────────────────────────────────────────────────────────────────

export async function recordGenerationCost(env) {
  if (!env?.USAGE_ANALYTICS) return;

  const key = `cost:${today()}`;

  try {
    const raw  = await env.USAGE_ANALYTICS.get(key);
    const data = raw ? JSON.parse(raw) : { generations: 0 };

    data.generations++;

    await env.USAGE_ANALYTICS.put(key, JSON.stringify(data), {
      expirationTtl: COST_KEY_TTL,
    });
  } catch (err) {
    console.warn('[costControl] recordGenerationCost error:', err.message);
  }
}
