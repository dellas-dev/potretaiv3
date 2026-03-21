/**
 * history/historyManager.js
 *
 * Saves and retrieves generation history per user in HISTORY_KV.
 *
 * Key format:
 *   history:{user_id}:{ms_timestamp}
 *
 * Value schema:
 *   {
 *     user_id:    string,
 *     image_url:  string,
 *     share_url:  string,
 *     prompt:     string,
 *     created_at: number,   ← Unix seconds
 *   }
 *
 * TTL: 30 days — KV auto-expires, no manual delete needed for normal flow.
 *                historyCleanup.js handles explicit early cleanup if required.
 *
 * Fail-open: all errors are caught and logged; never blocks the generation pipeline.
 */

const HISTORY_TTL    = 60 * 60 * 24 * 30;  // 30 days in seconds
const MAX_PROMPT_LEN = 500;                 // truncate long prompts to save KV space

// ─────────────────────────────────────────────────────────────────────────────
/**
 * saveGenerationHistory
 *
 * Stores one generation entry for the user. Called by the queue processor
 * after successful image generation (step 9 of the pipeline).
 *
 * @param {string} user_id   — authenticated user ID
 * @param {string} image_url — primary CDN image URL (first of the 4 generated)
 * @param {string} share_url — public share link
 * @param {string} prompt    — base generation prompt (truncated to 500 chars)
 * @param {object} env       — Cloudflare Worker env bindings
 */
export async function saveGenerationHistory(user_id, image_url, share_url, prompt, env) {
  if (!env?.HISTORY_KV || !user_id) return;

  try {
    const now        = Date.now();
    const created_at = Math.floor(now / 1000);

    // Use ms timestamp in key for unique, lexicographically sortable entries
    const key = `history:${user_id}:${now}`;

    const entry = {
      user_id,
      image_url:  image_url  || '',
      share_url:  share_url  || '',
      prompt:     typeof prompt === 'string' ? prompt.slice(0, MAX_PROMPT_LEN) : '',
      created_at,
    };

    await env.HISTORY_KV.put(key, JSON.stringify(entry), {
      expirationTtl: HISTORY_TTL,
    });

    console.log(`[history] Saved entry for user ${user_id} — key: ${key}`);
  } catch (err) {
    // Non-fatal — never crash generation pipeline for history failure
    console.warn('[history] saveGenerationHistory error:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
/**
 * getUserHistory
 *
 * Retrieves up to `limit` history entries for a user, newest first.
 *
 * KV list returns only key names, not values — each key is fetched in parallel.
 *
 * @param {string} user_id
 * @param {object} env
 * @param {number} limit   — max entries to return (default 20)
 * @returns {Promise<Array>}
 */
export async function getUserHistory(user_id, env, limit = 20) {
  if (!env?.HISTORY_KV || !user_id) return [];

  try {
    // List all keys for this user (prefix scan)
    const listed = await env.HISTORY_KV.list({ prefix: `history:${user_id}:` });
    if (!listed?.keys?.length) return [];

    // Keys contain ms timestamp → sort descending (newest first) by key name
    const sorted = listed.keys
      .sort((a, b) => b.name.localeCompare(a.name))
      .slice(0, limit);

    // Fetch all values in parallel
    const entries = await Promise.all(
      sorted.map(async ({ name }) => {
        try {
          const raw = await env.HISTORY_KV.get(name);
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      })
    );

    // Filter out nulls (expired/missing entries)
    return entries.filter(Boolean);
  } catch (err) {
    console.warn('[history] getUserHistory error:', err.message);
    return [];
  }
}
