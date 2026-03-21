/**
 * analytics.js — Usage statistics via USAGE_ANALYTICS KV
 *
 * KV key schema:
 *   stats:daily:{YYYY-MM-DD}   — per-day counters  (TTL: 90 days)
 *   stats:totals               — all-time running totals
 *   stats:seen:{user_id}:{date} — dedup flag per user per day (TTL: 25 h)
 *
 * Value shape (daily & totals):
 *   { generations: number, users: number, revenue: number }
 *
 * Public API:
 *   recordGeneration(env, user_id)   — call after successful /generate
 *   recordRevenue(env, amount)       — call after order approved
 *   getDailyStats(env, date?)        — stats for one day (default: today)
 *   getTotals(env)                   — all-time totals
 */

const DAILY_TTL  = 60 * 60 * 24 * 90;   // 90 days
const SEEN_TTL   = 60 * 60 * 25;         // 25 hours — covers midnight edge

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().split('T')[0];   // "YYYY-MM-DD"
}

function dailyKey(date) {
  return `stats:daily:${date}`;
}

async function getStats(env, key) {
  try {
    const raw = await env.USAGE_ANALYTICS.get(key);
    return raw ? JSON.parse(raw) : { generations: 0, users: 0, revenue: 0 };
  } catch {
    return { generations: 0, users: 0, revenue: 0 };
  }
}

async function putStats(env, key, stats, ttl) {
  const opts = ttl ? { expirationTtl: ttl } : {};
  await env.USAGE_ANALYTICS.put(key, JSON.stringify(stats), opts);
}

// ─────────────────────────────────────────────────────────────────────────────
// recordGeneration
// Increments generations counter. Deduplicates user count per day.
// Call in worker.js after a successful /generate response.
// ─────────────────────────────────────────────────────────────────────────────

export async function recordGeneration(env, user_id) {
  if (!env?.USAGE_ANALYTICS) return;

  const date   = today();
  const dKey   = dailyKey(date);
  const seenKey = `stats:seen:${user_id}:${date}`;

  try {
    // Check if this user was already counted today
    const alreadySeen = user_id ? await env.USAGE_ANALYTICS.get(seenKey) : '1';
    const isNewUser   = !alreadySeen;

    // Update daily stats
    const daily = await getStats(env, dKey);
    daily.generations += 1;
    if (isNewUser) daily.users += 1;
    await putStats(env, dKey, daily, DAILY_TTL);

    // Update all-time totals
    const totals = await getStats(env, 'stats:totals');
    totals.generations += 1;
    if (isNewUser) totals.users += 1;
    await putStats(env, 'stats:totals', totals);

    // Mark user as seen today
    if (isNewUser && user_id) {
      await env.USAGE_ANALYTICS.put(seenKey, '1', { expirationTtl: SEEN_TTL });
    }
  } catch (err) {
    // Non-fatal — never block generation for analytics failure
    console.warn('[analytics] recordGeneration error:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// recordRevenue
// Increments revenue counter. Call in verifyPayment.js after approve.
// ─────────────────────────────────────────────────────────────────────────────

export async function recordRevenue(env, amount) {
  if (!env?.USAGE_ANALYTICS || !amount) return;

  const dKey = dailyKey(today());

  try {
    const daily = await getStats(env, dKey);
    daily.revenue += amount;
    await putStats(env, dKey, daily, DAILY_TTL);

    const totals = await getStats(env, 'stats:totals');
    totals.revenue += amount;
    await putStats(env, 'stats:totals', totals);
  } catch (err) {
    console.warn('[analytics] recordRevenue error:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getDailyStats
// Returns stats for a specific date. Defaults to today.
// ─────────────────────────────────────────────────────────────────────────────

export async function getDailyStats(env, date) {
  if (!env?.USAGE_ANALYTICS) return { generations: 0, users: 0, revenue: 0 };
  return getStats(env, dailyKey(date || today()));
}

// ─────────────────────────────────────────────────────────────────────────────
// getTotals
// Returns all-time running totals.
// ─────────────────────────────────────────────────────────────────────────────

export async function getTotals(env) {
  if (!env?.USAGE_ANALYTICS) return { generations: 0, users: 0, revenue: 0 };
  return getStats(env, 'stats:totals');
}
