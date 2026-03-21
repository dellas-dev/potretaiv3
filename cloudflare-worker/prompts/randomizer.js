/**
 * randomizer.js — Adds subtle randomized light and camera variation
 *
 * Each generation call gets a slightly different natural-light phrase and
 * a randomly picked premium camera, preventing 4 identical outputs.
 *
 * Used by promptBuilder.js → applyRandomizer(prompt)
 */

const LIGHT_VARIANTS = [
  'soft diffused natural light',
  'warm golden hour side light',
  'gentle window light with subtle fill',
  'soft overcast diffused light, even shadows',
  'romantic twilight ambient light',
  'cinematic dramatic side light with fill',
];

const CAMERA_VARIANTS = [
  'shot on Sony A7R V 61MP',
  'shot on Canon EOS R5 45MP',
  'shot on Fujifilm GFX 100S medium format',
  'shot on Nikon Z9 45MP full frame',
  'shot on Hasselblad X2D 100MP medium format',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─────────────────────────────────────────────────────────────────────────────
// applyRandomizer — appends a random light + camera tag to the prompt
// ─────────────────────────────────────────────────────────────────────────────
export function applyRandomizer(prompt) {
  return `${prompt}, ${pick(LIGHT_VARIANTS)}, ${pick(CAMERA_VARIANTS)}`;
}
