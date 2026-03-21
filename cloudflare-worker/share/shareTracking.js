/**
 * share/shareTracking.js
 *
 * Analytics for share links stored in SHARE_KV.
 *
 * Function:
 *   incrementShareViews(shareId, env) → Promise<void>
 *
 * Increments the `views` counter on the SHARE_KV record for the given
 * share_id.  Silently no-ops when SHARE_KV is unavailable (fail-open).
 */

const SHARE_TTL = 60 * 60 * 24 * 90;  // 90 days — refresh TTL on each view

// ─────────────────────────────────────────────────────────────────────────────
/**
 * incrementShareViews
 *
 * Reads the current SHARE_KV metadata, increments `views`, and writes it back.
 * The KV TTL is refreshed to 90 days on each write so popular shares
 * don't expire while still receiving traffic.
 *
 * @param {string} shareId — share ID (without the "share:" prefix)
 * @param {object} env     — Cloudflare Worker env bindings
 */
export async function incrementShareViews(shareId, env) {
  if (!env?.SHARE_KV || !shareId) return;

  const key = `share:${shareId}`;

  try {
    const raw = await env.SHARE_KV.get(key);
    if (!raw) return;  // record already expired or never existed — no-op

    const data = JSON.parse(raw);
    data.views = (data.views || 0) + 1;

    await env.SHARE_KV.put(key, JSON.stringify(data), {
      expirationTtl: SHARE_TTL,
    });
  } catch (err) {
    // Never crash the share page because of a tracking failure
    console.warn(`[share] incrementShareViews failed for ${shareId}:`, err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
/**
 * getShareMetadata
 *
 * Retrieves a share record from SHARE_KV.
 * Returns null if the record does not exist or KV is unavailable.
 *
 * @param {string} shareId
 * @param {object} env
 * @returns {Promise<object|null>}
 */
export async function getShareMetadata(shareId, env) {
  if (!env?.SHARE_KV || !shareId) return null;

  try {
    const raw = await env.SHARE_KV.get(`share:${shareId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn(`[share] getShareMetadata failed for ${shareId}:`, err.message);
    return null;
  }
}
