/**
 * watermark.js — Prompt-level watermark injection for trial users
 *
 * When input.watermark === true (set by creditManager for Trial plan),
 * appends a watermark instruction to the AI prompt so fal.ai renders
 * a visible "PotretAI Trial" overlay in the output image.
 *
 * Used by queue/generateQueue.js → applyWatermark(basePrompt, input)
 */

const WATERMARK_TEXT =
  "subtle semi-transparent watermark text 'PotretAI Trial' " +
  'at bottom-right corner, small elegant grey text overlay';

// ─────────────────────────────────────────────────────────────────────────────
// applyWatermark
// Returns prompt unchanged if watermark is not needed.
// ─────────────────────────────────────────────────────────────────────────────
export function applyWatermark(prompt, input) {
  if (input?.watermark !== true) return prompt;
  return `${prompt}, ${WATERMARK_TEXT}`;
}
