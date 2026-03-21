/**
 * tests/ai/generation.test.js
 *
 * Tests the AI generation pipeline end-to-end:
 *   falClient.js    — fal-ai/flux-pulid API wrapper
 *   generateSolo    — solo/studio generator module
 *   watermark.js    — trial watermark injection
 *
 * fal.ai HTTP calls are intercepted with vi.stubGlobal('fetch').
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { generateImageWithFace, generateFourImagesWithFace, IMAGE_SIZES } from '@ai/falClient.js';
import { generateSoloImage }   from '@ai/generateSolo.js';
import { applyWatermark }      from '@ai/watermark.js';
import { studioInput, makeFalResponse, makeFalError } from '@helpers/mockEnv.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helper — stub globalThis.fetch to return a fake fal.ai response
// ─────────────────────────────────────────────────────────────────────────────
function stubFetch(responseOrFn) {
  const fn = typeof responseOrFn === 'function'
    ? (...args) => Promise.resolve(responseOrFn(...args))
    : () => Promise.resolve(responseOrFn);
  vi.stubGlobal('fetch', vi.fn(fn));
}

afterEach(() => { vi.unstubAllGlobals(); });

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE_SIZES constants
// ─────────────────────────────────────────────────────────────────────────────
describe('IMAGE_SIZES', () => {
  it('defines portrait_2x3 as 1024×1536', () => {
    expect(IMAGE_SIZES.portrait_2x3).toEqual({ width: 1024, height: 1536 });
  });
  it('defines portrait_4x5 as 1024×1280', () => {
    expect(IMAGE_SIZES.portrait_4x5).toEqual({ width: 1024, height: 1280 });
  });
  it('defines landscape as 1536×1024', () => {
    expect(IMAGE_SIZES.landscape).toEqual({ width: 1536, height: 1024 });
  });
  it('defines square as 1024×1024', () => {
    expect(IMAGE_SIZES.square).toEqual({ width: 1024, height: 1024 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// falClient — generateImageWithFace
// ─────────────────────────────────────────────────────────────────────────────
describe('falClient — generateImageWithFace', () => {
  it('returns success + image_url on valid fal.ai response', async () => {
    stubFetch(makeFalResponse);

    const result = await generateImageWithFace(
      'A beautiful portrait',
      'https://test.r2.dev/face.jpg',
      { fal_key: 'test_key' }
    );

    expect(result.success).toBe(true);
    expect(typeof result.image_url).toBe('string');
    expect(result.image_url).toContain('http');
  });

  it('POSTs to the correct fal-ai/flux-pulid endpoint', async () => {
    stubFetch(makeFalResponse);

    await generateImageWithFace('prompt', 'https://test.r2.dev/face.jpg', { fal_key: 'k' });

    const [calledUrl] = vi.mocked(fetch).mock.calls[0];
    expect(calledUrl).toContain('fal-ai/flux-pulid');
    expect(calledUrl).not.toContain('flux-schnell');
    expect(calledUrl).not.toContain('flux-pro');
    expect(calledUrl).not.toContain('flux-dev');
  });

  it('sends Authorization: Key header', async () => {
    stubFetch(makeFalResponse);

    await generateImageWithFace('prompt', 'https://test.r2.dev/face.jpg', { fal_key: 'my_secret' });

    const [, reqInit] = vi.mocked(fetch).mock.calls[0];
    expect(reqInit.headers['Authorization']).toBe('Key my_secret');
  });

  it('sends prompt and image_url in request body', async () => {
    stubFetch(makeFalResponse);
    const prompt    = 'romantic prewedding portrait';
    const faceUrl   = 'https://test.r2.dev/faces/pria.jpg';

    await generateImageWithFace(prompt, faceUrl, { fal_key: 'key' });

    const [, reqInit] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(reqInit.body);
    expect(body.prompt).toBe(prompt);
    expect(body.image_url).toBe(faceUrl);
  });

  it('fails if fal.ai returns HTTP 401', async () => {
    stubFetch(makeFalError(401, 'Unauthorized'));
    const result = await generateImageWithFace('p', 'https://test.r2.dev/f.jpg', { fal_key: 'bad' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('401');
  });

  it('fails if fal.ai returns HTTP 500', async () => {
    stubFetch(makeFalError(500, 'Internal Server Error'));
    const result = await generateImageWithFace('p', 'https://test.r2.dev/f.jpg', { fal_key: 'k' });
    expect(result.success).toBe(false);
  });

  it('fails if fal.ai response has no images array', async () => {
    stubFetch(new Response(JSON.stringify({ seed: 1 }), { status: 200, headers: { 'content-type': 'application/json' } }));
    const result = await generateImageWithFace('p', 'https://test.r2.dev/f.jpg', { fal_key: 'k' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('no images');
  });

  it('fails with no FAL_KEY', async () => {
    const result = await generateImageWithFace('p', 'https://test.r2.dev/f.jpg', { fal_key: undefined });
    expect(result.success).toBe(false);
    expect(result.error).toContain('FAL_KEY');
  });

  it('fails with empty prompt', async () => {
    const result = await generateImageWithFace('', 'https://test.r2.dev/f.jpg', { fal_key: 'k' });
    expect(result.success).toBe(false);
  });

  it('fails with non-HTTPS face URL', async () => {
    const result = await generateImageWithFace('p', 'http://insecure.com/face.jpg', { fal_key: 'k' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('HTTPS');
  });

  it('handles network error gracefully', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network timeout'))));
    const result = await generateImageWithFace('p', 'https://test.r2.dev/f.jpg', { fal_key: 'k' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Network');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// falClient — generateFourImagesWithFace
// ─────────────────────────────────────────────────────────────────────────────
describe('falClient — generateFourImagesWithFace', () => {
  it('makes exactly 4 fetch calls', async () => {
    stubFetch(makeFalResponse);

    await generateFourImagesWithFace(
      'portrait prompt',
      'https://test.r2.dev/face.jpg',
      { fal_key: 'key' }
    );

    expect(vi.mocked(fetch).mock.calls).toHaveLength(4);
  });

  it('returns 4 image URLs on success', async () => {
    stubFetch(makeFalResponse);
    const result = await generateFourImagesWithFace(
      'test prompt',
      'https://test.r2.dev/face.jpg',
      { fal_key: 'key' }
    );
    expect(result.success).toBe(true);
    expect(result.image_urls).toHaveLength(4);
  });

  it('returns success=false if any call fails', async () => {
    let callCount = 0;
    stubFetch(() => {
      callCount++;
      return callCount === 3 ? Promise.resolve(makeFalError(500)) : Promise.resolve(makeFalResponse());
    });
    const result = await generateFourImagesWithFace('p', 'https://test.r2.dev/f.jpg', { fal_key: 'k' });
    expect(result.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// watermark.js
// ─────────────────────────────────────────────────────────────────────────────
describe('applyWatermark', () => {
  it('appends watermark text when input.watermark === true', () => {
    const out = applyWatermark('base prompt', { watermark: true });
    expect(out).toContain('PotretAI Trial');
    expect(out).toContain('base prompt');
  });

  it('returns prompt unchanged when watermark === false', () => {
    const base = 'a clean prompt without watermark';
    const out  = applyWatermark(base, { watermark: false });
    expect(out).toBe(base);
  });

  it('returns prompt unchanged when watermark is undefined', () => {
    const base = 'another clean prompt';
    const out  = applyWatermark(base, {});
    expect(out).toBe(base);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// generateSoloImage
// ─────────────────────────────────────────────────────────────────────────────
describe('generateSoloImage', () => {
  beforeEach(() => { stubFetch(makeFalResponse); });

  it('returns success + 4 images for studio solo_wanita', async () => {
    const result = await generateSoloImage(studioInput());
    expect(result.success).toBe(true);
    expect(result.images).toHaveLength(4);
  });

  it('uses face_image_url_wanita for solo_wanita mode', async () => {
    await generateSoloImage(studioInput({ studio_mode: 'solo_wanita' }));
    const [, reqInit] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(reqInit.body);
    expect(body.image_url).toBe('https://test.r2.dev/faces/wanita.jpg');
  });

  it('fails when no face URL provided for solo_wanita', async () => {
    const result = await generateSoloImage(studioInput({
      studio_mode: 'solo_wanita',
      face_image_url_wanita: null,
      face_image_url: null,
    }));
    expect(result.success).toBe(false);
  });
});


