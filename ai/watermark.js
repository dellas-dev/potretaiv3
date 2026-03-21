/**
 * watermark.js — Prompt-level watermark injection
 *
 * Appends a visible watermark instruction to the AI prompt when the
 * user's credit/plan requires it (e.g. Trial plan, quota exceeded).
 *
 * Usage:
 *   import { applyWatermark } from './watermark.js';
 *   prompt = applyWatermark(prompt, input);
 *
 * The `input.watermark` boolean is set by worker.js based on a
 * server-side credit lookup — never trusted from the client body.
 */

const WATERMARK_TEXT = "subtle semi-transparent watermark text 'PotretAI Trial' at bottom-right corner, small legible text";

/**
 * Append watermark instruction to prompt if input.watermark is true.
 *
 * @param {string}  prompt
 * @param {{ watermark?: boolean }} input
 * @returns {string}
 */
export function applyWatermark(prompt, input) {
  if (!input?.watermark) return prompt;
  return `${prompt}, ${WATERMARK_TEXT}`;
}
