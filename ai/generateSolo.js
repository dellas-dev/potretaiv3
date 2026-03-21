/**
 * generateSolo.js — AI image generator for solo / single-person studio portraits
 *
 * Handles category: studio (solo_wanita · solo_pria · pasangan modes)
 *
 * Uses fal-ai/flux-pulid (face reference model).
 * Requires face_image_url for the primary subject.
 * Falls back to text-only generation when no face photo is provided.
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

// ── Valid studio modes ────────────────────────────────────────────────────────
const STUDIO_MODES = new Set(['solo_wanita', 'solo_pria', 'pasangan']);

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

function validateSoloInput(input) {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'Input must be a non-null object.' };
  }
  if (input.category !== 'studio') {
    return {
      valid: false,
      error: `generateSoloImage only handles category "studio". Received: "${input.category}".`,
    };
  }
  const mode = input.studio_mode || 'solo_wanita';
  if (!STUDIO_MODES.has(mode)) {
    return {
      valid: false,
      error: `Invalid studio_mode "${mode}". Must be one of: ${[...STUDIO_MODES].join(', ')}.`,
    };
  }
  return { valid: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal — build promptBuilder config from caller input
// ─────────────────────────────────────────────────────────────────────────────

function buildSoloConfig(input) {
  const mode = input.studio_mode || 'solo_wanita';

  // Derive hasFace* flags from URL presence
  const hasFaceWanita = !!(input.face_image_url_wanita || (mode === 'solo_wanita' && input.face_image_url));
  const hasFacePria   = !!(input.face_image_url_pria   || (mode === 'solo_pria'   && input.face_image_url));

  return {
    category:      'studio',
    studio_mode:   mode,
    etnis_wanita:  input.etnis_wanita  || 'Indonesia',
    etnis_pria:    input.etnis_pria    || 'Indonesia',
    hasFaceWanita,
    hasFacePria,
    outfit_wanita: input.outfit_wanita || '',
    outfit_pria:   input.outfit_pria   || '',
    studio_tema:   input.studio_tema   || '',
    lighting:      input.lighting      || '',
    pose:          input.pose          || '',
    expression:    input.expression    || '',
    color_grade:   input.color_grade   || '',
    camera:        input.camera        || '',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal — resolve face URL for PuLID
// For solo modes, use the matching gender URL; for pasangan, prefer male.
// ─────────────────────────────────────────────────────────────────────────────

function resolveFaceUrl(input) {
  const mode = input.studio_mode || 'solo_wanita';

  if (mode === 'solo_wanita') {
    return input.face_image_url_wanita || input.face_image_url || null;
  }
  if (mode === 'solo_pria') {
    return input.face_image_url_pria || input.face_image_url || null;
  }
  // pasangan — prefer pria as anchor, then wanita
  return (
    input.face_image_url_pria   ||
    input.face_image_url_wanita ||
    input.face_image_url        ||
    null
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// generateSoloImage — single image
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a single solo (or studio couple) portrait image.
 *
 * @param {Object} input
 * @param {string} input.category              - Must be 'studio'
 *
 * Studio mode:
 * @param {string} [input.studio_mode]         - 'solo_wanita' | 'solo_pria' | 'pasangan'
 *                                               default: 'solo_wanita'
 *
 * Face reference (used by flux-pulid — falls back to text-only if absent):
 * @param {string} [input.face_image_url]       - Primary face URL (single subject)
 * @param {string} [input.face_image_url_wanita]- Female face URL (solo_wanita / pasangan)
 * @param {string} [input.face_image_url_pria]  - Male face URL (solo_pria / pasangan)
 *
 * Ethnicity (used only when no face reference provided):
 * @param {string} [input.etnis_wanita]         - e.g. "Indonesia" | "Asia Timur"
 * @param {string} [input.etnis_pria]
 *
 * Outfit:
 * @param {string} [input.outfit_wanita]
 * @param {string} [input.outfit_pria]
 *
 * Scene:
 * @param {string} [input.studio_tema]          - Studio background/tema dropdown label
 * @param {string} [input.lighting]             - Studio lighting dropdown label
 * @param {string} [input.pose]
 * @param {string} [input.expression]
 *
 * Photography:
 * @param {string} [input.color_grade]
 * @param {string} [input.camera]
 *
 * Generator options:
 * @param {Object} [input.image_size]           - { width, height } — default: portrait_4x5
 * @param {number} [input.id_weight]            - PuLID face identity weight 0–3 (default 1)
 * @param {string} [input.fal_key]              - API key override
 *
 * @returns {Promise<{ success: boolean, image_url?: string, images?: string[], prompt?: string, error?: string }>}
 */
export async function generateSoloImage(input) {
  // ── 1. Validate ──────────────────────────────────────────────────────────────
  const validation = validateSoloInput(input);
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
    prompt = buildPrompt(buildSoloConfig(input));
  } catch (err) {
    return { success: false, error: `Prompt build failed: ${err.message}` };
  }

  if (!prompt || prompt.trim().length === 0) {
    return { success: false, error: 'Built prompt is empty.' };
  }

  prompt = applyWatermark(prompt, input);

  // ── 3. Resolve face URL & image size ─────────────────────────────────────────
  const faceUrl   = resolveFaceUrl(input);
  const imageSize = input.image_size || IMAGE_SIZES.portrait_4x5;

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
// generateFourSoloImages — 4 images in parallel (2×2 grid)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate 4 solo/studio images in parallel to fill the frontend 2×2 grid.
 *
 * @param {Object}   input          — Same as generateSoloImage
 * @param {Object[]} [sizeVariants] — Array of 4 { width, height } size objects
 *
 * @returns {Promise<{ success: boolean, results: Array, image_urls: string[], prompt: string }>}
 */
export async function generateFourSoloImages(input, sizeVariants) {
  // ── 1. Validate ──────────────────────────────────────────────────────────────
  const validation = validateSoloInput(input);
  if (!validation.valid) {
    return { success: false, error: validation.error, results: [], image_urls: [] };
  }

  // ── 2. Build prompt ──────────────────────────────────────────────────────────
  let prompt;
  try {
    prompt = buildPrompt(buildSoloConfig(input));
  } catch (err) {
    return { success: false, error: `Prompt build failed: ${err.message}`, results: [], image_urls: [] };
  }

  prompt = applyWatermark(prompt, input);

  // ── 3. Resolve face URL & size variants ──────────────────────────────────────
  const faceUrl = resolveFaceUrl(input);
  const defaultSizes = sizeVariants || [
    IMAGE_SIZES.portrait_4x5,
    IMAGE_SIZES.portrait_2x3,
    IMAGE_SIZES.portrait_4x5,
    IMAGE_SIZES.portrait_2x3,
  ];

  // ── 4. Require face reference (flux-pulid only) ──────────────────────────────
  if (!faceUrl) {
    return { success: false, error: 'face_image_url is required. Upload foto wajah terlebih dahulu.', results: [], image_urls: [] };
  }

  // ── 5. Generate 4 images in parallel via fal-ai/flux-pulid ───────────────────
  const batch = await generateFourImagesWithFace(
    prompt,
    faceUrl,
    { id_weight: input.id_weight ?? 1, fal_key: input.fal_key },
    defaultSizes
  );

  return { ...batch, prompt };
}
