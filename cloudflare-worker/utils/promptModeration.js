/**
 * promptModeration.js — User input content moderation
 *
 * Checks user-supplied free-text fields for banned words before
 * they are assembled into an AI prompt.
 *
 * Called in worker.js on all custom/free-text body fields,
 * before the job is pushed to GEN_QUEUE.
 */

const BANNED_WORDS = [
  'nude',
  'naked',
  'nsfw',
  'violence',
  'blood',
  'gore',
  'porn',
  'pornography',
  'hentai',
  'explicit',
  'sex',
  'sexual',
  'killing',
  'murder',
  'suicide',
  'drug',
];

// ─────────────────────────────────────────────────────────────────────────────
// checkPrompt
// Returns true if the text is clean, false if a banned word is found.
// ─────────────────────────────────────────────────────────────────────────────

export function checkPrompt(prompt) {
  if (!prompt || typeof prompt !== 'string') return true;

  const text = prompt.toLowerCase();

  for (const word of BANNED_WORDS) {
    if (text.includes(word)) {
      console.warn(`[moderation] Banned word detected: "${word}"`);
      return false;
    }
  }

  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// checkAllFields
// Convenience helper — checks multiple fields at once.
// Returns the first offending field name, or null if all clean.
//
// @param {Object} fields  — { fieldName: value, ... }
// @returns {string|null}
// ─────────────────────────────────────────────────────────────────────────────

export function checkAllFields(fields) {
  for (const [name, value] of Object.entries(fields)) {
    if (!checkPrompt(value)) return name;
  }
  return null;
}
