/**
 * security.js — Request validation helpers
 *
 * validateOrigin  — blocks requests from unlisted origins
 * requireJson     — ensures Content-Type is application/json
 *
 * Usage in worker.js (before any handler):
 *   import { validateOrigin, requireJson } from './utils/security.js';
 *
 *   if (!validateOrigin(request)) {
 *     return new Response(JSON.stringify({ error: 'Invalid origin' }), { status: 403 });
 *   }
 */

const ALLOWED_ORIGINS = [
  'https://potretai.com',
  'https://www.potretai.com',
  'https://studiocreative.id',
  'https://www.studiocreative.id',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://localhost:5501',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5501',
];

// ─────────────────────────────────────────────────────────────────────────────
// validateOrigin
// Returns true if the request Origin header is in the allowed list.
// Requests with no Origin header (e.g. server-to-server, curl) are blocked.
// ─────────────────────────────────────────────────────────────────────────────

export function validateOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

// ─────────────────────────────────────────────────────────────────────────────
// requireJson
// Returns true if Content-Type is application/json.
// ─────────────────────────────────────────────────────────────────────────────

export function requireJson(request) {
  const type = request.headers.get('content-type');
  return !!(type && type.includes('application/json'));
}
