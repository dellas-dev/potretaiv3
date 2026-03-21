/**
 * tests/security/security.test.js
 *
 * Tests the complete security layer:
 *   turnstile.js      — bot protection (Cloudflare Turnstile)
 *   security.js       — CORS origin validation + Content-Type guard
 *   rateLimiter.js    — per-user generation rate limit
 *   promptModeration.js — banned word filter
 *   promptSanitizer.js  — prompt injection prevention
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { verifyTurnstile }        from '@utils/turnstile.js';
import { validateOrigin, requireJson } from '@utils/security.js';
import { checkRateLimit }         from '@utils/rateLimiter.js';
import { checkPrompt, checkAllFields } from '@utils/promptModeration.js';
import { sanitizePrompt }         from '@utils/promptSanitizer.js';
import { createMockEnv, MockKV }  from '@helpers/mockEnv.js';

// ─────────────────────────────────────────────────────────────────────────────
// Turnstile — verifyTurnstile
// ─────────────────────────────────────────────────────────────────────────────
describe('turnstile — verifyTurnstile', () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it('returns true (fail-open) when TURNSTILE_SECRET is not configured', async () => {
    const env = createMockEnv({ TURNSTILE_SECRET: null });
    const result = await verifyTurnstile('any-token', env);
    expect(result).toBe(true);
  });

  it('returns false when TURNSTILE_SECRET is set but no token provided', async () => {
    const env = createMockEnv({ TURNSTILE_SECRET: 'secret_xxx' });
    const result = await verifyTurnstile('', env);
    expect(result).toBe(false);
  });

  it('returns true when Cloudflare Turnstile API says success=true', async () => {
    const env = createMockEnv({ TURNSTILE_SECRET: 'real_secret' });
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      ))
    ));

    const result = await verifyTurnstile('valid-token', env);
    expect(result).toBe(true);
  });

  it('returns false when Cloudflare Turnstile API says success=false', async () => {
    const env = createMockEnv({ TURNSTILE_SECRET: 'real_secret' });
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(new Response(
        JSON.stringify({ success: false, 'error-codes': ['invalid-input-response'] }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      ))
    ));

    const result = await verifyTurnstile('bad-token', env);
    expect(result).toBe(false);
  });

  it('returns false when Turnstile endpoint returns HTTP 500', async () => {
    const env = createMockEnv({ TURNSTILE_SECRET: 'secret' });
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(new Response('Server Error', { status: 500 }))
    ));
    const result = await verifyTurnstile('token', env);
    expect(result).toBe(false);
  });

  it('returns false on network error (not fail-open)', async () => {
    const env = createMockEnv({ TURNSTILE_SECRET: 'secret' });
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))));
    const result = await verifyTurnstile('token', env);
    expect(result).toBe(false);
  });

  it('POSTs to the correct Cloudflare verification URL', async () => {
    const env = createMockEnv({ TURNSTILE_SECRET: 'my_secret' });
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }))
    ));

    await verifyTurnstile('tok', env);
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain('cloudflare.com/turnstile');
    expect(init.method).toBe('POST');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// security.js — validateOrigin
// ─────────────────────────────────────────────────────────────────────────────
describe('security — validateOrigin', () => {
  const makeReq = (origin) => new Request('https://worker.example.com/test', {
    headers: origin ? { Origin: origin } : {},
  });

  it('allows requests from potretai.com', () => {
    expect(validateOrigin(makeReq('https://potretai.com'))).toBe(true);
  });

  it('allows requests from www.potretai.com', () => {
    expect(validateOrigin(makeReq('https://www.potretai.com'))).toBe(true);
  });

  it('allows requests from studiocreative.id', () => {
    expect(validateOrigin(makeReq('https://studiocreative.id'))).toBe(true);
  });

  it('allows requests from localhost:3000', () => {
    expect(validateOrigin(makeReq('http://localhost:3000'))).toBe(true);
  });

  it('allows requests from 127.0.0.1:5500', () => {
    expect(validateOrigin(makeReq('http://127.0.0.1:5500'))).toBe(true);
  });

  it('rejects requests from attacker.com', () => {
    expect(validateOrigin(makeReq('https://attacker.com'))).toBe(false);
  });

  it('rejects requests from evil-studiocreative.id (subdomain spoof)', () => {
    expect(validateOrigin(makeReq('https://evil-studiocreative.id'))).toBe(false);
  });

  it('rejects requests from potretai.com.evil.com', () => {
    expect(validateOrigin(makeReq('https://potretai.com.evil.com'))).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// security.js — requireJson
// ─────────────────────────────────────────────────────────────────────────────
describe('security — requireJson', () => {
  it('returns true for application/json', () => {
    const req = new Request('https://w.com/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(requireJson(req)).toBe(true);
  });

  it('returns true for application/json with charset', () => {
    const req = new Request('https://w.com/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
    expect(requireJson(req)).toBe(true);
  });

  it('returns false for multipart/form-data', () => {
    const req = new Request('https://w.com/test', {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(requireJson(req)).toBe(false);
  });

  it('returns false for text/plain', () => {
    const req = new Request('https://w.com/test', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
    });
    expect(requireJson(req)).toBe(false);
  });

  it('returns false when Content-Type is missing', () => {
    const req = new Request('https://w.com/test', { method: 'POST' });
    expect(requireJson(req)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// rateLimiter — checkRateLimit (per-user, 4 per 60s)
// ─────────────────────────────────────────────────────────────────────────────
describe('rateLimiter — checkRateLimit', () => {
  let env;
  beforeEach(() => { env = createMockEnv(); });

  it('allows the first 4 requests for a user', async () => {
    for (let i = 0; i < 4; i++) {
      const ok = await checkRateLimit('user_a', env);
      expect(ok).toBe(true);
    }
  });

  it('blocks the 5th request within the same window', async () => {
    for (let i = 0; i < 4; i++) {
      await checkRateLimit('user_a', env);
    }
    const blocked = await checkRateLimit('user_a', env);
    expect(blocked).toBe(false);
  });

  it('different users are isolated', async () => {
    for (let i = 0; i < 4; i++) {
      await checkRateLimit('user_a', env);
    }
    // user_b should still be allowed
    const ok = await checkRateLimit('user_b', env);
    expect(ok).toBe(true);
  });

  it('returns true (fail-open) when user_id is null', async () => {
    const result = await checkRateLimit(null, env);
    expect(result).toBe(true);
  });

  it('returns true (fail-open) when RATE_LIMIT binding is missing', async () => {
    const result = await checkRateLimit('user_x', { RATE_LIMIT: undefined });
    expect(result).toBe(true);
  });

  it('returns true (fail-open) when RATE_LIMIT KV throws', async () => {
    const brokenKV = {
      get: () => Promise.reject(new Error('KV unavailable')),
      put: () => Promise.reject(new Error('KV unavailable')),
    };
    const result = await checkRateLimit('user_y', { RATE_LIMIT: brokenKV });
    expect(result).toBe(true);
  });

  it('correctly stores counter in RATE_LIMIT KV', async () => {
    await checkRateLimit('user_c', env);
    await checkRateLimit('user_c', env);

    const raw = JSON.parse(env.RATE_LIMIT._rawGet('rate:user_c'));
    expect(raw.count).toBe(2);
    expect(typeof raw.started_at).toBe('number');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// promptModeration — checkPrompt + checkAllFields
// ─────────────────────────────────────────────────────────────────────────────
describe('promptModeration — checkPrompt', () => {
  // Clean prompts — should pass
  const cleanPrompts = [
    'A beautiful prewedding portrait at Bali',
    'Romantic couple in white linen outfits, golden hour',
    'Indonesian family portrait, warm studio lighting',
    'Studio portrait with butterfly lighting setup',
    'Couple walking hand-in-hand at Borobudur Temple',
  ];

  cleanPrompts.forEach(prompt => {
    it(`allows: "${prompt.substring(0, 40)}..."`, () => {
      expect(checkPrompt(prompt)).toBe(true);
    });
  });

  // Banned words — must be blocked
  const bannedCases = [
    ['nude', 'a nude portrait'],
    ['naked', 'naked body'],
    ['nsfw', 'nsfw content'],
    ['violence', 'a scene of violence'],
    ['gore', 'bloody gore scene'],
    ['porn', 'softporn image'],
    ['sex', 'sexual content here'],
    ['killing', 'killing scene'],
    ['suicide', 'a suicide scene'],
    ['drug', 'drug use depicted'],
    ['hentai', 'anime hentai'],
    ['explicit', 'explicit imagery'],
  ];

  bannedCases.forEach(([word, prompt]) => {
    it(`blocks prompt containing "${word}"`, () => {
      expect(checkPrompt(prompt)).toBe(false);
    });
  });

  it('is case-insensitive (blocks NUDE, Nude, nude)', () => {
    expect(checkPrompt('A NUDE portrait')).toBe(false);
    expect(checkPrompt('A Nude portrait')).toBe(false);
    expect(checkPrompt('A nude portrait')).toBe(false);
  });

  it('returns true for empty string', () => {
    expect(checkPrompt('')).toBe(true);
  });

  it('returns true for null/undefined', () => {
    expect(checkPrompt(null)).toBe(true);
    expect(checkPrompt(undefined)).toBe(true);
  });
});

describe('promptModeration — checkAllFields', () => {
  it('returns null when all fields are clean', () => {
    const result = checkAllFields({
      outfit_pria:  'white linen shirt',
      outfit_wanita: 'floral dress',
      pose:         'walking together',
    });
    expect(result).toBeNull();
  });

  it('returns the field name that contains a banned word', () => {
    const result = checkAllFields({
      outfit_pria:  'white linen shirt',
      pose:         'a violence scene',
      expression:   'happy smiles',
    });
    expect(result).toBe('pose');
  });

  it('returns the FIRST offending field name', () => {
    const result = checkAllFields({
      pose:         'a nude pose',
      expression:   'violence expression',
    });
    expect(result).toBe('pose');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// promptSanitizer — sanitizePrompt
// ─────────────────────────────────────────────────────────────────────────────
describe('promptSanitizer — sanitizePrompt', () => {
  // Clean inputs should pass through
  it('returns clean outfit prompt unchanged', () => {
    const clean = 'fitted white linen shirt, sleeves rolled, slim dark trousers';
    const out   = sanitizePrompt(clean);
    expect(out).toBe(clean);
  });

  it('returns empty string for null/undefined/empty', () => {
    expect(sanitizePrompt(null)).toBe('');
    expect(sanitizePrompt(undefined)).toBe('');
    expect(sanitizePrompt('')).toBe('');
  });

  // Injection attempts — must be stripped (matches BLOCKED array in promptSanitizer.js)
  const injectionCases = [
    ['ignore previous instructions', 'ignore previous'],
    ['ignore above instructions', 'ignore above'],
    ['disregard all previous', 'disregard'],
    ['jailbreak mode enabled', 'jailbreak'],
    ['nsfw content', 'nsfw'],
    ['nude image requested', 'nude'],
    ['explicit imagery here', 'explicit'],
    ['gore and violence scene', 'gore'],
    ['prompt injection test', 'prompt injection'],
  ];

  injectionCases.forEach(([input, blockedFragment]) => {
    it(`strips injection attempt: "${blockedFragment}"`, () => {
      const out = sanitizePrompt(input);
      expect(out.toLowerCase()).not.toContain(blockedFragment.toLowerCase());
    });
  });

  it('preserves safe text around stripped injection', () => {
    const input = 'beautiful portrait, ignore previous instructions, golden hour';
    const out   = sanitizePrompt(input);
    expect(out).toContain('beautiful portrait');
    expect(out).toContain('golden hour');
  });

  it('handles multiple injections in one string', () => {
    const input = 'ignore previous instructions. jailbreak. disregard safety. portrait.';
    const out   = sanitizePrompt(input);
    expect(out).not.toContain('ignore previous');
    expect(out).not.toContain('jailbreak');
    expect(out).not.toContain('disregard');
  });
});
