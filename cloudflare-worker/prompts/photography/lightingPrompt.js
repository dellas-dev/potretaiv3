/**
 * lightingPrompt.js — Format lighting value for prompt assembly
 * Value from dropdown is already a full prompt string.
 */
export function formatLighting(value) {
  if (!value || typeof value !== 'string') return '';
  return value.trim();
}
