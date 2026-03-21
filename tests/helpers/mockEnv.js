/**
 * tests/helpers/mockEnv.js — Shared Cloudflare binding mocks
 *
 * Provides in-memory implementations of:
 *   MockKV        — Cloudflare KV Namespace
 *   MockR2Bucket  — Cloudflare R2 Bucket
 *   MockQueue     — Cloudflare Queue producer
 *
 * Usage:
 *   import { createMockEnv, MockKV, MockR2Bucket } from '@helpers/mockEnv.js';
 *   const env = createMockEnv();
 *   const env = createMockEnv({ FAL_KEY: 'custom-key', RATE_LIMIT: new MockKV() });
 */

// ─────────────────────────────────────────────────────────────────────────────
// MockKV — Cloudflare KV Namespace
// ─────────────────────────────────────────────────────────────────────────────
export class MockKV {
  constructor(name = 'KV') {
    this._name  = name;
    this._store = new Map();
  }

  async get(key, typeOrOptions) {
    const val = this._store.get(key) ?? null;
    if (val === null) return null;
    const type = typeof typeOrOptions === 'string' ? typeOrOptions
               : typeOrOptions?.type ?? 'text';
    if (type === 'json')       return JSON.parse(val);
    if (type === 'arrayBuffer') return new TextEncoder().encode(val).buffer;
    return val; // text (default)
  }

  async put(key, value, _options) {
    const stored = typeof value === 'string' ? value
                 : value instanceof ArrayBuffer ? new TextDecoder().decode(value)
                 : JSON.stringify(value);
    this._store.set(key, stored);
  }

  async delete(key) {
    this._store.delete(key);
  }

  async list(options = {}) {
    const prefix = options.prefix || '';
    const limit  = options.limit  || 1000;
    const keys   = [...this._store.keys()]
      .filter(k => k.startsWith(prefix))
      .slice(0, limit)
      .map(name => ({ name, expiration: null, metadata: null }));
    return { keys, list_complete: true, cursor: '' };
  }

  // Test helpers (not part of real KV API)
  _clear()             { this._store.clear(); }
  _size()              { return this._store.size; }
  _rawGet(key)         { return this._store.get(key) ?? null; }
  _rawSet(key, value)  { this._store.set(key, String(value)); }
  _has(key)            { return this._store.has(key); }
  _keys()              { return [...this._store.keys()]; }
}

// ─────────────────────────────────────────────────────────────────────────────
// MockR2Bucket — Cloudflare R2 Bucket
// ─────────────────────────────────────────────────────────────────────────────
export class MockR2Bucket {
  constructor(name = 'R2') {
    this._name  = name;
    this._store = new Map();
  }

  async get(key) {
    const entry = this._store.get(key);
    if (!entry) return null;

    const raw = entry.value;
    return {
      key,
      httpMetadata:  entry.meta || {},
      customMetadata: {},
      arrayBuffer:  async () => typeof raw === 'string'
                              ? new TextEncoder().encode(raw).buffer
                              : raw,
      text:         async () => typeof raw === 'string'
                              ? raw
                              : new TextDecoder().decode(raw),
      json:         async () => JSON.parse(typeof raw === 'string'
                              ? raw
                              : new TextDecoder().decode(raw)),
      body:         null,
    };
  }

  async put(key, value, options) {
    this._store.set(key, { value, meta: options?.httpMetadata || {} });
    return { key, etag: 'mock-etag' };
  }

  async delete(key) {
    this._store.delete(key);
  }

  async list(options = {}) {
    const prefix  = options.prefix || '';
    const limit   = options.limit  || 1000;
    const objects = [...this._store.keys()]
      .filter(k => k.startsWith(prefix))
      .slice(0, limit)
      .map(key => ({ key, etag: 'mock', size: 1024, uploaded: new Date() }));
    return { objects, truncated: false, cursor: '' };
  }

  // Test helpers
  _clear()   { this._store.clear(); }
  _has(key)  { return this._store.has(key); }
  _size()    { return this._store.size; }
  _keys()    { return [...this._store.keys()]; }
  _rawGet(k) { return this._store.get(k) ?? null; }
}

// ─────────────────────────────────────────────────────────────────────────────
// MockQueue — Cloudflare Queue producer
// ─────────────────────────────────────────────────────────────────────────────
export class MockQueue {
  constructor() {
    this.sent = [];
  }

  async send(body, options) {
    this.sent.push({ body, options });
  }

  // Test helpers
  _clear()       { this.sent = []; }
  _last()        { return this.sent[this.sent.length - 1] ?? null; }
  _count()       { return this.sent.length; }
  _getAt(i)      { return this.sent[i] ?? null; }
}

// ─────────────────────────────────────────────────────────────────────────────
// MockQueueMessage — simulates a message in the queue consumer
// ─────────────────────────────────────────────────────────────────────────────
export class MockQueueMessage {
  constructor(body) {
    this.body    = body;
    this.acked   = false;
    this.retried = false;
    this.id      = crypto.randomUUID();
    this.timestamp = new Date();
  }

  ack()   { this.acked   = true; }
  retry() { this.retried = true; }
}

// ─────────────────────────────────────────────────────────────────────────────
// createMockEnv — builds a full mock CF binding environment
// ─────────────────────────────────────────────────────────────────────────────
export function createMockEnv(overrides = {}) {
  return {
    // KV Namespaces
    FACE_CACHE:      new MockKV('FACE_CACHE'),
    PAYMENT_ORDERS:  new MockKV('PAYMENT_ORDERS'),
    USER_CREDITS:    new MockKV('USER_CREDITS'),
    RESULT_CACHE:    new MockKV('RESULT_CACHE'),
    RATE_LIMIT:      new MockKV('RATE_LIMIT'),
    USAGE_ANALYTICS: new MockKV('USAGE_ANALYTICS'),
    AFFILIATE_DATA:  new MockKV('AFFILIATE_DATA'),

    // R2 Buckets
    FACES_BUCKET:    new MockR2Bucket('FACES_BUCKET'),
    RESULT_BUCKET:   new MockR2Bucket('RESULT_BUCKET'),
    PAYMENT_PROOFS:  new MockR2Bucket('PAYMENT_PROOFS'),

    // Queue
    GEN_QUEUE:       new MockQueue(),

    // Secrets (safe test values)
    FAL_KEY:          'test_fal_key_xxxxxxxxxxx',
    ADMIN_KEY:        'test_admin_key_xxxxxxxxx',
    TURNSTILE_SECRET: null,   // null → fail-open (skip in tests by default)

    // Vars
    VERSION:   '3.3.0-test',
    FAL_MODEL: 'fal-ai/flux-pulid',
    R2_CDN_BASE: 'https://test-cdn.r2.dev',

    // Allow caller to override anything
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Fixture helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Returns a minimal valid studio solo input */
export function studioInput(overrides = {}) {
  return {
    category:              'studio',
    studio_mode:           'solo_wanita',
    face_image_url_wanita: 'https://test.r2.dev/faces/wanita.jpg',
    etnis_wanita:          'stunning Indonesian woman, late 20s, elegant slender',
    outfit_wanita:         'magnificent ball gown, full tulle layers',
    studio_tema:           'seamless pure white backdrop, crisp clean studio white',
    lighting:              'butterfly lighting — light directly in front elevated',
    pose:                  'elegant standing portrait, full body',
    expression:            'confident editorial gaze',
    color_grade:           'ultra clean pure white studio grade',
    id_weight:             1,
    watermark:             false,
    user_id:               'user_test_002',
    fal_key:               'test_fal_key_xxxxxxxxxxx',
    ...overrides,
  };
}

/** Fake fal.ai success response body */
export const FAL_SUCCESS_RESPONSE = {
  images: [
    { url: 'https://fal.media/files/test/output_1.jpg', width: 1024, height: 1280 },
  ],
  timings: { inference: 8.2 },
  seed: 12345,
};

/** Create a fake fal.ai HTTP Response */
export function makeFalResponse(overrides = {}) {
  const body = { ...FAL_SUCCESS_RESPONSE, ...overrides };
  return new Response(JSON.stringify(body), {
    status:  200,
    headers: { 'content-type': 'application/json' },
  });
}

/** Create a failed fal.ai HTTP Response */
export function makeFalError(status = 500, message = 'Internal Server Error') {
  return new Response(JSON.stringify({ detail: message }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
