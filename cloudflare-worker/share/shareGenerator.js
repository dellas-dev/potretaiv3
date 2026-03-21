/**
 * share/shareGenerator.js
 *
 * Creates persistent share links stored in SHARE_KV.
 *
 * Each record (key: share:{share_id}):
 *   {
 *     user_id:    string,
 *     image_url:  string,   ← must be an R2/CDN URL (validated)
 *     prompt:     string,
 *     created_at: number,   ← Unix seconds
 *     views:      number,
 *   }
 *
 * TTL: 90 days (auto-expired by KV).
 *
 * Security (Task 7):
 *   Only image URLs from known R2/CDN domains are accepted.
 *   All other domains are rejected with an error.
 */

const SHARE_BASE   = 'https://potretai.studiocreative.id';
const SHARE_TTL    = 60 * 60 * 24 * 90;  // 90 days in seconds

// ── Allowed image URL domains ─────────────────────────────────────────────────
// Accept:
//   cdn.potretai.com                  — custom CDN for generated images
//   *.r2.dev                          — Cloudflare R2 public bucket URLs (pub-XXX.r2.dev)
//   *.r2.cloudflarestorage.com        — internal R2 signed URLs
const ALLOWED_IMAGE_HOSTS = [
  'cdn.potretai.com',
];

function isAllowedImageUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }
  const host = parsed.hostname;
  return (
    ALLOWED_IMAGE_HOSTS.includes(host)        ||
    host.endsWith('.r2.dev')                  ||
    host.endsWith('.r2.cloudflarestorage.com')
  );
}

// ─────────────────────────────────────────────────────────────────────────────
/**
 * createShareLink
 *
 * @param {string}  user_id   — authenticated user ID (or 'anonymous')
 * @param {string}  image_url — CDN/R2 URL of the image to share
 * @param {string}  prompt    — generation prompt (stored for display)
 * @param {object}  env       — Cloudflare Worker env bindings
 * @returns {Promise<string>} — public share URL, e.g. https://potretai.studiocreative.id/share/a1b2c3d4e5f6
 */
export async function createShareLink(user_id, image_url, prompt, env) {
  // ── Security check ───────────────────────────────────────────────────────
  if (!isAllowedImageUrl(image_url)) {
    let domain = '(invalid URL)';
    try { domain = new URL(image_url).hostname; } catch {}
    throw new Error(`Image URL domain not allowed: ${domain}`);
  }

  if (!env?.SHARE_KV) {
    throw new Error('SHARE_KV binding is not configured.');
  }

  // ── Generate short ID (12 hex chars from UUID, unique enough for KV) ─────
  const share_id = crypto.randomUUID().replace(/-/g, '').slice(0, 12);

  const metadata = {
    user_id:    user_id || 'anonymous',
    image_url,
    prompt:     typeof prompt === 'string' ? prompt.slice(0, 500) : '',
    created_at: Math.floor(Date.now() / 1000),
    views:      0,
  };

  await env.SHARE_KV.put(
    `share:${share_id}`,
    JSON.stringify(metadata),
    { expirationTtl: SHARE_TTL }
  );

  return `${SHARE_BASE}/share/${share_id}`;
}

export { isAllowedImageUrl };
