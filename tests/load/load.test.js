/**
 * tests/load/load.test.js
 *
 * Load and concurrency tests:
 *   - 10 parallel /generate requests → all enqueued (no crashes, unique job_ids)
 *   - Queue stability under 20 concurrent jobs
 *   - Rate limiter — sequential calls verify 4/min limit per user
 *   - Daily cost limit stops jobs at 2000
 *   - Analytics handles sequential writes accurately
 *   - Credit deduction — sequential exhaustion stops at 0
 *
 * Note: MockKV has no transactions. Rate-limiter and analytics tests run
 * sequentially to verify correct logic without concurrency races.
 * fal.ai is stubbed globally via URL detection.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import worker                          from '@worker/worker.js';
import { processQueue }                from '@queue/generateQueue.js';
import { checkRateLimit }              from '@utils/rateLimiter.js';
import { recordGeneration, getTotals } from '@utils/analytics.js';
import { checkDailyLimit, recordGenerationCost } from '@utils/costControl.js';
import { addCredit, getUserCredit }    from '@utils/creditManager.js';
import {
  createMockEnv,
  MockQueueMessage,
  studioInput,
  makeFalResponse,
} from '@helpers/mockEnv.js';

// ─────────────────────────────────────────────────────────────────────────────
// Stub helpers
// ─────────────────────────────────────────────────────────────────────────────

function stubAllFetches() {
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    if (String(url).includes('fal.run') || String(url).includes('fal.ai')) {
      return makeFalResponse();
    }
    return new Response(new Uint8Array([0x89, 0x50]).buffer, {
      status: 200,
      headers: { 'content-type': 'image/png' },
    });
  }));
}

afterEach(() => vi.unstubAllGlobals());

function makeGenerateRequest(userId, origin = 'http://localhost:3000') {
  return new Request('https://worker.com/generate', {
    method:  'POST',
    headers: {
      'Content-Type':     'application/json',
      'Origin':           origin,
      'CF-Connecting-IP': '10.0.0.1',
    },
    body: JSON.stringify({
      category:             'studio',
      face_image_url_wanita:'https://test.r2.dev/faces/wanita.jpg',
      studio_mode:          'solo_wanita',
      user_id:              userId,
    }),
  });
}

function makeCtx() { return { waitUntil: vi.fn() }; }

// ─────────────────────────────────────────────────────────────────────────────
// 10 parallel /generate requests
// ─────────────────────────────────────────────────────────────────────────────
describe('10 parallel /generate requests', () => {
  it('all 10 requests succeed (202) without crashing', async () => {
    const env = createMockEnv();
    // Give 10 unique users pro credits
    await Promise.all(
      Array.from({ length: 10 }, (_, i) => addCredit(`parallel_user_${i}`, 'pro', env))
    );

    const responses = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        worker.fetch(makeGenerateRequest(`parallel_user_${i}`), env, makeCtx())
      )
    );

    const statuses = responses.map(r => r.status);
    expect(statuses.every(s => s === 202)).toBe(true);
  });

  it('enqueues all 10 jobs into GEN_QUEUE', async () => {
    const env = createMockEnv();
    await Promise.all(
      Array.from({ length: 10 }, (_, i) => addCredit(`queue_user_${i}`, 'pro', env))
    );

    await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        worker.fetch(makeGenerateRequest(`queue_user_${i}`), env, makeCtx())
      )
    );

    expect(env.GEN_QUEUE._count()).toBe(10);
  });

  it('each enqueued job has a unique job_id', async () => {
    const env = createMockEnv();
    await Promise.all(
      Array.from({ length: 10 }, (_, i) => addCredit(`unique_user_${i}`, 'pro', env))
    );

    const responses = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        worker.fetch(makeGenerateRequest(`unique_user_${i}`), env, makeCtx())
      )
    );

    const bodies  = await Promise.all(responses.map(r => r.json()));
    const jobIds  = bodies.map(b => b.job_id);
    const unique  = new Set(jobIds);
    expect(unique.size).toBe(10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Queue stability under 20 concurrent jobs
// ─────────────────────────────────────────────────────────────────────────────
describe('Queue stability — 20 concurrent jobs', () => {
  it('processes 20 jobs without crashing (all acked or retried)', async () => {
    stubAllFetches();
    const env  = createMockEnv();
    const msgs = Array.from({ length: 20 }, (_, i) =>
      new MockQueueMessage({
        job_id:   `job-load-${i}`,
        category: 'studio',
        input:    studioInput(),
      })
    );

    await Promise.all(msgs.map(msg =>
      processQueue({ messages: [msg] }, env)
    ));

    const acked   = msgs.filter(m => m.acked).length;
    const retried = msgs.filter(m => m.retried).length;
    expect(acked + retried).toBe(20);  // all jobs handled — no silent drops
  });

  it('all 20 jobs succeed and are acked when fal.ai is healthy', async () => {
    stubAllFetches();
    const env  = createMockEnv();
    const msgs = Array.from({ length: 20 }, (_, i) =>
      new MockQueueMessage({
        job_id:   `job-success-${i}`,
        category: 'studio',
        input:    studioInput(),
      })
    );

    await Promise.all(msgs.map(msg =>
      processQueue({ messages: [msg] }, env)
    ));

    const acked = msgs.filter(m => m.acked).length;
    expect(acked).toBe(20);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Rate limiter — sequential calls per user
// ─────────────────────────────────────────────────────────────────────────────
describe('Rate limiter — sequential calls per user', () => {
  let env;
  beforeEach(() => { env = createMockEnv(); });

  it('allows exactly 4 requests and blocks the 5th', async () => {
    for (let i = 0; i < 4; i++) {
      const ok = await checkRateLimit('rate_test_user', env);
      expect(ok).toBe(true);
    }
    const blocked = await checkRateLimit('rate_test_user', env);
    expect(blocked).toBe(false);
  });

  it('different users have independent rate limit windows', async () => {
    // Exhaust user_A
    for (let i = 0; i < 4; i++) await checkRateLimit('user_A_seq', env);
    expect(await checkRateLimit('user_A_seq', env)).toBe(false);

    // user_B is unaffected
    expect(await checkRateLimit('user_B_seq', env)).toBe(true);
  });

  it('counter increments correctly to 4', async () => {
    await checkRateLimit('counter_user', env);
    await checkRateLimit('counter_user', env);
    const raw = env.RATE_LIMIT._rawGet('rate:counter_user');
    const data = JSON.parse(raw);
    expect(data.count).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Daily cost limit — stops jobs at 2000
// ─────────────────────────────────────────────────────────────────────────────
describe('Daily cost limit — 2000 cap', () => {
  it('stops allowing jobs once 2000 is reached', async () => {
    const env   = createMockEnv();
    const today = new Date().toISOString().split('T')[0];

    // Simulate being at 1999
    await env.USAGE_ANALYTICS.put(`cost:${today}`, JSON.stringify({ generations: 1999 }));

    // 2000th generation — should pass
    expect(await checkDailyLimit(env)).toBe(true);
    await recordGenerationCost(env);   // now at 2000

    // 2001st — should be blocked
    expect(await checkDailyLimit(env)).toBe(false);
  });

  it('acks (drops) queue jobs that exceed daily limit', async () => {
    const env   = createMockEnv();
    const today = new Date().toISOString().split('T')[0];
    await env.USAGE_ANALYTICS.put(`cost:${today}`, JSON.stringify({ generations: 2000 }));

    const msg = new MockQueueMessage({
      job_id:   'job-over-limit',
      category: 'studio',
      input:    studioInput(),
    });
    await processQueue({ messages: [msg] }, env);
    expect(msg.acked).toBe(true);
    expect(msg.retried).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Analytics — sequential writes
// ─────────────────────────────────────────────────────────────────────────────
describe('Analytics — sequential recordGeneration', () => {
  it('counts all 10 generations sequentially', async () => {
    const env = createMockEnv();

    for (let i = 0; i < 10; i++) {
      await recordGeneration(env, `analytics_user_${i}`);
    }

    const totals = await getTotals(env);
    expect(totals.generations).toBe(10);
  });

  it('counts all 10 unique users sequentially', async () => {
    const env = createMockEnv();

    for (let i = 0; i < 10; i++) {
      await recordGeneration(env, `dedup_user_${i}`);
    }

    const totals = await getTotals(env);
    expect(totals.users).toBe(10);
  });

  it('deduplicates the same user across multiple generations', async () => {
    const env = createMockEnv();

    for (let i = 0; i < 5; i++) {
      await recordGeneration(env, 'same_user');
    }

    const totals = await getTotals(env);
    expect(totals.generations).toBe(5);
    expect(totals.users).toBe(1);  // only counted once
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Credit deduction — sequential exhaustion
// ─────────────────────────────────────────────────────────────────────────────
describe('Credit deduction — sequential exhaustion', () => {
  it('trial user can only deduct 1 credit (generates_remaining hits 0)', async () => {
    const env = createMockEnv();
    const { createTrialCredit, deductGenerate, getUserCredit } = await import('@utils/creditManager.js');
    await createTrialCredit('trial_exhaust', env);

    // Use the 1 trial credit
    await deductGenerate('trial_exhaust', env);
    const after = await getUserCredit('trial_exhaust', env);
    expect(after.generates_remaining).toBe(0);
  });

  it('deductGenerate throws on second call when 0 remaining', async () => {
    const env = createMockEnv();
    const { createTrialCredit, deductGenerate } = await import('@utils/creditManager.js');
    await createTrialCredit('trial_throw', env);
    await deductGenerate('trial_throw', env);
    await expect(deductGenerate('trial_throw', env)).rejects.toThrow('quota');
  });

  it('generates_remaining never goes below 0', async () => {
    const env = createMockEnv();
    const { createTrialCredit, deductGenerate, getUserCredit } = await import('@utils/creditManager.js');
    await createTrialCredit('trial_floor', env);

    // Use the 1 credit
    try { await deductGenerate('trial_floor', env); } catch {}
    // Try to over-deduct
    try { await deductGenerate('trial_floor', env); } catch {}

    const credit = await getUserCredit('trial_floor', env);
    expect(credit.generates_remaining).toBeGreaterThanOrEqual(0);
  });

  it('starter plan allows 30 consecutive deductions', async () => {
    const env = createMockEnv();
    const { deductGenerate, getUserCredit } = await import('@utils/creditManager.js');
    await addCredit('starter_30', 'starter', env);

    for (let i = 0; i < 30; i++) {
      await deductGenerate('starter_30', env);
    }

    const credit = await getUserCredit('starter_30', env);
    expect(credit.generates_remaining).toBe(0);
  });
});
