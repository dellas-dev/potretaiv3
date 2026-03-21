/**
 * weatherPrompt.js — Format atmosphere/weather value for prompt assembly
 */
export function formatWeather(value) {
  if (!value || typeof value !== 'string') return '';
  return value.trim();
}
