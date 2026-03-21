/**
 * aperturePrompt.js — Format aperture value for prompt assembly
 */
export function formatAperture(value) {
  if (!value || typeof value !== 'string') return '';
  return value.trim();
}
