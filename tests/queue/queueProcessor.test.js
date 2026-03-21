/**
 * tests/queue/queueProcessor.test.js
 *
 * Tests the Cloudflare Queue consumer (generateQueue.js):
 *   processQueue   — iterates over batch messages
 *   handleJob      — full pipeline per message
 *   Malformed job  — missing job_id / category / input → ack + drop
 *   Daily limit    — checkDailyLimit=false → ack + drop
 *   buildPrompt    — failure → retry
 *   No face URL    — ack + drop
 *   fal.ai failure — retry
 *   Image fetch    — failure → retry
 *   R2 upload      — failure → retry
 *   Happy path     — stores 4 PNGs + results JSON + ack
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { processQueue }       from '@queue/generateQueue.js';
import { createMockEnv, MockQueueMessage, preweddingInput, studioInput, familyInput, makeFalResponse, makeFalError } from '@helpers/mockEnv.js';

// ─────────────────────────────────────────────────────────────────────────────
// Stub fetch helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Success: detects URL type — fal.ai calls get JSON, CDN downloads get PNG bytes */
function stubFullSuccess() {
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    // fal.ai generation call — returns JSON with images array
    if (String(url).includes('fal.run') || String(url).includes('fal.ai')) {
      return makeFalResponse();
    }
    // CDN image download — returns raw PNG bytes
    return new Response(new Uint8Array([0x89, 0x50, 0x4E, 0x47]).buffer, {
      status: 200,
      headers: { 'content-type': 'image/png' },
    });
  }));
}

/** Stub where fal.ai call N (1-indexed) fails */
function stubFalFailAt(failIndex) {
  let falCallCount = 0;
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    if (String(url).includes('fal.run') || String(url).includes('fal.ai')) {
      falCallCount++;
      if (falCallCount === failIndex) return makeFalError(500, 'Server Error');
      return makeFalResponse();
    }
    return new Response(new Uint8Array([0x89, 0x50]).buffer, {
      status: 200,
      headers: { 'content-type': 'image/png' },
    });
  }));
}

/** Stub where image download call N (1-indexed) fails */
function stubImageDownloadFailAt(downloadIndex) {
  let downloadCount = 0;
  vi.stubGlobal('fetch', vi.fn(async (url) => {
    if (String(url).includes('fal.run') || String(url).includes('fal.ai')) {
      return makeFalResponse();
    }
    // CDN image download
    downloadCount++;
    if (downloadCount === downloadIndex) {
      return new Response('Not Found', { status: 404 });
    }
    return new Response(new Uint8Array([0x89, 0x50]).buffer, {
      status: 200,
      headers: { 'content-type': 'image/png' },
    });
  }));
}

afterEach(() => { vi.unstubAllGlobals(); });

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeJob(overrides = {}) {
  return {
    job_id:   'job-test-001',
    category: 'prewedding',
    input:    preweddingInput(),
    ...overrides,
  };
}

function makeBatch(messages) {
  return { messages };
}

// ─────────────────────────────────────────────────────────────────────────────
// processQueue — batch iteration
// ─────────────────────────────────────────────────────────────────────────────
describe('processQueue — batch iteration', () => {
  it('processes each message in the batch', async () => {
    stubFullSuccess();
    const env = createMockEnv();
    const msg1 = new MockQueueMessage(makeJob({ job_id: 'job-a' }));
    const msg2 = new MockQueueMessage(makeJob({ job_id: 'job-b' }));
    const batch = makeBatch([msg1, msg2]);

    await processQueue(batch, env);

    // Both should be acked (assuming success)
    expect(msg1.acked).toBe(true);
    expect(msg2.acked).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Malformed job — missing required fields
// ─────────────────────────────────────────────────────────────────────────────
describe('handleJob — malformed job', () => {
  let env;
  beforeEach(() => { env = createMockEnv(); });

  it('acks and drops job missing job_id', async () => {
    const msg = new MockQueueMessage({ category: 'prewedding', input: preweddingInput() });
    await processQueue(makeBatch([msg]), env);
    expect(msg.acked).toBe(true);
    expect(msg.retried).toBe(false);
  });

  it('acks and drops job missing category', async () => {
    const msg = new MockQueueMessage({ job_id: 'j1', input: preweddingInput() });
    await processQueue(makeBatch([msg]), env);
    expect(msg.acked).toBe(true);
    expect(msg.retried).toBe(false);
  });

  it('acks and drops job missing input', async () => {
    const msg = new MockQueueMessage({ job_id: 'j1', category: 'prewedding' });
    await processQueue(makeBatch([msg]), env);
    expect(msg.acked).toBe(true);
    expect(msg.retried).toBe(false);
  });

  it('acks and drops completely empty job', async () => {
    const msg = new MockQueueMessage({});
    await processQueue(makeBatch([msg]), env);
    expect(msg.acked).toBe(true);
    expect(msg.retried).toBe(false);
  });

  it('acks and drops null body', async () => {
    const msg = new MockQueueMessage(null);
    await processQueue(makeBatch([msg]), env);
    expect(msg.acked).toBe(true);
    expect(msg.retried).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Daily limit guard
// ─────────────────────────────────────────────────────────────────────────────
describe('handleJob — daily limit guard', () => {
  it('acks and drops job when daily limit is reached', async () => {
    const env = createMockEnv();
    // Seed the cost counter at MAX (2000)
    const today = new Date().toISOString().split('T')[0];
    await env.USAGE_ANALYTICS.put(`cost:${today}`, JSON.stringify({ generations: 2000 }));

    const msg = new MockQueueMessage(makeJob());
    await processQueue(makeBatch([msg]), env);
    expect(msg.acked).toBe(true);
    expect(msg.retried).toBe(false);
  });

  it('allows job when daily count is below limit', async () => {
    stubFullSuccess();
    const env = createMockEnv();
    const today = new Date().toISOString().split('T')[0];
    await env.USAGE_ANALYTICS.put(`cost:${today}`, JSON.stringify({ generations: 1999 }));

    const msg = new MockQueueMessage(makeJob());
    await processQueue(makeBatch([msg]), env);
    expect(msg.acked).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// No face URL → ack + drop
// ─────────────────────────────────────────────────────────────────────────────
describe('handleJob — missing face URL', () => {
  let env;
  beforeEach(() => { env = createMockEnv(); });

  it('acks and drops prewedding job with no face URLs', async () => {
    const input = preweddingInput({
      face_image_url_pria:  null,
      face_image_url_wanita: null,
      face_image_url:        null,
    });
    const msg = new MockQueueMessage(makeJob({ input }));
    await processQueue(makeBatch([msg]), env);
    expect(msg.acked).toBe(true);
    expect(msg.retried).toBe(false);
  });

  it('acks and drops studio job with no face URL', async () => {
    const input = studioInput({
      face_image_url_wanita: null,
      face_image_url:        null,
    });
    const msg = new MockQueueMessage({
      job_id:   'job-studio-no-face',
      category: 'studio',
      input,
    });
    await processQueue(makeBatch([msg]), env);
    expect(msg.acked).toBe(true);
    expect(msg.retried).toBe(false);
  });

  it('acks and drops family job with no face URLs', async () => {
    const input = familyInput({
      face_image_url_ayah: null,
      face_image_url_ibu:  null,
      face_image_url:      null,
    });
    const msg = new MockQueueMessage({
      job_id:   'job-family-no-face',
      category: 'family',
      input,
    });
    await processQueue(makeBatch([msg]), env);
    expect(msg.acked).toBe(true);
    expect(msg.retried).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// fal.ai generation failure → retry
// ─────────────────────────────────────────────────────────────────────────────
describe('handleJob — fal.ai failure → retry', () => {
  it('retries when fal.ai returns 500 on first call', async () => {
    stubFalFailAt(1);
    const env = createMockEnv();
    const msg = new MockQueueMessage(makeJob());
    await processQueue(makeBatch([msg]), env);
    expect(msg.retried).toBe(true);
    expect(msg.acked).toBe(false);
  });

  it('retries when fal.ai returns 500 on third call', async () => {
    stubFalFailAt(3);
    const env = createMockEnv();
    const msg = new MockQueueMessage(makeJob());
    await processQueue(makeBatch([msg]), env);
    expect(msg.retried).toBe(true);
    expect(msg.acked).toBe(false);
  });

  it('retries on network error from fal.ai', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))));
    const env = createMockEnv();
    const msg = new MockQueueMessage(makeJob());
    await processQueue(makeBatch([msg]), env);
    expect(msg.retried).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Image download failure → retry
// ─────────────────────────────────────────────────────────────────────────────
describe('handleJob — image download failure → retry', () => {
  it('retries when first image download fails (404)', async () => {
    stubImageDownloadFailAt(1);
    const env = createMockEnv();
    const msg = new MockQueueMessage(makeJob());
    await processQueue(makeBatch([msg]), env);
    expect(msg.retried).toBe(true);
    expect(msg.acked).toBe(false);
  });

  it('retries when third image download fails', async () => {
    stubImageDownloadFailAt(3);
    const env = createMockEnv();
    const msg = new MockQueueMessage(makeJob());
    await processQueue(makeBatch([msg]), env);
    expect(msg.retried).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// R2 upload failure → retry
// ─────────────────────────────────────────────────────────────────────────────
describe('handleJob — R2 upload failure → retry', () => {
  it('retries when RESULT_BUCKET.put throws', async () => {
    // Stub fal.ai + image download to succeed, R2 to fail
    let callCount = 0;
    vi.stubGlobal('fetch', vi.fn(async () => {
      callCount++;
      if (callCount <= 4) return makeFalResponse();
      return new Response(new Uint8Array([0x00]).buffer, {
        status: 200,
        headers: { 'content-type': 'image/png' },
      });
    }));

    const env = createMockEnv();
    // Override RESULT_BUCKET to throw on put
    env.RESULT_BUCKET = {
      put: vi.fn(() => Promise.reject(new Error('R2 unavailable'))),
      get: vi.fn(() => Promise.resolve(null)),
    };

    const msg = new MockQueueMessage(makeJob());
    await processQueue(makeBatch([msg]), env);
    expect(msg.retried).toBe(true);
    expect(msg.acked).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Happy path — successful generation
// ─────────────────────────────────────────────────────────────────────────────
describe('handleJob — happy path', () => {
  let env;
  let msg;

  beforeEach(async () => {
    stubFullSuccess();
    env = createMockEnv();
    msg = new MockQueueMessage(makeJob({ job_id: 'job-happy-001' }));
    await processQueue(makeBatch([msg]), env);
  });

  it('acks the message on success', () => {
    expect(msg.acked).toBe(true);
    expect(msg.retried).toBe(false);
  });

  it('stores 4 PNG images in RESULT_BUCKET', () => {
    for (let i = 1; i <= 4; i++) {
      expect(env.RESULT_BUCKET._has(`images/job-happy-001_${i}.png`)).toBe(true);
    }
  });

  it('stores results JSON metadata in RESULT_BUCKET', () => {
    expect(env.RESULT_BUCKET._has('results/job-happy-001.json')).toBe(true);
  });

  it('results JSON contains success=true', () => {
    const raw = env.RESULT_BUCKET._rawGet('results/job-happy-001.json');
    const meta = JSON.parse(raw.value);
    expect(meta.success).toBe(true);
  });

  it('results JSON contains 4 image CDN URLs', () => {
    const raw = env.RESULT_BUCKET._rawGet('results/job-happy-001.json');
    const meta = JSON.parse(raw.value);
    expect(meta.images).toHaveLength(4);
  });

  it('CDN URLs start with https://cdn.potretai.com', () => {
    const raw = env.RESULT_BUCKET._rawGet('results/job-happy-001.json');
    const meta = JSON.parse(raw.value);
    meta.images.forEach(url => {
      expect(url).toContain('cdn.potretai.com');
      expect(url).toContain('job-happy-001');
    });
  });

  it('results JSON contains job_id', () => {
    const raw = env.RESULT_BUCKET._rawGet('results/job-happy-001.json');
    const meta = JSON.parse(raw.value);
    expect(meta.job_id).toBe('job-happy-001');
  });

  it('results JSON contains generation_time as string', () => {
    const raw = env.RESULT_BUCKET._rawGet('results/job-happy-001.json');
    const meta = JSON.parse(raw.value);
    expect(typeof meta.generation_time).toBe('string');
    expect(meta.generation_time).toContain('ms');
  });

  it('increments daily analytics generations counter', async () => {
    const today = new Date().toISOString().split('T')[0];
    const raw = env.USAGE_ANALYTICS._rawGet(`stats:daily:${today}`);
    const stats = JSON.parse(raw);
    expect(stats.generations).toBeGreaterThanOrEqual(1);
  });

  it('increments total analytics generations counter', async () => {
    const raw = env.USAGE_ANALYTICS._rawGet('stats:totals');
    const totals = JSON.parse(raw);
    expect(totals.generations).toBeGreaterThanOrEqual(1);
  });

  it('increments daily cost counter', async () => {
    const today = new Date().toISOString().split('T')[0];
    const raw = env.USAGE_ANALYTICS._rawGet(`cost:${today}`);
    const cost = JSON.parse(raw);
    expect(cost.generations).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Face URL resolution per category
// ─────────────────────────────────────────────────────────────────────────────
describe('handleJob — face URL resolution', () => {
  it('uses pria face URL as primary for prewedding', async () => {
    stubFullSuccess();
    const env = createMockEnv();
    const msg = new MockQueueMessage(makeJob({ category: 'prewedding' }));
    await processQueue(makeBatch([msg]), env);

    // Verify first fal.ai call used pria face URL
    const [, reqInit] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(reqInit.body);
    expect(body.image_url).toBe('https://test.r2.dev/faces/pria.jpg');
  });

  it('uses ayah face URL as primary for family', async () => {
    stubFullSuccess();
    const env = createMockEnv();
    const msg = new MockQueueMessage({
      job_id:   'job-family',
      category: 'family',
      input:    familyInput(),
    });
    await processQueue(makeBatch([msg]), env);

    const [, reqInit] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(reqInit.body);
    expect(body.image_url).toBe('https://test.r2.dev/faces/ayah.jpg');
  });

  it('falls back to ibu face URL when ayah is missing (family)', async () => {
    stubFullSuccess();
    const env = createMockEnv();
    const msg = new MockQueueMessage({
      job_id:   'job-family-ibu',
      category: 'family',
      input:    familyInput({ face_image_url_ayah: null }),
    });
    await processQueue(makeBatch([msg]), env);

    const [, reqInit] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(reqInit.body);
    expect(body.image_url).toBe('https://test.r2.dev/faces/ibu.jpg');
  });

  it('uses wanita face URL for studio solo_wanita', async () => {
    stubFullSuccess();
    const env = createMockEnv();
    const msg = new MockQueueMessage({
      job_id:   'job-studio',
      category: 'studio',
      input:    studioInput({ studio_mode: 'solo_wanita' }),
    });
    await processQueue(makeBatch([msg]), env);

    const [, reqInit] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(reqInit.body);
    expect(body.image_url).toBe('https://test.r2.dev/faces/wanita.jpg');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Watermark injection
// ─────────────────────────────────────────────────────────────────────────────
describe('handleJob — watermark', () => {
  it('injects watermark text in prompt when watermark=true', async () => {
    stubFullSuccess();
    const env = createMockEnv();
    const input = preweddingInput({ watermark: true });
    const msg = new MockQueueMessage(makeJob({ input }));
    await processQueue(makeBatch([msg]), env);

    const [, reqInit] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(reqInit.body);
    expect(body.prompt).toContain('PotretAI Trial');
  });

  it('does NOT inject watermark when watermark=false', async () => {
    stubFullSuccess();
    const env = createMockEnv();
    const input = preweddingInput({ watermark: false });
    const msg = new MockQueueMessage(makeJob({ input }));
    await processQueue(makeBatch([msg]), env);

    const [, reqInit] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(reqInit.body);
    expect(body.prompt).not.toContain('PotretAI Trial');
  });
});
