/**
 * tests/storage/storage.test.js
 *
 * Tests all R2 storage operations across the system:
 *   Face uploads     — FACES_BUCKET at faces/{user_id}/{filename}
 *   Generated images — RESULT_BUCKET at images/{job_id}_{1..4}.png
 *   Result metadata  — RESULT_BUCKET at results/{job_id}.json
 *   Payment proofs   — PAYMENT_PROOFS at proofs/{order_id}.{ext}
 *   Share lookup     — result JSON readable by share handler
 *
 * Integration tests use submitProof.js and the queue pipeline directly.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { submitProof }   from '@payments/submitProof.js';
import { processQueue }  from '@queue/generateQueue.js';
import {
  createMockEnv,
  MockQueueMessage,
  studioInput,
  makeFalResponse,
} from '@helpers/mockEnv.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeProofRequest(orderId, mimeType = 'image/jpeg') {
  const fd = new FormData();
  fd.append('order_id', orderId);
  fd.append('proof', new File(
    [new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0])],
    'proof.jpg',
    { type: mimeType }
  ));
  return new Request('https://worker.com/submit-payment-proof', {
    method:  'POST',
    headers: { Origin: 'https://potretai.com' },
    body:    fd,
  });
}

function makeJob(overrides = {}) {
  return {
    job_id:   'job-storage-001',
    category: 'studio',
    input:    studioInput(),
    ...overrides,
  };
}

function stubFullSuccess() {
  let callCount = 0;
  vi.stubGlobal('fetch', vi.fn(async () => {
    callCount++;
    if (callCount <= 4) return makeFalResponse();
    return new Response(new Uint8Array([0x89, 0x50, 0x4E, 0x47]).buffer, {
      status: 200,
      headers: { 'content-type': 'image/png' },
    });
  }));
}

afterEach(() => vi.unstubAllGlobals());

// ─────────────────────────────────────────────────────────────────────────────
// Payment proof storage — PAYMENT_PROOFS R2
// ─────────────────────────────────────────────────────────────────────────────
describe('Payment proof storage — PAYMENT_PROOFS', () => {
  let env;
  let orderId;

  beforeEach(async () => {
    env     = createMockEnv();
    orderId = 'ORD-STORAGE1';
    // Seed order in waiting_payment state
    await env.PAYMENT_ORDERS.put(
      `order:${orderId}`,
      JSON.stringify({
        order_id:   orderId,
        user_id:    'user_s1',
        plan:       'starter',
        price:      97000,
        status:     'waiting_payment',
        created_at: Math.floor(Date.now() / 1000),
      })
    );
  });

  it('stores JPEG proof at proofs/{order_id}.jpg', async () => {
    const req = makeProofRequest(orderId, 'image/jpeg');
    await submitProof(req, env);

    expect(env.PAYMENT_PROOFS._has(`proofs/${orderId}.jpg`)).toBe(true);
  });

  it('stores PNG proof at proofs/{order_id}.png', async () => {
    // Re-seed order for PNG test
    const pngOrderId = 'ORD-PNG1';
    await env.PAYMENT_ORDERS.put(
      `order:${pngOrderId}`,
      JSON.stringify({ order_id: pngOrderId, user_id: 'u', plan: 'starter', price: 97000, status: 'waiting_payment', created_at: 0 })
    );

    const fd = new FormData();
    fd.append('order_id', pngOrderId);
    fd.append('proof', new File([new Uint8Array([0x89, 0x50])], 'proof.png', { type: 'image/png' }));
    const req = new Request('https://worker.com/submit-payment-proof', {
      method: 'POST',
      headers: { Origin: 'https://potretai.com' },
      body: fd,
    });

    await submitProof(req, env);
    expect(env.PAYMENT_PROOFS._has(`proofs/${pngOrderId}.png`)).toBe(true);
  });

  it('updates PAYMENT_ORDERS KV status to proof_uploaded', async () => {
    const req = makeProofRequest(orderId, 'image/jpeg');
    await submitProof(req, env);

    const raw  = env.PAYMENT_ORDERS._rawGet(`order:${orderId}`);
    const order = JSON.parse(raw);
    expect(order.status).toBe('proof_uploaded');
  });

  it('stores proof_url in the updated order', async () => {
    const req = makeProofRequest(orderId, 'image/jpeg');
    await submitProof(req, env);

    const raw   = env.PAYMENT_ORDERS._rawGet(`order:${orderId}`);
    const order  = JSON.parse(raw);
    expect(order.proof_url).toContain(`proofs/${orderId}`);
  });

  it('returns 422 for a non-image file type', async () => {
    const fd = new FormData();
    fd.append('order_id', orderId);
    fd.append('proof', new File(['<html>bad</html>'], 'hack.html', { type: 'text/html' }));
    const req = new Request('https://worker.com/submit-payment-proof', {
      method: 'POST',
      headers: { Origin: 'https://potretai.com' },
      body: fd,
    });
    const res = await submitProof(req, env);
    expect(res.status).toBe(422);
  });

  it('returns 422 for an oversized file (>5MB)', async () => {
    const bigFile = new Uint8Array(5 * 1024 * 1024 + 1);
    const fd = new FormData();
    fd.append('order_id', orderId);
    fd.append('proof', new File([bigFile], 'big.jpg', { type: 'image/jpeg' }));
    const req = new Request('https://worker.com/submit-payment-proof', {
      method: 'POST',
      headers: { Origin: 'https://potretai.com' },
      body: fd,
    });
    const res = await submitProof(req, env);
    expect(res.status).toBe(422);
  });

  it('returns 404 for non-existent order', async () => {
    const req = makeProofRequest('ORD-GHOST', 'image/jpeg');
    const res = await submitProof(req, env);
    expect(res.status).toBe(404);
  });

  it('returns 409 if order is already proof_uploaded', async () => {
    // Upload once
    const req1 = makeProofRequest(orderId, 'image/jpeg');
    await submitProof(req1, env);

    // Try again — order is now proof_uploaded
    const req2 = makeProofRequest(orderId, 'image/jpeg');
    const res  = await submitProof(req2, env);
    expect(res.status).toBe(409);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Generated images storage — RESULT_BUCKET
// ─────────────────────────────────────────────────────────────────────────────
describe('Generated images storage — RESULT_BUCKET', () => {
  let env;

  beforeEach(() => { env = createMockEnv(); });

  it('stores exactly 4 PNGs at images/{job_id}_{1..4}.png', async () => {
    stubFullSuccess();
    const msg = new MockQueueMessage(makeJob({ job_id: 'job-img-test' }));
    await processQueue({ messages: [msg] }, env);

    for (let i = 1; i <= 4; i++) {
      expect(env.RESULT_BUCKET._has(`images/job-img-test_${i}.png`)).toBe(true);
    }
  });

  it('each stored image has binary content', async () => {
    stubFullSuccess();
    const msg = new MockQueueMessage(makeJob({ job_id: 'job-binary-test' }));
    await processQueue({ messages: [msg] }, env);

    const entry = env.RESULT_BUCKET._rawGet('images/job-binary-test_1.png');
    expect(entry).not.toBeNull();
  });

  it('images have correct contentType in httpMetadata', async () => {
    stubFullSuccess();
    const msg = new MockQueueMessage(makeJob({ job_id: 'job-meta-test' }));
    await processQueue({ messages: [msg] }, env);

    const entry = env.RESULT_BUCKET._rawGet('images/job-meta-test_1.png');
    expect(entry.meta.contentType).toBe('image/png');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Result metadata storage — RESULT_BUCKET (results/{job_id}.json)
// ─────────────────────────────────────────────────────────────────────────────
describe('Result metadata storage — RESULT_BUCKET', () => {
  let env;

  beforeEach(() => { env = createMockEnv(); });

  it('stores results/{job_id}.json after successful generation', async () => {
    stubFullSuccess();
    const msg = new MockQueueMessage(makeJob({ job_id: 'job-results-001' }));
    await processQueue({ messages: [msg] }, env);

    expect(env.RESULT_BUCKET._has('results/job-results-001.json')).toBe(true);
  });

  it('result JSON has correct structure', async () => {
    stubFullSuccess();
    const msg = new MockQueueMessage(makeJob({ job_id: 'job-struct-001' }));
    await processQueue({ messages: [msg] }, env);

    const raw  = env.RESULT_BUCKET._rawGet('results/job-struct-001.json');
    const meta = JSON.parse(raw.value);

    expect(meta.success).toBe(true);
    expect(meta.job_id).toBe('job-struct-001');
    expect(Array.isArray(meta.images)).toBe(true);
    expect(meta.images).toHaveLength(4);
    expect(typeof meta.prompt).toBe('string');
    expect(typeof meta.generation_time).toBe('string');
    expect(typeof meta.completed_at).toBe('number');
  });

  it('result JSON image URLs point to CDN', async () => {
    stubFullSuccess();
    const msg = new MockQueueMessage(makeJob({ job_id: 'job-cdn-001' }));
    await processQueue({ messages: [msg] }, env);

    const raw  = env.RESULT_BUCKET._rawGet('results/job-cdn-001.json');
    const meta = JSON.parse(raw.value);
    meta.images.forEach(url => {
      expect(url).toMatch(/^https:\/\/cdn\.potretai\.com\/images\//);
    });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Share link lookup — result JSON readable for share handler
// ─────────────────────────────────────────────────────────────────────────────
describe('Share link lookup — result JSON', () => {
  let env;

  beforeEach(() => { env = createMockEnv(); });

  it('result JSON is retrievable by job_id for share handler', async () => {
    stubFullSuccess();
    const jobId = 'job-share-001';
    const msg = new MockQueueMessage(makeJob({ job_id: jobId }));
    await processQueue({ messages: [msg] }, env);

    // Share handler reads results/{id}.json
    const entry = await env.RESULT_BUCKET.get(`results/${jobId}.json`);
    expect(entry).not.toBeNull();

    const text = await entry.text();
    const data = JSON.parse(text);
    expect(data.success).toBe(true);
    expect(data.images).toHaveLength(4);
  });
});
