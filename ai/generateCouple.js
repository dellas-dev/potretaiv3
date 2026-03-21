/**
 * generateCouple.js — AI image generator for couple photoshoots
 *
 * Handles categories: prewedding · wedding · engagement
 *
 * Uses fal-ai/flux-pulid (face reference model).
 * At least one face_image_url must be provided; if both are uploaded,
 * the male face URL is used as the PuLID reference (PuLID accepts one face
 * anchor per call — pass the most prominent subject's face).
 *
 * Connects:
 *   prompts/promptBuilder.js → buildPrompt()
 *   ai/falClient.js          → generateImageWithFace() / generateFourImagesWithFace()
 *
 * Cloudflare Worker compatible — no Node.js APIs.
 */

import { buildPrompt }                from '../prompts/promptBuilder.js';
import { applyWatermark }             from './watermark.js';
import { checkDailyLimit }            from '../cloudflare-worker/utils/costControl.js';
import { checkCache, saveCache }      from '../cloudflare-worker/utils/resultCache.js';
import {
  generateImageWithFace,
  generateFourImagesWithFace,
  IMAGE_SIZES,
} from './falClient.js';

// ── Valid categories ──────────────────────────────────────────────────────────
const COUPLE_CATEGORIES = new Set(['prewedding', 'wedding', 'engagement']);

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

function validateCoupleInput(input) {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'Input must be a non-null object.' };
  }
  if (!input.category) {
    return { valid: false, error: 'Field "category" is required.' };
  }
  if (!COUPLE_CATEGORIES.has(input.category)) {
    return {
      valid: false,
      error: `Invalid category "${input.category}". Must be one of: ${[...COUPLE_CATEGORIES].join(', ')}.`,
    };
  }
  return { valid: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal — build the promptBuilder config from caller input
// ─────────────────────────────────────────────────────────────────────────────

function buildCoupleConfig(input) {
  // Derive hasFace* flags from URL presence — if URL provided, suppress ethnicity desc
  const hasFacePria   = !!(input.face_image_url_pria   || input.face_image_url);
  const hasFaceWanita = !!(input.face_image_url_wanita || input.face_image_url);

  return {
    category:             input.category,
    etnis_pria:           input.etnis_pria           || 'Indonesia',
    etnis_wanita:         input.etnis_wanita         || 'Indonesia',
    hasFacePria,
    hasFaceWanita,
    outfit_pria:          input.outfit_pria           || '',
    outfit_wanita:        input.outfit_wanita         || '',
    outfit_pria_custom:   input.outfit_pria_custom    || '',
    outfit_wanita_custom: input.outfit_wanita_custom  || '',
    location:             input.location              || '',
    location_custom:      input.location_custom       || '',
    pose:                 input.pose                  || '',
    expression:           input.expression            || '',
    time:                 input.time                  || '',
    atmosphere:           input.atmosphere            || '',
    dekorasi:             input.dekorasi              || '',
    color_grade:          input.color_grade           || '',
    camera:               input.camera                || '',
    lens:                 input.lens                  || '',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal — resolve which face URL to send to PuLID
// Priority: face_image_url_pria → face_image_url_wanita → face_image_url
// ─────────────────────────────────────────────────────────────────────────────

function resolveFaceUrl(input) {
  return (
    input.face_image_url_pria   ||
    input.face_image_url_wanita ||
    input.face_image_url        ||
    null
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// generateCoupleImage — single image
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a single couple portrait image.
 *
 * @param {Object} input
 * @param {string} input.category               - 'prewedding' | 'wedding' | 'engagement'
 *
 * Face reference (at least one required for PuLID; falls back to text-only if absent):
 * @param {string} [input.face_image_url]        - Primary face URL (used when only one uploaded)
 * @param {string} [input.face_image_url_pria]   - Male face reference URL
 * @param {string} [input.face_image_url_wanita] - Female face reference URL
 *
 * Ethnicity (used when no face reference uploaded):
 * @param {string} [input.etnis_pria]            - e.g. "Indonesia" | "Asia Timur" | "Kaukasia"
 * @param {string} [input.etnis_wanita]
 *
 * Outfit:
 * @param {string} [input.outfit_pria]
 * @param {string} [input.outfit_wanita]
 * @param {string} [input.outfit_pria_custom]    - Free-text when "custom" is selected
 * @param {string} [input.outfit_wanita_custom]
 *
 * Scene:
 * @param {string} [input.location]
 * @param {string} [input.location_custom]
 * @param {string} [input.pose]
 * @param {string} [input.expression]
 * @param {string} [input.time]
 * @param {string} [input.atmosphere]
 * @param {string} [input.dekorasi]              - Wedding decoration (wedding only)
 *
 * Photography:
 * @param {string} [input.color_grade]
 * @param {string} [input.camera]
 * @param {string} [input.lens]
 *
 * Generator options:
 * @param {Object} [input.image_size]            - { width, height } — default: portrait_2x3
 * @param {number} [input.id_weight]             - PuLID face identity weight 0–3 (default 1)
 * @param {string} [input.fal_key]               - API key override
 *
 * @returns {Promise<{ success: boolean, image_url?: string, images?: string[], prompt?: string, error?: string }>}
 */
export async function generateCoupleImage(input) {
  // ── 1. Validate ──────────────────────────────────────────────────────────────
  const validation = validateCoupleInput(input);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // ── 1b. Daily cost guard ──────────────────────────────────────────────────────
  const allowed = await checkDailyLimit(input.env);
  if (!allowed) {
    return { success: false, error: 'Daily AI limit reached. Coba lagi besok.' };
  }

  // ── 2. Build prompt ──────────────────────────────────────────────────────────
  let prompt;
  try {
    prompt = buildPrompt(buildCoupleConfig(input));
  } catch (err) {
    return { success: false, error: `Prompt build failed: ${err.message}` };
  }

  if (!prompt || prompt.trim().length === 0) {
    return { success: false, error: 'Built prompt is empty.' };
  }

  prompt = applyWatermark(prompt, input);

  // ── 3. Resolve face URL & image size ─────────────────────────────────────────
  const faceUrl   = resolveFaceUrl(input);
  const imageSize = input.image_size || IMAGE_SIZES.portrait_2x3;

  // ── 4. Require face reference (flux-pulid only) ──────────────────────────────
  if (!faceUrl) {
    return { success: false, error: 'face_image_url is required. Upload foto wajah terlebih dahulu.' };
  }

  // ── 5. Cache check ───────────────────────────────────────────────────────────
  const cached = await checkCache(prompt, input.env);
  if (cached) return cached;

  // ── 6. Generate via fal-ai/flux-pulid ────────────────────────────────────────
  const result = await generateImageWithFace(prompt, faceUrl, {
    image_size: imageSize,
    id_weight:  input.id_weight ?? 1,
    fal_key:    input.fal_key,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const output = { success: true, image_url: result.image_url, images: result.images, prompt };
  await saveCache(prompt, output, input.env);
  return output;
}

// ─────────────────────────────────────────────────────────────────────────────
// generateFourCoupleImages — 4 images in parallel (2×2 grid)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate 4 couple images in parallel to fill the frontend 2×2 grid.
 *
 * @param {Object}   input          — Same as generateCoupleImage
 * @param {Object[]} [sizeVariants] — Array of 4 { width, height } size objects
 *
 * @returns {Promise<{ success: boolean, results: Array, image_urls: string[], prompt: string }>}
 */
export async function generateFourCoupleImages(input, sizeVariants) {
  // ── 1. Validate ──────────────────────────────────────────────────────────────
  const validation = validateCoupleInput(input);
  if (!validation.valid) {
    return { success: false, error: validation.error, results: [], image_urls: [] };
  }

  // ── 2. Build prompt ──────────────────────────────────────────────────────────
  let prompt;
  try {
    prompt = buildPrompt(buildCoupleConfig(input));
  } catch (err) {
    return { success: false, error: `Prompt build failed: ${err.message}`, results: [], image_urls: [] };
  }

  prompt = applyWatermark(prompt, input);

  // ── 3. Resolve face URL ───────────────────────────────────────────────────────
  const faceUrl = resolveFaceUrl(input);

  // ── 4. Require face reference (flux-pulid only) ──────────────────────────────
  if (!faceUrl) {
    return { success: false, error: 'face_image_url is required. Upload foto wajah terlebih dahulu.', results: [], image_urls: [] };
  }

  // ── 5. Generate 4 images in parallel via fal-ai/flux-pulid ───────────────────
  const batch = await generateFourImagesWithFace(
    prompt,
    faceUrl,
    { id_weight: input.id_weight ?? 1, fal_key: input.fal_key },
    sizeVariants
  );

  return { ...batch, prompt };
}
