/**
 * history/historyRoutes.js
 *
 * Worker API handlers for user generation history and credit info.
 *
 * Routes handled:
 *   GET /history/{user_id}      — latest 20 generation entries for the user
 *   GET /get-credit/{user_id}   — current credit balance for the dashboard
 *
 * Both routes are registered in worker.js.
 *
 * CORS + JSON helpers are self-contained (no circular import from worker.js).
 *
 * Security note:
 *   Production deployments should verify the request JWT/session token
 *   to ensure user_id in the URL matches the authenticated user.
 *   That auth layer is outside the scope of this module.
 */

import { getUserHistory }  from './historyManager.js';
import { ensureUserCredit } from '../utils/creditManager.js';

// ─────────────────────────────────────────────────────────────────────────────
/**
 * handleHistoryRoute
 *
 * GET /history/{user_id}
 *
 * Response:
 *   200  { history: [ { user_id, image_url, share_url, prompt, created_at }, ... ] }
 *   400  { error: "user_id diperlukan." }
 *   500  { error: "..." }
 *
 * @param {Request} request
 * @param {object}  env
 * @param {string}  origin  — for CORS headers
 */
export async function handleHistoryRoute(request, env, origin) {
  const url     = new URL(request.url);
  const user_id = url.pathname.replace('/history/', '').replace(/\//g, '').trim();

  if (!user_id) {
    return jsonRes({ error: 'user_id diperlukan.' }, 400, origin);
  }

  try {
    const history = await getUserHistory(user_id, env, 20);
    return jsonRes({ history }, 200, origin);
  } catch (err) {
    console.error('[history] handleHistoryRoute error:', err.message);
    return jsonRes({ error: 'Gagal mengambil riwayat generasi.' }, 500, origin);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
/**
 * handleGetCreditRoute
 *
 * GET /get-credit/{user_id}
 *
 * Returns the user's current credit balance and plan info.
 * Used by the dashboard to display remaining generations.
 *
 * Response:
 *   200  { plan, generates_remaining, categories, watermark }
 *   400  { error: "user_id diperlukan." }
 *
 * @param {Request} request
 * @param {object}  env
 * @param {string}  origin
 */
export async function handleGetCreditRoute(request, env, origin) {
  const url     = new URL(request.url);
  const user_id = url.pathname.replace('/get-credit/', '').replace(/\//g, '').trim();

  if (!user_id) {
    return jsonRes({ error: 'user_id diperlukan.' }, 400, origin);
  }

  try {
    const credit = await ensureUserCredit(user_id, env);
    return jsonRes(credit, 200, origin);
  } catch (err) {
    console.error('[history] handleGetCreditRoute error:', err.message);
    return jsonRes({ error: 'Gagal mengambil data kredit.' }, 500, origin);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Minimal JSON + CORS helper (self-contained to avoid circular imports)
// ─────────────────────────────────────────────────────────────────────────────
const CORS_ORIGINS = [
  'https://potretai.studiocreative.id',
  'https://potretai-v3-live.pages.dev',
  'https://studiocreative.id',
  'https://www.studiocreative.id',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5501',
  'http://localhost:5500',
  'http://localhost:5501',
];

function jsonRes(data, status, origin) {
  const allow = resolveAllowedOrigin(origin);
  const headers = {
    'Content-Type':                 'application/json',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-User-Id',
    'Vary':                         'Origin',
  };
  if (allow) headers['Access-Control-Allow-Origin'] = allow;
  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}

function normalizeOrigin(origin) {
  return (origin || '').trim().replace(/\/$/, '');
}

function resolveAllowedOrigin(origin) {
  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin || normalizedOrigin === 'null') return null;
  return CORS_ORIGINS.find((allowed) => normalizeOrigin(allowed) === normalizedOrigin) || null;
}
