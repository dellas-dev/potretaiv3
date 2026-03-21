/**
 * promptSanitizer.js — Anti prompt injection filter
 *
 * Strips disallowed terms from user-supplied free-text fields
 * (custom outfit, custom location, custom pose, etc.) before
 * they are passed into the prompt builder.
 *
 * Called in worker.js on body fields that accept free text,
 * before buildGeneratorInput() assembles the final input object.
 */

const BLOCKED = [
  /nsfw/gi,
  /nude/gi,
  /naked/gi,
  /violence/gi,
  /gore/gi,
  /explicit/gi,
  /pornograph/gi,
  /hentai/gi,
  /ignore previous/gi,
  /ignore above/gi,
  /disregard/gi,
  /jailbreak/gi,
  /prompt injection/gi,
];

/**
 * Remove disallowed terms from a prompt string.
 *
 * @param {string} input
 * @returns {string}
 */
export function sanitizePrompt(input) {
  if (!input || typeof input !== 'string') return '';

  let result = input;
  for (const pattern of BLOCKED) {
    result = result.replace(pattern, '');
  }

  // Collapse multiple spaces/commas left behind after removals
  return result
    .replace(/,\s*,+/g, ',')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
