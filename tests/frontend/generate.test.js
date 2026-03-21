/**
 * tests/frontend/generate.test.js
 *
 * Tests the /generate worker endpoint (structured mode):
 *   - Request shape validation (category, face_image_url, GEN_QUEUE)
 *   - Response shape (success, job_id)
 *   - /result/:job_id polling endpoint (202 → 200)
 *   - Prompt moderation blocks bad free-text fields
 *   - Per-user rate limiting (429 after 4 requests)
 *   - Credit system integration (403 for no category access, 402 for quota)
 *   - Origin guard (403 for disallowed origin)
 *
 * The worker.js fetch handler is imported directly — no HTTP server required.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import worker from '@worker/worker.js';
import { createMockEnv, makeFalResponse } from '@helpers/mockEnv.js';
import { addCredit, createTrialCredit } from '@utils/creditManager.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_ORIGIN = 'http://localhost:3000';  // matches worker.js ALLOWED_ORIGINS

function makeGenerateRequest(body, origin = ALLOWED_ORIGIN) {
  return new Request('https://worker.com/generate', {
    method:  'POST',
    headers: {
      'Content-Type':       'application/json',
      'Origin':             origin,
      'CF-Connecting-IP':   '1.2.3.4',
      'x-turnstile-token':  '',  // Turnstile disabled in test env (TURNSTILE_SECRET=null)
    },
    body: JSON.stringify(body),
  });
}

function makeResultRequest(jobId, origin = ALLOWED_ORIGIN) {
  return new Request(`https://worker.com/result/${jobId}`, {
    method:  'GET',
    headers: { 'Origin': origin },
  });
}

function makeCtx() {
  return { waitUntil: vi.fn() };
}

afterEach(() => vi.unstubAllGlobals());

// ─────────────────────────────────────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /', () => {
  it('returns 200 with service status', async () => {
    const env = createMockEnv();
    const req = new Request('https://worker.com/', { method: 'GET' });
    const res = await worker.fetch(req, env, makeCtx());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.service).toContain('PotretAI');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /generate — origin guard
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /generate — origin guard', () => {
  it('returns 403 for requests from disallowed origin', async () => {
    const env = createMockEnv();
    const req = makeGenerateRequest(
      { category: 'prewedding', face_image_url_pria: 'https://cdn.r2.dev/f.jpg', user_id: 'u1' },
      'https://definitely-evil.com'
    );
    const res = await worker.fetch(req, env, makeCtx());
    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /generate — structured mode validation
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /generate — structured mode validation', () => {
  let env;
  beforeEach(() => { env = createMockEnv(); });

  it('returns 400 for unknown category', async () => {
    const req = makeGenerateRequest({
      category:       'selfie',
      face_image_url: 'https://cdn.r2.dev/f.jpg',
      user_id:        'u1',
    });
    const res = await worker.fetch(req, env, makeCtx());
    expect(res.status).toBe(400);
  });

  it('returns 400 when all face_image_url fields are missing', async () => {
    const req = makeGenerateRequest({ category: 'prewedding', user_id: 'u1' });
    const res = await worker.fetch(req, env, makeCtx());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('face_image_url');
  });

  it('returns 500 when GEN_QUEUE is not configured', async () => {
    const noQueueEnv = createMockEnv({ GEN_QUEUE: undefined });
    const req = makeGenerateRequest({
      category:       'prewedding',
      face_image_url: 'https://cdn.r2.dev/f.jpg',
      user_id:        'u1',
    });
    const res = await worker.fetch(req, noQueueEnv, makeCtx());
    expect(res.status).toBe(500);
  });

  it('returns 400 for invalid JSON body', async () => {
    const req = new Request('https://worker.com/generate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': ALLOWED_ORIGIN, 'CF-Connecting-IP': '1.2.3.4' },
      body:    'not json at all!!!',
    });
    const res = await worker.fetch(req, env, makeCtx());
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /generate — successful job queuing
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /generate — successful queuing', () => {
  let env;

  beforeEach(async () => {
    env = createMockEnv();
    // Pro plan gives access to all 5 categories including prewedding
    await addCredit('user_gen_1', 'pro', env);
  });

  it('returns 200 with job_id for valid structured request', async () => {
    const req = makeGenerateRequest({
      category:             'prewedding',
      face_image_url_pria:  'https://test.r2.dev/faces/pria.jpg',
      face_image_url_wanita:'https://test.r2.dev/faces/wanita.jpg',
      user_id:              'user_gen_1',
    });
    const res = await worker.fetch(req, env, makeCtx());
    expect(res.status).toBe(202);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(typeof body.job_id).toBe('string');
    expect(body.job_id.length).toBeGreaterThan(8);
  });

  it('enqueues the job into GEN_QUEUE', async () => {
    const req = makeGenerateRequest({
      category:             'prewedding',
      face_image_url_pria:  'https://test.r2.dev/faces/pria.jpg',
      user_id:              'user_gen_1',
    });
    await worker.fetch(req, env, makeCtx());
    expect(env.GEN_QUEUE._count()).toBe(1);
  });

  it('queued job has correct category and job_id fields', async () => {
    const req = makeGenerateRequest({
      category:             'studio',
      face_image_url_wanita:'https://test.r2.dev/faces/wanita.jpg',
      studio_mode:          'solo_wanita',
      user_id:              'user_gen_1',
    });
    await worker.fetch(req, env, makeCtx());
    const msg = env.GEN_QUEUE._last();
    expect(msg.body.category).toBe('studio');
    expect(typeof msg.body.job_id).toBe('string');
  });

  it('deducts 1 generate credit after successful queuing', async () => {
    const before = (await import('@utils/creditManager.js'))
      .getUserCredit('user_gen_1', env);

    const req = makeGenerateRequest({
      category:             'prewedding',
      face_image_url_pria:  'https://test.r2.dev/faces/pria.jpg',
      user_id:              'user_gen_1',
    });
    await worker.fetch(req, env, makeCtx());

    const { getUserCredit } = await import('@utils/creditManager.js');
    const after = await getUserCredit('user_gen_1', env);
    expect(after.generates_remaining).toBe(149);  // pro: 150 → 149
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /generate — prompt moderation
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /generate — prompt moderation', () => {
  let env;
  beforeEach(async () => {
    env = createMockEnv();
    await addCredit('user_mod', 'pro', env);
  });

  it('returns 400 when pose contains banned word', async () => {
    const req = makeGenerateRequest({
      category:             'prewedding',
      face_image_url_pria:  'https://test.r2.dev/f.jpg',
      user_id:              'user_mod',
      pose:                 'naked on the beach',
    });
    const res = await worker.fetch(req, env, makeCtx());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('not allowed');
  });

  it('returns 400 when expression contains banned word', async () => {
    const req = makeGenerateRequest({
      category:             'prewedding',
      face_image_url_pria:  'https://test.r2.dev/f.jpg',
      user_id:              'user_mod',
      expression:           'nude and happy',
    });
    const res = await worker.fetch(req, env, makeCtx());
    expect(res.status).toBe(400);
  });

  it('allows clean prompts through moderation', async () => {
    const req = makeGenerateRequest({
      category:             'prewedding',
      face_image_url_pria:  'https://test.r2.dev/f.jpg',
      user_id:              'user_mod',
      pose:                 'walking hand-in-hand at golden hour',
      expression:           'deeply in love, tender smiles',
    });
    const res = await worker.fetch(req, env, makeCtx());
    expect(res.status).toBe(202);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /generate — credit system
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /generate — credit system', () => {
  let env;

  beforeEach(() => { env = createMockEnv(); });

  it('trial user cannot access prewedding (403)', async () => {
    await createTrialCredit('trial_user', env);
    const req = makeGenerateRequest({
      category:             'prewedding',
      face_image_url_pria:  'https://test.r2.dev/f.jpg',
      user_id:              'trial_user',
    });
    const res = await worker.fetch(req, env, makeCtx());
    expect(res.status).toBe(403);
  });

  it('trial user can access studio (enqueued)', async () => {
    await createTrialCredit('trial_user_studio', env);
    const req = makeGenerateRequest({
      category:             'studio',
      face_image_url_wanita:'https://test.r2.dev/faces/wanita.jpg',
      studio_mode:          'solo_wanita',
      user_id:              'trial_user_studio',
    });
    const res = await worker.fetch(req, env, makeCtx());
    expect(res.status).toBe(202);
  });

  it('returns 402 when user has 0 generates remaining', async () => {
    // Give user starter but exhaust all credits
    await addCredit('exhausted_user', 'starter', env);
    // Set generates_remaining to 0
    const { getUserCredit } = await import('@utils/creditManager.js');
    let credit = await getUserCredit('exhausted_user', env);
    credit.generates_remaining = 0;
    await env.USER_CREDITS.put('user:exhausted_user', JSON.stringify(credit));

    const req = makeGenerateRequest({
      category:             'studio',
      face_image_url_wanita:'https://test.r2.dev/faces/wanita.jpg',
      user_id:              'exhausted_user',
    });
    const res = await worker.fetch(req, env, makeCtx());
    expect(res.status).toBe(402);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /result/:job_id — polling
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /result/:job_id', () => {
  let env;
  beforeEach(() => { env = createMockEnv(); });

  it('returns 202 (processing) when result is not ready', async () => {
    const req = makeResultRequest('job-not-ready');
    const res = await worker.fetch(req, env, makeCtx());
    expect(res.status).toBe(202);
    const body = await res.json();
    expect(body.status).toBe('processing');
  });

  it('returns 200 with result data when result exists', async () => {
    const jobId = 'job-ready-001';
    const resultData = {
      success:   true,
      job_id:    jobId,
      images:    ['https://cdn.potretai.com/images/job-ready-001_1.png'],
      completed_at: Math.floor(Date.now() / 1000),
    };
    await env.RESULT_BUCKET.put(
      `results/${jobId}.json`,
      JSON.stringify(resultData),
      { httpMetadata: { contentType: 'application/json' } }
    );

    const req = makeResultRequest(jobId);
    const res = await worker.fetch(req, env, makeCtx());
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.job_id).toBe(jobId);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /generate — per-user rate limit
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /generate — per-user rate limit', () => {
  it('returns 429 after 4 requests from the same user in one window', async () => {
    const env = createMockEnv();
    await addCredit('rate_user', 'pro', env);

    const makeReq = () => makeGenerateRequest({
      category:             'prewedding',
      face_image_url_pria:  'https://test.r2.dev/faces/pria.jpg',
      user_id:              'rate_user',
    });

    const ctx = makeCtx();

    // First 4 should be queued (202)
    for (let i = 0; i < 4; i++) {
      const res = await worker.fetch(makeReq(), env, ctx);
      expect(res.status).toBe(202);
    }

    // 5th should be rate-limited (429)
    const res5 = await worker.fetch(makeReq(), env, ctx);
    expect(res5.status).toBe(429);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 404 for unknown routes
// ─────────────────────────────────────────────────────────────────────────────
describe('Unknown routes', () => {
  it('returns 404 for unknown path', async () => {
    const env = createMockEnv();
    const req = new Request('https://worker.com/unknown-endpoint', {
      method:  'GET',
      headers: { Origin: ALLOWED_ORIGIN },
    });
    const res = await worker.fetch(req, env, makeCtx());
    expect(res.status).toBe(404);
  });
});
