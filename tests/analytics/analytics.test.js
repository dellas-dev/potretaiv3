/**
 * tests/analytics/analytics.test.js
 *
 * Tests utils/analytics.js and utils/costControl.js:
 *   recordGeneration   — increments daily + total generations, deduplicates users
 *   recordRevenue      — increments daily + total revenue
 *   getDailyStats      — returns stats for a given date
 *   getTotals          — returns all-time totals
 *   checkDailyLimit    — returns false when daily limit reached
 *   recordGenerationCost — increments cost counter
 */

import { describe, it, expect, beforeEach } from 'vitest';

import {
  recordGeneration,
  recordRevenue,
  getDailyStats,
  getTotals,
} from '@utils/analytics.js';

import {
  checkDailyLimit,
  recordGenerationCost,
} from '@utils/costControl.js';

import { createMockEnv } from '@helpers/mockEnv.js';

// ─────────────────────────────────────────────────────────────────────────────
// recordGeneration
// ─────────────────────────────────────────────────────────────────────────────
describe('recordGeneration', () => {
  let env;
  beforeEach(() => { env = createMockEnv(); });

  it('increments daily generations counter', async () => {
    await recordGeneration(env, 'user_a');
    const stats = await getDailyStats(env);
    expect(stats.generations).toBe(1);
  });

  it('increments total generations counter', async () => {
    await recordGeneration(env, 'user_a');
    const totals = await getTotals(env);
    expect(totals.generations).toBe(1);
  });

  it('accumulates multiple generations', async () => {
    await recordGeneration(env, 'user_a');
    await recordGeneration(env, 'user_a');
    await recordGeneration(env, 'user_a');
    const stats = await getDailyStats(env);
    expect(stats.generations).toBe(3);
  });

  it('counts a new user only once per day (dedup)', async () => {
    await recordGeneration(env, 'unique_user');
    await recordGeneration(env, 'unique_user');
    await recordGeneration(env, 'unique_user');

    const stats = await getDailyStats(env);
    expect(stats.users).toBe(1);   // counted once despite 3 generations
  });

  it('counts different users separately', async () => {
    await recordGeneration(env, 'user_1');
    await recordGeneration(env, 'user_2');
    await recordGeneration(env, 'user_3');

    const stats = await getDailyStats(env);
    expect(stats.users).toBe(3);
  });

  it('increments totals.users for new user', async () => {
    await recordGeneration(env, 'new_user_x');
    const totals = await getTotals(env);
    expect(totals.users).toBe(1);
  });

  it('does not throw when USAGE_ANALYTICS is missing', async () => {
    await expect(recordGeneration({ USAGE_ANALYTICS: undefined }, 'user')).resolves.not.toThrow();
  });

  it('handles null user_id without throwing', async () => {
    await expect(recordGeneration(env, null)).resolves.not.toThrow();
    const stats = await getDailyStats(env);
    expect(stats.generations).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// recordRevenue
// ─────────────────────────────────────────────────────────────────────────────
describe('recordRevenue', () => {
  let env;
  beforeEach(() => { env = createMockEnv(); });

  it('increments daily revenue', async () => {
    await recordRevenue(env, 97000);
    const stats = await getDailyStats(env);
    expect(stats.revenue).toBe(97000);
  });

  it('increments total revenue', async () => {
    await recordRevenue(env, 197000);
    const totals = await getTotals(env);
    expect(totals.revenue).toBe(197000);
  });

  it('accumulates multiple revenue entries', async () => {
    await recordRevenue(env, 97000);
    await recordRevenue(env, 197000);
    const totals = await getTotals(env);
    expect(totals.revenue).toBe(97000 + 197000);
  });

  it('does not throw when USAGE_ANALYTICS is missing', async () => {
    await expect(recordRevenue({ USAGE_ANALYTICS: undefined }, 97000)).resolves.not.toThrow();
  });

  it('does not throw when amount is 0', async () => {
    await expect(recordRevenue(env, 0)).resolves.not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getDailyStats
// ─────────────────────────────────────────────────────────────────────────────
describe('getDailyStats', () => {
  let env;
  beforeEach(() => { env = createMockEnv(); });

  it('returns zeros for a date with no data', async () => {
    const stats = await getDailyStats(env, '2020-01-01');
    expect(stats).toEqual({ generations: 0, users: 0, revenue: 0 });
  });

  it('returns stats for a specific date string', async () => {
    const today = new Date().toISOString().split('T')[0];
    await recordGeneration(env, 'user_a');
    const stats = await getDailyStats(env, today);
    expect(stats.generations).toBe(1);
  });

  it('defaults to today when no date provided', async () => {
    await recordGeneration(env, 'user_b');
    const stats = await getDailyStats(env);
    expect(stats.generations).toBe(1);
  });

  it('returns zeros when USAGE_ANALYTICS is missing', async () => {
    const stats = await getDailyStats({ USAGE_ANALYTICS: undefined });
    expect(stats).toEqual({ generations: 0, users: 0, revenue: 0 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getTotals
// ─────────────────────────────────────────────────────────────────────────────
describe('getTotals', () => {
  let env;
  beforeEach(() => { env = createMockEnv(); });

  it('returns zeros before any activity', async () => {
    const totals = await getTotals(env);
    expect(totals).toEqual({ generations: 0, users: 0, revenue: 0 });
  });

  it('accumulates across multiple calls', async () => {
    await recordGeneration(env, 'u1');
    await recordGeneration(env, 'u2');
    await recordRevenue(env, 97000);

    const totals = await getTotals(env);
    expect(totals.generations).toBe(2);
    expect(totals.users).toBe(2);
    expect(totals.revenue).toBe(97000);
  });

  it('returns zeros when USAGE_ANALYTICS is missing', async () => {
    const totals = await getTotals({ USAGE_ANALYTICS: undefined });
    expect(totals).toEqual({ generations: 0, users: 0, revenue: 0 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// checkDailyLimit
// ─────────────────────────────────────────────────────────────────────────────
describe('checkDailyLimit', () => {
  let env;
  beforeEach(() => { env = createMockEnv(); });

  it('returns true when no cost data exists yet', async () => {
    const allowed = await checkDailyLimit(env);
    expect(allowed).toBe(true);
  });

  it('returns true when daily count is below 2000', async () => {
    const today = new Date().toISOString().split('T')[0];
    await env.USAGE_ANALYTICS.put(`cost:${today}`, JSON.stringify({ generations: 1999 }));
    const allowed = await checkDailyLimit(env);
    expect(allowed).toBe(true);
  });

  it('returns false when daily count equals 2000', async () => {
    const today = new Date().toISOString().split('T')[0];
    await env.USAGE_ANALYTICS.put(`cost:${today}`, JSON.stringify({ generations: 2000 }));
    const allowed = await checkDailyLimit(env);
    expect(allowed).toBe(false);
  });

  it('returns false when daily count exceeds 2000', async () => {
    const today = new Date().toISOString().split('T')[0];
    await env.USAGE_ANALYTICS.put(`cost:${today}`, JSON.stringify({ generations: 2500 }));
    const allowed = await checkDailyLimit(env);
    expect(allowed).toBe(false);
  });

  it('returns true (fail-open) when USAGE_ANALYTICS is missing', async () => {
    const allowed = await checkDailyLimit({ USAGE_ANALYTICS: undefined });
    expect(allowed).toBe(true);
  });

  it('returns true (fail-open) when KV throws an error', async () => {
    const brokenEnv = {
      USAGE_ANALYTICS: {
        get: () => Promise.reject(new Error('KV down')),
        put: () => Promise.reject(new Error('KV down')),
      },
    };
    const allowed = await checkDailyLimit(brokenEnv);
    expect(allowed).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// recordGenerationCost
// ─────────────────────────────────────────────────────────────────────────────
describe('recordGenerationCost', () => {
  let env;
  beforeEach(() => { env = createMockEnv(); });

  it('creates cost entry with generations=1 on first call', async () => {
    await recordGenerationCost(env);
    const today = new Date().toISOString().split('T')[0];
    const raw   = env.USAGE_ANALYTICS._rawGet(`cost:${today}`);
    const data  = JSON.parse(raw);
    expect(data.generations).toBe(1);
  });

  it('increments generations on subsequent calls', async () => {
    await recordGenerationCost(env);
    await recordGenerationCost(env);
    await recordGenerationCost(env);
    const today = new Date().toISOString().split('T')[0];
    const raw   = env.USAGE_ANALYTICS._rawGet(`cost:${today}`);
    const data  = JSON.parse(raw);
    expect(data.generations).toBe(3);
  });

  it('does not throw when USAGE_ANALYTICS is missing', async () => {
    await expect(recordGenerationCost({ USAGE_ANALYTICS: undefined })).resolves.not.toThrow();
  });

  it('limit check reflects cost recorded', async () => {
    // Fill up to limit
    const today = new Date().toISOString().split('T')[0];
    await env.USAGE_ANALYTICS.put(`cost:${today}`, JSON.stringify({ generations: 1999 }));

    expect(await checkDailyLimit(env)).toBe(true);

    await recordGenerationCost(env);  // now at 2000

    expect(await checkDailyLimit(env)).toBe(false);
  });
});
