/**
 * PotretAI Studio — Cloudflare Worker Proxy v3.0
 * Handles: Fal.ai (PuLID, InstantID, Easel FaceSwap, Upload)
 * API keys stored as Worker secrets — never exposed to browser
 *
 * Required secrets (set via wrangler secret put <NAME>):
 *   FAL_KEY         — fal.ai API key (primary AI provider)
 *   REPLICATE_KEY   — Replicate API key (fallback AI provider)
 *   R2_CDN_BASE     — CDN base URL for uploaded face photos
 */

import { chargeGenerate, refundGenerate, writeGenerateLog, getUserCredit } from './utils/creditManager.js';
import { handleHistoryRoute, handleGetCreditRoute } from './history/historyRoutes.js';
import { createOrder } from './payments/createOrder.js';
import { submitProof } from './payments/submitProof.js';
import { verifyPayment } from './payments/verifyPayment.js';

const ALLOWED_ORIGINS = [
  'https://potretai.studiocreative.id',
  'https://potretai-v3-live.pages.dev',
  'https://studiocreative.id',
  'https://www.studiocreative.id',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5501',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5500',
  'http://localhost:5501',
  'null',
];

export default {
  async fetch(request, env, _ctx) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') return handleCors(origin);

    // Health check
    if (request.method === 'GET' && url.pathname === '/') {
      return jsonResponse({ status: 'ok', service: 'PotretAI Proxy', version: '3.0' }, 200, origin);
    }

    if (request.method === 'GET' && url.pathname.startsWith('/history/')) {
      return handleHistoryRoute(request, env, origin);
    }

    if (request.method === 'GET' && url.pathname.startsWith('/get-credit/')) {
      return handleGetCreditRoute(request, env, origin);
    }

    if (request.method === 'POST' && url.pathname === '/create-order') {
      return withCors(await createOrder(request, env), origin);
    }

    if (request.method === 'POST' && url.pathname === '/submit-payment-proof') {
      return withCors(await submitProof(request, env), origin);
    }

    if (request.method === 'POST' && url.pathname === '/verify-payment') {
      return withCors(await verifyPayment(request, env), origin);
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, origin);
    }

    if (!isAllowedOrigin(origin)) {
      return jsonResponse({ error: 'Origin not allowed' }, 403, origin);
    }

    // ── Token validation (implement before paid launch) ──────────────
    // const userId = request.headers.get('X-User-Id') || '';
    // const token  = request.headers.get('X-User-Token') || '';
    // if (path.startsWith('/generate') && userId) {
    //   const valid = await validateToken(env, userId, token);
    //   if (!valid) return jsonResponse({ error: 'Token habis. Silakan beli paket.' }, 402, origin);
    // }

    const apiKey = env.FAL_KEY || env.FAL_API_KEY;
    if (!apiKey) return jsonResponse({ error: 'Server configuration error' }, 500, origin);

    const path = url.pathname;

    try {
      // ── Route: Upload face photo to R2 storage ─────────────────────
      if (path === '/upload-face') {
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file) return jsonResponse({ error: 'No file provided' }, 400, origin);

        if (!env.FACES_BUCKET) return jsonResponse({ error: 'Storage tidak tersedia' }, 500, origin);

        const bytes = await file.arrayBuffer();
        const uuid = crypto.randomUUID();
        const ext = (file.type === 'image/png') ? 'png' : 'jpg';
        const key = `faces/${uuid}.${ext}`;

        await env.FACES_BUCKET.put(key, bytes, {
          httpMetadata: { contentType: file.type || 'image/jpeg' },
        });

        const cdnBase = (env.R2_CDN_BASE || '').replace(/\/$/, '');
        if (!cdnBase) return jsonResponse({ error: 'CDN tidak dikonfigurasi' }, 500, origin);

        const fileUrl = `${cdnBase}/${key}`;
        return jsonResponse({ success: true, url: fileUrl }, 200, origin);
      }

      // ── Route: Generate solo photos (flux-pulid, fal.ai → Replicate fallback) ─
      if (path === '/generate-pulid') {
        const body = await request.json();
        if (!body.prompt)    return jsonResponse({ error: 'prompt required' }, 400, origin);
        if (!body.face_url)  return jsonResponse({ error: 'face_url required' }, 400, origin);

        // Truncate prompt to max 1200 chars at last comma boundary
        const MAX_PROMPT = 1200;
        let safePrompt = body.prompt;
        if (safePrompt.length > MAX_PROMPT) {
          const cut = safePrompt.lastIndexOf(',', MAX_PROMPT);
          safePrompt = cut > 800 ? safePrompt.substring(0, cut) : safePrompt.substring(0, MAX_PROMPT);
          console.log(`[PotretAI] Prompt truncated: ${body.prompt.length} → ${safePrompt.length} chars`);
        }

        // Photo count: frontend can request 2–4 photos (default 2)
        const photoCount = Math.min(Math.max(parseInt(body.count) || 2, 2), 4);
        const userId = request.headers.get('X-User-Id') || body.user_id || '';
        const requestId = body.request_id || crypto.randomUUID();
        const service = body.service || 'studio_foto';
        const requiresIdentity = !/^https?:\/\/(localhost|127\.0\.0\.1)/.test(origin || '');
        console.log(`[PotretAI] photoCount: ${photoCount}`);

        if (requiresIdentity && !userId) {
          return jsonResponse({ error: 'User identity required', code: 'USER_ID_REQUIRED' }, 401, origin);
        }

        let chargeMeta = null;
        if (userId && env.USER_CREDITS) {
          try {
            chargeMeta = await chargeGenerate(userId, { photoCount, service, requestId }, env);
          } catch (err) {
            await writeGenerateLog(userId, {
              request_id: requestId,
              endpoint: path,
              service,
              photo_count: photoCount,
              status: 'rejected_quota',
              reason: err.message,
            }, env);
            const latestCredit = userId ? await getUserCredit(userId, env) : null;
            return jsonResponse({ error: err.message || 'Kredit habis. Silakan upgrade paket atau top up.', credit: latestCredit }, 402, origin);
          }
        }

        await writeGenerateLog(userId, {
          request_id: requestId,
          endpoint: path,
          service,
          photo_count: photoCount,
          charged_credits: chargeMeta?.cost || 0,
          package_tier: chargeMeta?.package_tier || 'anonymous',
          status: 'processing',
          prompt_length: safePrompt.length,
        }, env);

        const REPLICATE_KEY = env.REPLICATE_KEY || '';

        const callFalAI = async (seed, prompt, reqBody, key) => {
          const payload = {
            prompt,
            reference_image_url: reqBody.face_url,
            num_images: 1,
            image_size: { width: 768, height: 1152 },
            num_inference_steps: 18,
            guidance_scale: 4.5,
            id_scale: 0.85,
            seed,
            sync_mode: true,
            output_format: 'jpeg',
            output_quality: 92,
          };
          const res = await fetch('https://fal.run/fal-ai/flux-pulid', {
            method: 'POST',
            headers: { 'Authorization': `Key ${key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const errText = await res.text().catch(() => '');
            throw new Error(`fal.ai ${res.status}: ${errText.slice(0, 200)}`);
          }
          const data = await res.json().catch(() => null);
          return data?.images?.[0]?.url || null;
        };

        const callReplicate = async (seed, prompt, reqBody, replicateKey) => {
          // DISABLED: Replicate hash not yet configured
          // To enable: get real model hash from replicate.com/zsxkib/flux-pulid → API tab
          // Then set REPLICATE_KEY secret via: wrangler secret put REPLICATE_KEY
          console.log('[PotretAI] Replicate fallback disabled — hash not configured');
          return null;
        };

        const callOneWithFallback = async (seed) => {
          // Try fal.ai first
          try {
            const url = await callFalAI(seed, safePrompt, body, apiKey);
            if (url) return url;
          } catch (falErr) {
            console.error('[PotretAI] fal.ai failed:', falErr.message, '→ trying Replicate');
          }
          // Fallback to Replicate
          try {
            const url = await callReplicate(seed, safePrompt, body, REPLICATE_KEY);
            if (url) return url;
          } catch (repErr) {
            console.error('[PotretAI] Replicate also failed:', repErr.message);
          }
          return null;
        };

        const seeds = Array.from({ length: photoCount }, (_, i) =>
          Math.floor(Math.random() * 900000) + i * 1000000
        );

        const results = await Promise.allSettled(seeds.map(s => callOneWithFallback(s)));
        const urls = results
          .filter(r => r.status === 'fulfilled' && r.value)
          .map(r => r.value);

        if (!urls.length) {
          let refundedCredit = null;
          if (chargeMeta && userId) {
            refundedCredit = await refundGenerate(userId, { photoCount, service, requestId, reason: 'generate_empty_result' }, env);
          }
          await writeGenerateLog(userId, {
            request_id: requestId,
            endpoint: path,
            service,
            photo_count: photoCount,
            charged_credits: chargeMeta?.cost || 0,
            package_tier: chargeMeta?.package_tier || 'anonymous',
            status: 'failed',
            reason: 'empty_result',
          }, env);
          return jsonResponse({
            error: 'AI tidak menghasilkan gambar. Coba lagi.',
            promptLength: safePrompt?.length,
            credit: refundedCredit,
          }, 502, origin);
        }
        await writeGenerateLog(userId, {
          request_id: requestId,
          endpoint: path,
          service,
          photo_count: photoCount,
          charged_credits: chargeMeta?.cost || 0,
          package_tier: chargeMeta?.package_tier || 'anonymous',
          status: 'success',
          result_count: urls.length,
        }, env);
        const latestCredit = userId ? await getUserCredit(userId, env) : null;
        return jsonResponse({ success: true, urls, credit: latestCredit }, 200, origin);
      }

      // ── Route: Professional headshot via flux-pulid (parallel × 2-4) ──
      if (path === '/generate-instantid') {
        const body = await request.json();
        if (!body.prompt)   return jsonResponse({ error: 'prompt required' }, 400, origin);
        if (!body.face_url) return jsonResponse({ error: 'face_url required' }, 400, origin);

        // Truncate prompt to max 1200 chars at last comma boundary
        let safePromptId = body.prompt;
        if (safePromptId.length > 1200) {
          const cut = safePromptId.lastIndexOf(',', 1200);
          safePromptId = cut > 800 ? safePromptId.substring(0, cut) : safePromptId.substring(0, 1200);
        }

        const photoCount = Math.min(Math.max(parseInt(body.count) || 2, 2), 4);
        const userId = request.headers.get('X-User-Id') || body.user_id || '';
        const requestId = body.request_id || crypto.randomUUID();
        const service = body.service || 'instantid';
        const requiresIdentity = !/^https?:\/\/(localhost|127\.0\.0\.1)/.test(origin || '');
        console.log(`[PotretAI] instantid photoCount: ${photoCount}`);

        if (requiresIdentity && !userId) {
          return jsonResponse({ error: 'User identity required', code: 'USER_ID_REQUIRED' }, 401, origin);
        }

        let chargeMeta = null;
        if (userId && env.USER_CREDITS) {
          try {
            chargeMeta = await chargeGenerate(userId, { photoCount, service, requestId }, env);
          } catch (err) {
            await writeGenerateLog(userId, {
              request_id: requestId,
              endpoint: path,
              service,
              photo_count: photoCount,
              status: 'rejected_quota',
              reason: err.message,
            }, env);
            const latestCredit = userId ? await getUserCredit(userId, env) : null;
            return jsonResponse({ error: err.message || 'Kredit habis. Silakan upgrade paket atau top up.', credit: latestCredit }, 402, origin);
          }
        }

        await writeGenerateLog(userId, {
          request_id: requestId,
          endpoint: path,
          service,
          photo_count: photoCount,
          charged_credits: chargeMeta?.cost || 0,
          package_tier: chargeMeta?.package_tier || 'anonymous',
          status: 'processing',
          prompt_length: safePromptId.length,
        }, env);

        const seeds = Array.from({ length: photoCount }, (_, i) =>
          Math.floor(Math.random() * 900000) + i * 1000000
        );

        const callOne = async (seed) => {
          const payload = {
            prompt: safePromptId,
            reference_image_url: body.face_url,
            num_images: 1,
            image_size: { width: 768, height: 1152 },
            num_inference_steps: 18,
            guidance_scale: 4.5,
            id_scale: 0.75,
            seed,
            sync_mode: true,
            output_format: 'jpeg',
            output_quality: 92,
          };
          const res = await fetch('https://fal.run/fal-ai/flux-pulid', {
            method: 'POST',
            headers: {
              'Authorization': `Key ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const errText = await res.text().catch(() => '');
            console.error(`[PotretAI] fal.ai error ${res.status}:`, errText.slice(0, 500));
            return null;
          }
          const data = await res.json().catch(() => null);
          return data?.images?.[0]?.url || null;
        };

        const results = await Promise.allSettled(seeds.map(s => callOne(s)));
        const urls = results
          .filter(r => r.status === 'fulfilled' && r.value)
          .map(r => r.value);

        if (!urls.length) {
          let refundedCredit = null;
          if (chargeMeta && userId) {
            refundedCredit = await refundGenerate(userId, { photoCount, service, requestId, reason: 'generate_empty_result' }, env);
          }
          await writeGenerateLog(userId, {
            request_id: requestId,
            endpoint: path,
            service,
            photo_count: photoCount,
            charged_credits: chargeMeta?.cost || 0,
            package_tier: chargeMeta?.package_tier || 'anonymous',
            status: 'failed',
            reason: 'empty_result',
          }, env);
          return jsonResponse({ error: 'Generate foto profesional gagal. Coba lagi.', credit: refundedCredit }, 502, origin);
        }
        await writeGenerateLog(userId, {
          request_id: requestId,
          endpoint: path,
          service,
          photo_count: photoCount,
          charged_credits: chargeMeta?.cost || 0,
          package_tier: chargeMeta?.package_tier || 'anonymous',
          status: 'success',
          result_count: urls.length,
        }, env);
        const latestCredit = userId ? await getUserCredit(userId, env) : null;
        return jsonResponse({ success: true, urls, credit: latestCredit }, 200, origin);
      }

      return jsonResponse({ error: 'Endpoint not found' }, 404, origin);

    } catch (err) {
      console.error('[PotretAI Worker] Error:', err.message);
      return jsonResponse({ error: 'Server error. Coba lagi.' }, 500, origin);
    }
  },

  // ── Queue consumer — required by [[queues.consumers]] ──
  async queue(batch, _env) {
    for (const message of batch.messages) {
      console.log('[PotretAI Queue] Received job:', message.body?.job_id || 'unknown');
      message.ack();
    }
  },

  // ── Scheduled trigger — required by [triggers] crons ──
  async scheduled(_event, _env, _ctx) {
    console.log('[PotretAI Scheduled] Cron triggered');
  },
};

// ── Helpers ─────────────────────────────────────────────────────────
function isAllowedOrigin(origin) {
  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin || normalizedOrigin === 'null') return true;
  return ALLOWED_ORIGINS.some(o => normalizeOrigin(o) === normalizedOrigin);
}

function corsHeaders(origin) {
  const allowed = resolveAllowedOrigin(origin);
  const headers = {
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-User-Id',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
  if (allowed) headers['Access-Control-Allow-Origin'] = allowed;
  return headers;
}

function handleCors(origin) {
  if (!isAllowedOrigin(origin)) {
    return new Response(null, { status: 403, headers: corsHeaders('') });
  }
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

function jsonResponse(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

function withCors(response, origin) {
  const headers = new Headers(response.headers);
  const cors = corsHeaders(origin);
  Object.entries(cors).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function translateError(status, errBody) {
  const msgs = {
    401: 'API key tidak valid. Hubungi admin.',
    402: 'Kredit Fal.ai habis. Hubungi admin.',
    422: 'Format request tidak valid. Coba lagi.',
    429: 'Terlalu banyak request. Tunggu sebentar.',
    500: 'AI server bermasalah. Coba lagi dalam 1 menit.',
    503: 'AI server overload. Coba lagi.',
  };
  return msgs[status] || errBody?.detail || `AI error (${status})`;
}

function normalizeOrigin(origin) {
  return (origin || '').trim().replace(/\/$/, '');
}

function resolveAllowedOrigin(origin) {
  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin || normalizedOrigin === 'null') return null;
  return ALLOWED_ORIGINS.find(o => normalizeOrigin(o) === normalizedOrigin) || null;
}
