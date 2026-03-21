/**
 * lensPrompt.js — Format lens value for prompt assembly
 */
export function formatLens(value) {
  if (!value || typeof value !== 'string') return '';
  return value.trim();
}
