/**
 * colorGradePrompt.js — Format color grade value for prompt assembly
 * e.g. "warm cinematic film tones, golden, romantic, Kodak Portra 400"
 */
export function formatColorGrade(value) {
  if (!value || typeof value !== 'string') return '';
  return value.trim();
}
