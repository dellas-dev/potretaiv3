/**
 * falClient.js — fal.ai API client for Cloudflare Workers
 *
 * ── Model policy ─────────────────────────────────────────────────────────────
 * ONLY fal-ai/flux-pulid is used. No other fal.ai models exist in this file.
 *
 * Model:  fal-ai/flux-pulid
 * Docs:   https://fal.ai/models/fal-ai/flux-pulid
 * Input:  prompt (text) + image_url (face reference photo — REQUIRED)
 * Output: { images: [{ url }] }
 *
 * Environment variable required (Cloudflare Worker global binding):
 *   FAL_KEY — fal.ai API key (wrangler secret put FAL_KEY)
 *
 * Cloudflare Worker compatible — pure fetch API, no Node.js APIs.
 */

const FAL_PULID = 'https://fal.run/fal-ai/flux-pulid';

// ── Image size presets ────────────────────────────────────────────────────────
// Matches PotretAI aspect ratio table in CLAUDE.md
export const IMAGE_SIZES = {
  portrait_2x3:  { width: 1024, height: 1536 },  // 2:3  — couple / solo portrait
  portrait_4x5:  { width: 1024, height: 1280 },  // 4:5  — Instagram standard
  portrait_9x16: { width: 1024, height: 1820 },  // 9:16 — story / vertical
  landscape:     { width: 1536, height: 1024 },  // 16:9 — wide / cinematic
  square:        { width: 1024, height: 1024 },  // 1:1  — square
};

// ── Internal: resolve API key from CF global binding or explicit override ─────
function resolveApiKey(override) {
  if (override) return override;
  if (typeof FAL_KEY !== 'undefined') return FAL_KEY;  // Cloudflare global binding
  return null;
}

// ── Internal: extract HTTP error detail from fal.ai response ─────────────────
async function parseApiError(response) {
  let detail = response.statusText;
  try {
    const body = await response.json();
    detail = body.detail || body.message || body.error || JSON.stringify(body);
  } catch (_) { /* ignore */ }
  return `fal.ai API error ${response.status}: ${detail}`;
}

// ── Internal: extract image URLs from fal.ai response body ───────────────────
function extractUrls(data) {
  const images = data?.images;
  if (!Array.isArray(images) || images.length === 0) return [];
  return images.map((img) => img.url).filter(Boolean);
}

// ─────────────────────────────────────────────────────────────────────────────
// generateImageWithFace — single image, face reference required
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate one image using fal-ai/flux-pulid with a face reference photo.
 *
 * @param {string} prompt      — Full AI prompt string from promptBuilder
 * @param {string} imageUrl    — Public HTTPS URL of the uploaded face photo (from R2)
 * @param {Object} [options]
 * @param {Object} [options.image_size]          — { width, height } default: portrait_2x3
 * @param {number} [options.num_images]          — images per call, default 1
 * @param {number} [options.num_inference_steps] — diffusion steps, default 30
 * @param {number} [options.guidance_scale]      — CFG scale, default 4.5
 * @param {number} [options.id_weight]           — face identity strength 0–3, default 1
 * @param {string} [options.fal_key]             — API key override
 *
 * @returns {Promise<{ success: boolean, image_url?: string, images?: string[], error?: string }>}
 */
export async function generateImageWithFace(prompt, imageUrl, options = {}) {
  // ── Resolve API key ──────────────────────────────────────────────────────
  const apiKey = resolveApiKey(options.fal_key);
  if (!apiKey) {
    return { success: false, error: 'FAL_KEY environment variable is not set.' };
  }

  // ── Validate inputs ──────────────────────────────────────────────────────
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return { success: false, error: 'Prompt is empty or invalid.' };
  }
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('https://')) {
    return { success: false, error: 'face_image_url is required and must be an HTTPS URL.' };
  }

  // ── Build request body ───────────────────────────────────────────────────
  const body = {
    prompt:               prompt.trim(),
    image_url:            imageUrl.trim(),
    image_size:           options.image_size           ?? IMAGE_SIZES.portrait_2x3,
    num_images:           options.num_images           ?? 1,
    num_inference_steps:  options.num_inference_steps  ?? 30,
    guidance_scale:       options.guidance_scale       ?? 4.5,
    id_weight:            options.id_weight            ?? 1,
  };

  // ── POST to fal-ai/flux-pulid ────────────────────────────────────────────
  let response;
  try {
    response = await fetch(FAL_PULID, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type':  'application/json',
        'Accept':        'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (networkError) {
    return { success: false, error: `Network error: ${networkError.message}` };
  }

  if (!response.ok) {
    return { success: false, error: await parseApiError(response) };
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    return { success: false, error: `Failed to parse fal.ai response: ${parseError.message}` };
  }

  const urls = extractUrls(data);
  if (urls.length === 0) {
    return { success: false, error: 'fal.ai returned no images in response.' };
  }

  return {
    success:   true,
    image_url: urls[0],
    images:    urls,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// generateFourImagesWithFace — 4 parallel calls → fills 2×2 frontend grid
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate 4 images in parallel using fal-ai/flux-pulid with a face reference.
 * Each call is independent — matches PotretAI 2×2 grid design.
 *
 * @param {string}   prompt
 * @param {string}   imageUrl       — Face reference URL (REQUIRED)
 * @param {Object}   [options]      — Same as generateImageWithFace options
 * @param {Object[]} [sizeVariants] — Array of 4 { width, height } objects;
 *                                    defaults to alternating 2×3 / 4×5 portrait
 *
 * @returns {Promise<{ success: boolean, results: Array, image_urls: string[] }>}
 */
export async function generateFourImagesWithFace(prompt, imageUrl, options = {}, sizeVariants) {
  const sizes = sizeVariants ?? [
    IMAGE_SIZES.portrait_2x3,
    IMAGE_SIZES.portrait_4x5,
    IMAGE_SIZES.portrait_2x3,
    IMAGE_SIZES.portrait_4x5,
  ];

  const tasks = sizes.map((size) =>
    generateImageWithFace(prompt, imageUrl, { ...options, image_size: size, num_images: 1 })
  );

  const results    = await Promise.all(tasks);
  const allSuccess = results.every((r) => r.success);

  return {
    success:    allSuccess,
    results,
    image_urls: results.filter((r) => r.success).map((r) => r.image_url),
  };
}
