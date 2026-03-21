/**
 * propsPrompt.js — Format props value for prompt assembly
 */
export function formatProps(value) {
  if (!value || typeof value !== 'string') return '';
  return value.trim();
}
