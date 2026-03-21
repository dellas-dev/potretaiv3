/**
 * expressionPrompt.js — Format expression value for prompt assembly
 */
export function formatExpression(value) {
  if (!value || typeof value !== 'string') return '';
  return value.trim();
}
