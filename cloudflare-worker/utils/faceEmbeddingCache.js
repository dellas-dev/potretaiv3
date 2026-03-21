/**
 * faceEmbeddingCache.js — Face detection result cache using Cloudflare KV
 *
 * ── Purpose ───────────────────────────────────────────────────────────────────
 * Avoid re-running the expensive Workers AI face detection pipeline for images
 * that have already been validated and processed.
 *
 * ── Cache key strategy ────────────────────────────────────────────────────────
 * Key:   face:{sha256hex}   (SHA-256 of raw image bytes)
 * Value: JSON { embedding: [...], created_at: <unix ms> }
 *
 * ── TTL ───────────────────────────────────────────────────────────────────────
 * KV entries expire automatically after 5 hours (18 000 s) — matches the R2
 * file retention window so cached embeddings never outlive their source images.
 *
 * ── KV binding required ───────────────────────────────────────────────────────
 * [[kv_namespaces]]
 * binding = "FACE_CACHE"
 * id      = "<your-kv-namespace-id>"
 *
 * ── Cloudflare Worker compatible — Web Crypto API only, no Node.js ────────────
 */

const KV_PREFIX_EMBEDDING  = 'face:';
const EMBEDDING_TTL_SECONDS = 5 * 60 * 60;   // 5 hours

// ─────────────────────────────────────────────────────────────────────────────
// generateImageHash — SHA-256 fingerprint of raw image bytes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a hex SHA-256 hash for an image ArrayBuffer.
 * Used as the cache key so identical uploads reuse stored detections.
 *
 * @param {ArrayBuffer} imageBuffer — Raw image bytes (from file.arrayBuffer())
 * @returns {Promise<string>}       — 64-char lowercase hex string
 */
export async function generateImageHash(imageBuffer) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', imageBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─────────────────────────────────────────────────────────────────────────────
// getEmbedding — read cached detection result from KV
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retrieve a cached face detection result from Cloudflare KV.
 *
 * @param {string} hash  — SHA-256 hex produced by generateImageHash()
 * @param {Object} env   — CF Worker env (requires env.FACE_CACHE KV binding)
 * @returns {Promise<Object|null>}
 *   Cached payload { embedding, created_at } on hit, or null on miss / error.
 */
export async function getEmbedding(hash, env) {
  if (!env?.FACE_CACHE) return null;

  let raw;
  try {
    raw = await env.FACE_CACHE.get(`${KV_PREFIX_EMBEDDING}${hash}`);
  } catch (err) {
    console.warn('[faceEmbeddingCache] KV get error:', err.message);
    return null;
  }

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// saveEmbedding — write detection result to KV with 5-hour TTL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Persist a face detection result to Cloudflare KV.
 * Silently no-ops when FACE_CACHE binding is absent (graceful degradation).
 *
 * @param {string}   hash      — SHA-256 hex from generateImageHash()
 * @param {Array}    embedding — DETR detections array from countFaces()
 * @param {Object}   env       — CF Worker env (requires env.FACE_CACHE)
 * @returns {Promise<void>}
 */
export async function saveEmbedding(hash, embedding, env) {
  if (!env?.FACE_CACHE) return;

  const payload = JSON.stringify({
    embedding,
    created_at: Date.now(),
  });

  try {
    await env.FACE_CACHE.put(
      `${KV_PREFIX_EMBEDDING}${hash}`,
      payload,
      { expirationTtl: EMBEDDING_TTL_SECONDS }
    );
  } catch (err) {
    // Non-fatal — cache write failure should not block the upload response
    console.warn('[faceEmbeddingCache] KV put error:', err.message);
  }
}
