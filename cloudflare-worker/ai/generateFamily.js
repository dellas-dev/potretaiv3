/**
 * generateFamily.js — Family group image generator
 *
 * Wraps the full generation pipeline for family category.
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
  IMAGE_SIZES.portrait_4x5,
  IMAGE_SIZES.landscape,
  IMAGE_SIZES.landscape,
];

export async function generateFamilyImage(input) {
  const startTime = Date.now();

  const basePrompt = buildPrompt(input);
  const prompted   = applyWatermark(basePrompt, input);
  const prompts    = buildConsistentPrompts(prompted, { category: 'family' });

  const faceUrl = input.face_image_url_ayah
               || input.face_image_url_ibu
               || input.face_image_url
               || null;

  if (!faceUrl) {
    return { success: false, error: 'face_image_url wajib diisi untuk generate family.' };
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
