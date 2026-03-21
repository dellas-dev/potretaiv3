/**
 * generateSolo.js — Solo / studio image generator
 *
 * Wraps the full generation pipeline for studio category (solo or couple).
 * The queue consumer (generateQueue.js) uses buildPrompt + generateImageWithFace
 * directly for batch jobs; this module is available for direct use if needed.
 *
 * @param {Object} input   — buildGeneratorInput() payload from worker.js
 * @returns {Promise<{ success, images, prompt, generation_time }>}
 */

import { buildPrompt }            from '../prompts/promptBuilder.js';
import { buildConsistentPrompts } from '../prompts/consistencyEngine.js';
import { generateImageWithFace, IMAGE_SIZES } from './falClient.js';
import { applyWatermark }         from './watermark.js';

const SLOT_SIZES = [
  IMAGE_SIZES.portrait_4x5,
  IMAGE_SIZES.portrait_2x3,
  IMAGE_SIZES.portrait_4x5,
  IMAGE_SIZES.portrait_2x3,
];

export async function generateSoloImage(input) {
  const startTime = Date.now();
  const mode      = input.studio_mode || 'solo_wanita';

  const basePrompt = buildPrompt(input);
  const prompted   = applyWatermark(basePrompt, input);
  const prompts    = buildConsistentPrompts(prompted, { category: 'studio' });

  let faceUrl;
  if (mode === 'solo_wanita') {
    faceUrl = input.face_image_url_wanita || input.face_image_url || null;
  } else if (mode === 'solo_pria') {
    faceUrl = input.face_image_url_pria   || input.face_image_url || null;
  } else {
    faceUrl = input.face_image_url_pria   || input.face_image_url_wanita || input.face_image_url || null;
  }

  if (!faceUrl) {
    return { success: false, error: 'face_image_url wajib diisi untuk generate studio.' };
  }

  const results = await Promise.all(
    prompts.map((prompt, i) =>
      generateImageWithFace(prompt, faceUrl, {
        image_size: SLOT_SIZES[i],
        id_weight:  input.id_weight ?? 1,
        fal_key:    input.fal_key,
      })
    )
  );

  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    return { success: false, error: failed[0].error };
  }

  return {
    success:         true,
    images:          results.map((r) => r.image_url),
    prompt:          prompted,
    generation_time: `${Date.now() - startTime}ms`,
  };
}
