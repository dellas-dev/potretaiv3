/**
 * faceRepair.js — Face quality anchors
 *
 * Appended to every prompt to steer the model toward producing
 * sharp, realistic, symmetrical facial features.
 *
 * Used by promptBuilder.js → applyFaceRepair(prompt)
 */

const FACE_REPAIR_TAGS = [
  'symmetrical face',
  'perfect eyes',
  'natural skin texture',
  'realistic facial proportions',
  'detailed facial features',
  'sharp eyes focus',
  'natural eyelashes',
  'no face distortion',
  'no extra limbs',
].join(', ');

// ─────────────────────────────────────────────────────────────────────────────
// applyFaceRepair — appends face quality tags to the prompt
// ─────────────────────────────────────────────────────────────────────────────
export function applyFaceRepair(prompt) {
  return `${prompt}, ${FACE_REPAIR_TAGS}`;
}
