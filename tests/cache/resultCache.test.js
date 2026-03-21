/**
 * tests/cache/resultCache.test.js
 *
 * Tests the RESULT_CACHE KV layer (utils/resultCache.js):
 *   checkCache   — returns null on miss, parsed object on hit
 *   saveCache    — stores result with 24-hour TTL, key prefixed "cache:"
 *   Round-trip   — saveCache then checkCache returns same data
 *   Fail-open    — returns null when RESULT_CACHE binding is missing
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { checkCache, saveCache } from '@utils/resultCache.js';
import { createMockEnv }        from '@helpers/mockEnv.js';

// ─────────────────────────────────────────────────────────────────────────────
// checkCache — cache miss
// ─────────────────────────────────────────────────────────────────────────────
describe('checkCache — cache miss', () => {
  let env;
  beforeEach(() => { env = createMockEnv(); });

  it('returns null for a brand new prompt', async () => {
    const result = await checkCache('A new prompt never seen before', env);
    expect(result).toBeNull();
  });

  it('returns null when RESULT_CACHE binding is missing', async () => {
    const result = await checkCache('any prompt', { RESULT_CACHE: undefined });
    expect(result).toBeNull();
  });

  it('returns null when prompt is empty string', async () => {
    const result = await checkCache('', env);
    expect(result).toBeNull();
  });

  it('returns null when prompt is null', async () => {
    const result = await checkCache(null, env);
    expect(result).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// saveCache + checkCache — round-trip
// ─────────────────────────────────────────────────────────────────────────────
describe('saveCache + checkCache — round-trip', () => {
  let env;
  beforeEach(() => { env = createMockEnv(); });

  it('stores and retrieves a result', async () => {
    const prompt = 'Bali heaven prewedding couple golden hour';
    const data   = { images: ['https://cdn.potretai.com/images/job-abc_1.png'], success: true };

    await saveCache(prompt, data, env);
    const retrieved = await checkCache(prompt, env);

    expect(retrieved).not.toBeNull();
    expect(retrieved.success).toBe(true);
    expect(retrieved.images).toHaveLength(1);
  });

  it('stores under a key prefixed with "cache:"', async () => {
    const prompt = 'studio portrait test';
    await saveCache(prompt, { success: true }, env);

    const keys = env.RESULT_CACHE._keys();
    const hasCacheKey = keys.some(k => k.startsWith('cache:'));
    expect(hasCacheKey).toBe(true);
  });

  it('different prompts are stored under different keys', async () => {
    await saveCache('prompt alpha', { id: 1 }, env);
    await saveCache('prompt beta',  { id: 2 }, env);

    const r1 = await checkCache('prompt alpha', env);
    const r2 = await checkCache('prompt beta',  env);

    expect(r1.id).toBe(1);
    expect(r2.id).toBe(2);
  });

  it('overwrites an existing cache entry', async () => {
    const prompt = 'same prompt overwrite test';
    await saveCache(prompt, { version: 1 }, env);
    await saveCache(prompt, { version: 2 }, env);

    const result = await checkCache(prompt, env);
    expect(result.version).toBe(2);
  });

  it('checkCache returns null after saveCache with no binding', async () => {
    const noEnv = { RESULT_CACHE: undefined };
    // saveCache should not throw
    await expect(saveCache('any prompt', { data: true }, noEnv)).resolves.not.toThrow();
    const result = await checkCache('any prompt', noEnv);
    expect(result).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Prompt hash consistency
// ─────────────────────────────────────────────────────────────────────────────
describe('Prompt hash consistency', () => {
  it('checkCache finds what saveCache stored using the exact same prompt', async () => {
    const env    = createMockEnv();
    const prompt = 'wedding couple Uluwatu Cliff Bali golden hour';
    const stored = { images: ['url1', 'url2', 'url3', 'url4'], job_id: 'job-xyz' };

    await saveCache(prompt, stored, env);
    const hit = await checkCache(prompt, env);

    expect(hit).not.toBeNull();
    expect(hit.job_id).toBe('job-xyz');
    expect(hit.images).toHaveLength(4);
  });

  it('slightly different prompt does not hit cache', async () => {
    const env = createMockEnv();
    await saveCache('exact prompt', { found: true }, env);

    const miss = await checkCache('exact prompt.', env); // trailing dot
    expect(miss).toBeNull();
  });

  it('same prompt called twice returns the same cached value', async () => {
    const env    = createMockEnv();
    const prompt = 'repeated prompt consistency check';
    await saveCache(prompt, { value: 42 }, env);

    const hit1 = await checkCache(prompt, env);
    const hit2 = await checkCache(prompt, env);

    expect(hit1.value).toBe(42);
    expect(hit2.value).toBe(42);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Fail-open behaviour
// ─────────────────────────────────────────────────────────────────────────────
describe('Fail-open — KV errors', () => {
  it('checkCache returns null when KV throws', async () => {
    const brokenEnv = {
      RESULT_CACHE: {
        get: () => Promise.reject(new Error('KV unavailable')),
        put: () => Promise.reject(new Error('KV unavailable')),
      },
    };
    const result = await checkCache('any prompt', brokenEnv);
    expect(result).toBeNull();
  });

  it('saveCache does not throw when KV throws', async () => {
    const brokenEnv = {
      RESULT_CACHE: {
        get: () => Promise.reject(new Error('KV unavailable')),
        put: () => Promise.reject(new Error('KV unavailable')),
      },
    };
    await expect(saveCache('any prompt', { data: true }, brokenEnv)).resolves.not.toThrow();
  });
});
