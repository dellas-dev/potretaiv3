/**
 * history/historyCleanup.js
 *
 * Explicitly deletes HISTORY_KV entries older than 30 days.
 *
 * When to use:
 *   - Entries already have a 30-day KV TTL set at write time, so KV
 *     auto-expires them without any explicit action.
 *   - This function is useful to force-delete entries that were saved
 *     before the TTL was applied (e.g. during early development), or
 *     when you want to reclaim KV quota sooner than the TTL expiry.
 *
 * Usage:
 *   Called from the hourly cron trigger in worker.js:
 *     ctx.waitUntil(cleanupOldHistory(env));
 *
 * Performance:
 *   KV list() returns up to 1000 keys per call. For large histories,
 *   the function paginates via the `cursor` returned by each list() call.
 *
 * Function:
 *   cleanupOldHistory(env) → Promise<{ deleted: number }>
 */

const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;   // 30 days

// ─────────────────────────────────────────────────────────────────────────────
/**
 * cleanupOldHistory
 *
 * Scans all `history:*` keys, reads each entry's `created_at` timestamp,
 * and deletes any entry older than 30 days.
 *
 * @param {object} env — Cloudflare Worker env bindings
 * @returns {Promise<{ deleted: number }>}
 */
export async function cleanupOldHistory(env) {
  if (!env?.HISTORY_KV) return { deleted: 0 };

  const cutoff = Math.floor(Date.now() / 1000) - MAX_AGE_SECONDS;
  let deleted  = 0;
  let cursor;

  console.log(`[history] cleanupOldHistory — cutoff timestamp: ${cutoff}`);

  try {
    do {
      const opts = { prefix: 'history:', limit: 1000 };
      if (cursor) opts.cursor = cursor;

      const listed = await env.HISTORY_KV.list(opts);
      cursor = listed.cursor;

      // Fetch and evaluate each entry in parallel batches
      await Promise.all(
        listed.keys.map(async ({ name }) => {
          try {
            const raw = await env.HISTORY_KV.get(name);
            if (!raw) return;   // already expired/gone

            const entry = JSON.parse(raw);
            if (entry?.created_at && entry.created_at < cutoff) {
              await env.HISTORY_KV.delete(name);
              deleted++;
              console.log(`[history] Deleted old entry: ${name}`);
            }
          } catch (err) {
            console.warn(`[history] cleanupOldHistory — error processing key ${name}:`, err.message);
          }
        })
      );
    } while (cursor);
  } catch (err) {
    console.error('[history] cleanupOldHistory fatal error:', err.message);
  }

  console.log(`[history] cleanupOldHistory done — deleted ${deleted} entries.`);
  return { deleted };
}
