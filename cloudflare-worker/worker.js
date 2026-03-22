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

        // Photo count: frontend can request 2–4 photos (default 4)
        const photoCount = Math.min(Math.max(parseInt(body.count) || 4, 2), 4);
        console.log(`[PotretAI] photoCount: ${photoCount}`);

        const REPLICATE_KEY = env.REPLICATE_KEY || '';

        const callFalAI = async (seed, prompt, reqBody, key) => {
          const payload = {
            prompt,
            reference_image_url: reqBody.face_url,
            num_images: 1,
            image_size: { width: 832, height: 1216 },
            num_inference_steps: 25,
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
          return jsonResponse({
            error: 'AI tidak menghasilkan gambar. Coba lagi.',
            promptLength: safePrompt?.length
          }, 502, origin);
        }
        return jsonResponse({ success: true, urls }, 200, origin);
      }

      // ── Route: Professional headshot via flux-pulid (parallel × 4) ──
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

        const seeds = [
          Math.floor(Math.random() * 900000),
          Math.floor(Math.random() * 900000) + 1000000,
          Math.floor(Math.random() * 900000) + 2000000,
          Math.floor(Math.random() * 900000) + 3000000,
        ];

        const callOne = async (seed) => {
          const payload = {
            prompt: safePromptId,
            reference_image_url: body.face_url,
            num_images: 1,
            image_size: { width: 832, height: 1216 },
            num_inference_steps: 25,
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

        if (!urls.length) return jsonResponse({ error: 'Generate foto profesional gagal. Coba lagi.' }, 502, origin);
        return jsonResponse({ success: true, urls }, 200, origin);
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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
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
