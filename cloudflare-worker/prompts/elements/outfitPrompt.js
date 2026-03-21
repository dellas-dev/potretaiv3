/**
 * outfitPrompt.js — Format outfit value for prompt assembly
 *
 * Dropdown option values are already full prompt strings.
 * If value === 'custom', falls back to customValue.
 */
export function formatOutfit(value, customValue) {
  if (value === 'custom' && customValue) return customValue.trim();
  if (!value || value === 'custom') return '';
  return value.trim();
}
