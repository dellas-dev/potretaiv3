/**
 * faceRepair.js — Face quality enhancement tags
 *
 * Appends facial correction modifiers to prevent common AI face artifacts:
 * asymmetry, distorted eyes, skin texture issues, and proportion errors.
 *
 * Applied as the final step in promptBuilder.js.
 *
 * Flow:
 *   buildBasePrompt() → applyConsistency() → applyRandomizer() → applyFaceRepair()
 */

const FACE_REPAIR_TAGS = [
  'symmetrical face',
  'perfect eyes',
  'natural skin texture',
  'realistic facial proportions',
  'detailed facial features',
  'sharp eyes focus',
].join(', ');

// ─────────────────────────────────────────────────────────────────────────────
// applyFaceRepair
// Appends face correction tags to the final prompt.
//
// @param {string} prompt
// @returns {string}
// ─────────────────────────────────────────────────────────────────────────────

export function applyFaceRepair(prompt) {
  return `${prompt}, ${FACE_REPAIR_TAGS}`;
}
