/**
 * posePrompt.js — Format pose value for prompt assembly
 */
export function formatPose(value) {
  if (!value || typeof value !== 'string') return '';
  return value.trim();
}
