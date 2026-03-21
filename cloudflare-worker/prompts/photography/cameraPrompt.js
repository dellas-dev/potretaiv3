/**
 * cameraPrompt.js — Format camera value for prompt assembly
 * Value from dropdown is already a full prompt string (e.g. "Sony A7R V, 61MP full frame").
 */
export function formatCamera(value) {
  if (!value || typeof value !== 'string') return '';
  return `shot on ${value.trim()}`;
}
