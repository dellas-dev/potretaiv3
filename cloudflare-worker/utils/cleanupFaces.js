/**
 * cleanupFaces.js — Automatic R2 face-image expiry via Cloudflare KV metadata
 *
 * ── Purpose ───────────────────────────────────────────────────────────────────
 * Face reference images uploaded to R2 are only needed for the duration of a
 * user session.  This utility scans KV for file-tracking records older than
 * FILE_TTL_MS and deletes both the R2 object and the KV record.
 *
 * ── File metadata key schema ──────────────────────────────────────────────────
 * Key:   face-file:{uuid}
 * Value: JSON { file: "faces/{uuid}.jpg", created_at: <unix ms> }
 *
 * This metadata is written by worker.js immediately after each successful R2
 * upload.  cleanupExpiredFaces() is called from the scheduled Cron Trigger.
 *
 * ── Retention window ──────────────────────────────────────────────────────────
 * FILE_TTL_MS = 5 hours
 * Cron schedule: every hour (see wrangler.toml [triggers])
 *
 * ── Bindings required ─────────────────────────────────────────────────────────
 * env.FACE_CACHE   — KV namespace (binding = "FACE_CACHE")
 * env.FACES_BUCKET — R2 bucket    (binding = "FACES_BUCKET")
 *
 * ── Cloudflare Worker compatible — no Node.js APIs ───────────────────────────
 */

const KV_PREFIX_FILE = 'face-file:';
const FILE_TTL_MS    = 5 * 60 * 60 * 1000;  // 5 hours in milliseconds

// ─────────────────────────────────────────────────────────────────────────────
// cleanupExpiredFaces — main entry point called by the scheduled event
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scan all KV entries with prefix "face-file:", delete R2 objects and KV
 * records for any file older than FILE_TTL_MS.
 *
 * KV list() returns up to 1 000 keys per page; pagination is handled via
 * the cursor returned in the response so all entries are eventually scanned.
 *
 * @param {Object} env — CF Worker env (requires FACE_CACHE + FACES_BUCKET)
 * @returns {Promise<{ deleted: number, errors: number }>}
 */
export async function cleanupExpiredFaces(env) {
  if (!env?.FACE_CACHE || !env?.FACES_BUCKET) {
    console.warn('[cleanupFaces] FACE_CACHE or FACES_BUCKET not configured — skipping.');
    return { deleted: 0, errors: 0 };
  }

  let deleted = 0;
  let errors  = 0;
  let cursor  = undefined;
  const cutoff = Date.now() - FILE_TTL_MS;

  console.log(`[cleanupFaces] Starting cleanup — cutoff: ${new Date(cutoff).toISOString()}`);

  // ── Paginate through all face-file: KV entries ────────────────────────────
  do {
    let listResult;
    try {
      listResult = await env.FACE_CACHE.list({
        prefix: KV_PREFIX_FILE,
        ...(cursor ? { cursor } : {}),
      });
    } catch (listErr) {
      console.error('[cleanupFaces] KV list error:', listErr.message);
      break;
    }

    for (const kvKey of listResult.keys) {
      // ── Read file metadata ────────────────────────────────────────────────
      let meta;
      try {
        const raw = await env.FACE_CACHE.get(kvKey.name);
        if (!raw) continue;
        meta = JSON.parse(raw);
      } catch (readErr) {
        console.warn(`[cleanupFaces] Could not read KV key ${kvKey.name}:`, readErr.message);
        continue;
      }

      // ── Skip if not yet expired ───────────────────────────────────────────
      if (!meta?.created_at || meta.created_at > cutoff) continue;

      const ageMinutes = Math.round((Date.now() - meta.created_at) / 60_000);
      console.log(`[cleanupFaces] Expiring ${meta.file} (age: ${ageMinutes} min)`);

      // ── Delete R2 object ──────────────────────────────────────────────────
      if (meta.file) {
        try {
          await env.FACES_BUCKET.delete(meta.file);
          console.log(`[cleanupFaces] R2 deleted: ${meta.file}`);
        } catch (r2Err) {
          console.error(`[cleanupFaces] R2 delete failed for ${meta.file}:`, r2Err.message);
          errors++;
          // Continue to delete the KV record anyway — avoids repeated retries
          // on objects that no longer exist in R2
        }
      }

      // ── Delete KV record ──────────────────────────────────────────────────
      try {
        await env.FACE_CACHE.delete(kvKey.name);
        deleted++;
      } catch (kvDelErr) {
        console.error(`[cleanupFaces] KV delete failed for ${kvKey.name}:`, kvDelErr.message);
        errors++;
      }
    }

    // ── Advance cursor for next page ──────────────────────────────────────────
    cursor = listResult.list_complete ? undefined : listResult.cursor;
  } while (cursor);

  console.log(`[cleanupFaces] Done — deleted: ${deleted}, errors: ${errors}`);
  return { deleted, errors };
}
