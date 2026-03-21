/**
 * consistencyEngine.js — Visual consistency layer for multi-image jobs
 *
 * Problem:
 *   Generating 4 separate images from the same base prompt produces
 *   inconsistent results — different face features, outfit details,
 *   or lighting style across the batch.
 *
 * Solution:
 *   1. Lock subject anchor  — extract physical + outfit identity and
 *                             repeat it explicitly in every prompt
 *   2. Lock style anchor    — lock color grade, lighting, camera
 *   3. Inject shot variation — give each image a distinct composition
 *                             so the 4 results feel like a professional
 *                             photoshoot set, not identical clones
 *
 * Public API:
 *   buildConsistentPrompts(basePrompt, config)
 *     → string[4]  — one prompt per image in the 2×2 grid
 *
 * Usage in generateQueue.js:
 *   import { buildConsistentPrompts } from '../../prompts/consistencyEngine.js';
 *   const prompts = buildConsistentPrompts(result.prompt, input);
 *   // then generateImageWithFace(prompts[i], faceUrl, options) per image
 */

// ── Shot variation descriptors — injected per-image ──────────────────────────
// Each entry alters framing/angle while keeping subject identity locked.

const SHOT_VARIANTS = {

  prewedding: [
    'cinematic wide establishing shot, full environment visible, couple small in dramatic landscape',
    'medium couple portrait, upper body, environment beautifully framed in background',
    'close-up intimate portrait, faces and emotion, shallow bokeh background',
    'full body head-to-toe portrait, complete outfits visible, golden hour rim light',
  ],

  wedding: [
    'grand cinematic wide shot, full venue visible, couple as focal point',
    'medium formal portrait, groom and bride upper body, dignified and elegant',
    'close-up romantic portrait, faces almost touching, soft bokeh',
    'full body formal portrait, complete bridal attire visible, regal composition',
  ],

  engagement: [
    'lifestyle wide shot, natural environment context, candid organic moment',
    'medium portrait, warm natural light, genuine connection visible',
    'close-up ring detail with faces softly bokeh in background',
    'intimate portrait, faces close, natural candid expression',
  ],

  studio: [
    'full body head-to-toe studio portrait, complete outfit on display',
    'three-quarter portrait, knee to top, classic elegant studio framing',
    'medium bust portrait, waist up, detailed face and expression',
    'dramatic close-up portrait, neck up, maximum face and emotion detail',
  ],

  family: [
    'full family wide portrait, all members visible, warm and connected',
    'medium family portrait, upper body, natural warm expressions',
    'candid family moment, natural interaction, genuine emotion',
    'close portrait of parents, children in foreground, layered depth',
  ],
};

// ── Consistency anchor modifiers — appended to every prompt in the batch ─────
// These reinforce visual identity across all 4 generations.

const CONSISTENCY_ANCHORS = [
  'same person same face same outfit throughout',
  'consistent identity consistent appearance',
  'photorealistic consistent skin tone',
  'same lighting setup same color palette',
];

const CONSISTENCY_SUFFIX = CONSISTENCY_ANCHORS.join(', ');

// ─────────────────────────────────────────────────────────────────────────────
// buildConsistentPrompts
//
// Takes the base prompt built by promptBuilder.js and returns 4 variants,
// each with a different shot composition but locked subject + style identity.
//
// @param {string} basePrompt   — output of buildPrompt(config)
// @param {object} config       — same config passed to buildPrompt
// @returns {string[]}          — array of exactly 4 prompt strings
// ─────────────────────────────────────────────────────────────────────────────

export function buildConsistentPrompts(basePrompt, config) {
  const category = config?.category || 'prewedding';
  const variants = SHOT_VARIANTS[category] || SHOT_VARIANTS.prewedding;

  return variants.map((shotVariant) =>
    [basePrompt, shotVariant, CONSISTENCY_SUFFIX]
      .filter(Boolean)
      .join(', ')
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// buildSingleConsistentPrompt
//
// Returns one prompt for a specific slot (0–3) in the 2×2 grid.
// Useful when regenerating a single image without redoing the full batch.
//
// @param {string} basePrompt
// @param {object} config
// @param {number} index       — 0 | 1 | 2 | 3
// @returns {string}
// ─────────────────────────────────────────────────────────────────────────────

export function buildSingleConsistentPrompt(basePrompt, config, index) {
  const category = config?.category || 'prewedding';
  const variants = SHOT_VARIANTS[category] || SHOT_VARIANTS.prewedding;
  const shotVariant = variants[index] || variants[0];

  return [basePrompt, shotVariant, CONSISTENCY_SUFFIX]
    .filter(Boolean)
    .join(', ');
}

// ─────────────────────────────────────────────────────────────────────────────
// applyConsistency
//
// Appends base photographic quality modifiers to any prompt.
// Use as a final pass before sending to fal.ai — works standalone
// or in combination with buildConsistentPrompts.
//
// @param {string} prompt
// @returns {string}
// ─────────────────────────────────────────────────────────────────────────────

const BASE_STYLE = [
  'ultra realistic photography',
  'professional portrait',
  'skin texture detailed',
  'natural lighting',
  'cinematic color grading',
  'shot on full frame camera',
  'high detail',
  'sharp focus',
].join(', ');

export function applyConsistency(prompt) {
  return `${prompt}, ${BASE_STYLE}`;
}
