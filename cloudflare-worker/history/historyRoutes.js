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
import { getUserCredit }   from '../utils/creditManager.js';

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
    const credit = await getUserCredit(user_id, env);
    if (!credit) {
      return jsonRes({ error: 'User tidak ditemukan.' }, 404, origin);
    }
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
  'https://studiocreative.id',
  'https://www.studiocreative.id',
  'http://localhost:3000',
  'http://127.0.0.1:5500',
];

function jsonRes(data, status, origin) {
  const allow = CORS_ORIGINS.includes(origin) ? origin : CORS_ORIGINS[0];
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type':                 'application/json',
      'Access-Control-Allow-Origin':  allow,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary':                         'Origin',
    },
  });
}
