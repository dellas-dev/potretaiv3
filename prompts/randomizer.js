/**
 * randomizer.js — Injects randomized lighting & camera variants into prompt
 *
 * Adds subtle variation across generations so repeated identical inputs
 * still produce visually diverse results. Applied as the final step in
 * promptBuilder.js after consistency engine.
 *
 * Flow:
 *   buildBasePrompt() → applyConsistency() → applyRandomizer()
 */

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const LIGHT_VARIANTS = [
  'soft natural lighting',
  'cinematic soft lighting',
  'golden hour lighting',
  'diffused daylight',
  'warm ambient lighting',
  'soft overcast natural light',
];

const CAMERA_VARIANTS = [
  'shot on 85mm portrait lens',
  'shot on 50mm prime lens',
  'shot on professional full frame camera',
  'shot on medium format camera',
  'shot on 85mm f/1.4 prime lens',
];

// ─────────────────────────────────────────────────────────────────────────────
// applyRandomizer
// Appends a random lighting + camera tag to the prompt.
//
// @param {string} prompt
// @returns {string}
// ─────────────────────────────────────────────────────────────────────────────

export function applyRandomizer(prompt) {
  const light  = pick(LIGHT_VARIANTS);
  const camera = pick(CAMERA_VARIANTS);

  return `${prompt}, ${light}, ${camera}`;
}
