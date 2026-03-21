/**
 * turnstile.js — Cloudflare Turnstile bot protection
 *
 * Verifies a Turnstile challenge token server-side before allowing generation.
 * Token is submitted by the frontend alongside the generate request.
 *
 * Requires secret:
 *   wrangler secret put TURNSTILE_SECRET
 *
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// ─────────────────────────────────────────────────────────────────────────────
// verifyTurnstile
// Returns true if the token is valid, false otherwise.
// Fails open (returns true) if TURNSTILE_SECRET is not configured, so
// development environments without the secret still work.
// ─────────────────────────────────────────────────────────────────────────────

// Error codes from Cloudflare that indicate a domain/config issue — NOT a bot.
// We fail-open for these so legitimate users are never blocked by misconfiguration.
// Ref: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/#error-codes
const FAIL_OPEN_CODES = new Set([
  'hostname-does-not-match',   // domain not registered in Turnstile site settings
  'timeout-or-duplicate',      // token expired or already used — user waited too long
  'missing-input-secret',      // server misconfiguration
  'invalid-input-secret',      // server misconfiguration
  'invalid-widget-id',         // site key mismatch
  'invalid-parsed-secret',     // server misconfiguration
  'bad-request',               // malformed request from our side
  'internal-error',            // Cloudflare service error
]);

export async function verifyTurnstile(token, env) {
  const secret = env?.TURNSTILE_SECRET;

  if (!secret) {
    console.warn('[turnstile] TURNSTILE_SECRET not set — skipping verification.');
    return true;   // fail open in dev
  }

  if (!token) {
    // Fail open saat token kosong — domain preview *.pages.dev belum bisa didaftarkan
    // sebagai wildcard di Turnstile dashboard.
    // Strict mode aktifkan setelah custom domain production dikonfigurasi.
    console.warn('[turnstile] No token — skipping verification (fail-open).');
    return true;
  }

  console.log('[turnstile] Verifying token:', token.slice(0, 20) + '…');

  try {
    const body = new FormData();
    body.append('secret',   secret);
    body.append('response', token);

    const res = await fetch(VERIFY_URL, { method: 'POST', body });

    if (!res.ok) {
      // Cloudflare siteverify endpoint itself returned non-2xx — likely a transient
      // service error. Fail open so users are not blocked by Cloudflare downtime.
      console.error('[turnstile] Siteverify HTTP error:', res.status, '— fail-open');
      return true;
    }

    const data = await res.json();
    console.log('[turnstile] Verify response:', JSON.stringify(data));

    if (data.success) {
      console.log('[turnstile] Token valid ✓');
      return true;
    }

    // Token failed — check whether the reason is a config/domain issue (fail-open)
    // or genuinely suspicious (fail-closed).
    const codes = data['error-codes'] ?? [];
    const isConfigIssue = codes.some((c) => FAIL_OPEN_CODES.has(c));

    if (isConfigIssue) {
      console.warn('[turnstile] Fail-open due to config/domain issue:', codes);
      return true;
    }

    // Only truly block when Cloudflare confirms an invalid-input-response
    // that is NOT caused by a domain or config problem.
    console.warn('[turnstile] Token rejected (bot suspected):', codes);
    return false;

  } catch (err) {
    // Network error reaching Cloudflare — fail open, don't block users.
    console.error('[turnstile] Fetch error:', err.message, '— fail-open');
    return true;
  }
}
