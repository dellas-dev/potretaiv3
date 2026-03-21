/**
 * generateFamily.js — AI image generator for family portraits
 *
 * Handles category: family
 * Uses studio themes ONLY (no outdoor location dropdowns per CLAUDE.md rule).
 *
 * Uses fal-ai/flux-pulid (face reference model).
 * face_image_url should be the primary family member (e.g. Ayah / father).
 * Requires face_image_url — returns error if absent.
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

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

function validateFamilyInput(input) {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'Input must be a non-null object.' };
  }
  if (input.category !== 'family') {
    return {
      valid: false,
      error: `generateFamilyImage only handles category "family". Received: "${input.category}".`,
    };
  }
  return { valid: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal — build promptBuilder config from caller input
// ─────────────────────────────────────────────────────────────────────────────

function buildFamilyConfig(input) {
  // Derive hasFace flags so promptBuilder suppresses generic ethnicity descriptions
  const hasFacePria   = !!(input.face_image_url_ayah || input.face_image_url);
  const hasFaceWanita = !!(input.face_image_url_ibu);

  return {
    category:       'family',
    etnis_family:   input.etnis_family   || 'Keluarga Indonesia',
    family_anggota: input.family_anggota || 'Ayah + Ibu + 2 Anak',
    family_outfit:  input.family_outfit  || '',
    family_tema:    input.family_tema    || '',
    family_suasana: input.family_suasana || '',
    color_grade:    input.color_grade    || '',
    camera:         input.camera         || '',
    hasFacePria,
    hasFaceWanita,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal — resolve primary face URL for PuLID
// Priority: face_image_url_ayah → face_image_url_ibu → face_image_url
// ─────────────────────────────────────────────────────────────────────────────

function resolveFaceUrl(input) {
  return (
    input.face_image_url_ayah ||
    input.face_image_url_ibu  ||
    input.face_image_url      ||
    null
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// generateFamilyImage — single image
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a single family portrait image.
 *
 * @param {Object} input
 * @param {string} input.category              - Must be 'family'
 *
 * Face reference (required for flux-pulid):
 * @param {string} [input.face_image_url]       - Generic primary face URL
 * @param {string} [input.face_image_url_ayah]  - Father's face URL (highest priority)
 * @param {string} [input.face_image_url_ibu]   - Mother's face URL
 *
 * Family composition:
 * @param {string} [input.etnis_family]         - e.g. "Keluarga Indonesia" | "Asia Tenggara"
 * @param {string} [input.family_anggota]       - e.g. "Ayah + Ibu + 2 Anak"
 *
 * Outfit & styling:
 * @param {string} [input.family_outfit]        - Option label from fm-outfit dropdown
 * @param {string} [input.family_tema]          - Studio theme label (family uses ONLY studio themes)
 * @param {string} [input.family_suasana]       - Mood/atmosphere label from fm-suasana
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
export async function generateFamilyImage(input) {
  // ── 1. Validate ──────────────────────────────────────────────────────────────
  const validation = validateFamilyInput(input);
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
    prompt = buildPrompt(buildFamilyConfig(input));
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
// generateFourFamilyImages — 4 images in parallel (2×2 grid)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate 4 family portrait images in parallel to fill the frontend 2×2 grid.
 *
 * @param {Object}   input          — Same as generateFamilyImage
 * @param {Object[]} [sizeVariants] — Array of 4 { width, height } size objects
 *
 * @returns {Promise<{ success: boolean, results: Array, image_urls: string[], prompt: string }>}
 */
export async function generateFourFamilyImages(input, sizeVariants) {
  // ── 1. Validate ──────────────────────────────────────────────────────────────
  const validation = validateFamilyInput(input);
  if (!validation.valid) {
    return { success: false, error: validation.error, results: [], image_urls: [] };
  }

  // ── 2. Build prompt ──────────────────────────────────────────────────────────
  let prompt;
  try {
    prompt = buildPrompt(buildFamilyConfig(input));
  } catch (err) {
    return { success: false, error: `Prompt build failed: ${err.message}`, results: [], image_urls: [] };
  }

  prompt = applyWatermark(prompt, input);

  // ── 3. Resolve face URL & size variants ──────────────────────────────────────
  const faceUrl = resolveFaceUrl(input);
  const defaultSizes = sizeVariants || [
    IMAGE_SIZES.portrait_4x5,
    IMAGE_SIZES.portrait_4x5,
    IMAGE_SIZES.landscape,
    IMAGE_SIZES.landscape,
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
