/**
 * generateQueue.js — Cloudflare Queue consumer for async image generation
 *
 * Binding  : GEN_QUEUE    (queue: "potretai-generate")
 * Consumer : max_batch_size = 3 · max_batch_timeout = 5s
 *
 * Job schema (message body):
 * {
 *   job_id   : string,   — crypto.randomUUID() from /generate handler
 *   category : string,   — studio | wisuda
 *   input    : object,   — buildGeneratorInput() payload
 * }
 *
 * Pipeline per job:
 *   1. buildPrompt()              — build base prompt from input
 *   2. buildConsistentPrompts()   — produce 4 shot-varied consistent prompts
 *   3. generateImageWithFace() ×4 — call fal.ai in parallel, one per slot
 *   4. fetch imageBuffer ×4       — download each image from fal.ai CDN
 *   5. RESULT_BUCKET.put() ×4    — store PNGs at images/{job_id}_{1..4}.png
 *   6. CDN URLs                   — https://cdn.potretai.com/images/{job_id}_{n}.png
 *   7. results/{job_id}.json      — metadata for polling
 *   8. recordGeneration()         — analytics
 *
 * On success : message.ack()
 * On failure : message.retry()  — Cloudflare retries up to 3× with backoff
 */

import { buildPrompt }             from '../prompts/promptBuilder.js';
import { buildConsistentPrompts }  from '../prompts/consistencyEngine.js';
import { generateImageWithFace, IMAGE_SIZES } from '../ai/falClient.js';
import { applyWatermark }          from '../ai/watermark.js';
import { recordGeneration }                      from '../utils/analytics.js';
import { checkDailyLimit, recordGenerationCost } from '../utils/costControl.js';
import { saveGenerationHistory }                 from '../history/historyManager.js';

const CDN_BASE = 'https://cdn.potretai.com';

// ─────────────────────────────────────────────────────────────────────────────
// writeJobStatus — write job state to JOBS_KV (non-fatal on error)
// status: 'processing' | 'done' | 'failed'
// ─────────────────────────────────────────────────────────────────────────────
async function writeJobStatus(job_id, data, env) {
  if (!env?.JOBS_KV) return;
  const ttl = data.status === 'done' ? 86400 : 3600;  // 24h done, 1h otherwise
  try {
    await env.JOBS_KV.put(`job:${job_id}`, JSON.stringify(data), { expirationTtl: ttl });
  } catch (err) {
    console.warn(`[Queue] JOBS_KV write failed for job ${job_id}:`, err.message);
  }
}

// ── Default image sizes per slot in the 2×2 grid ─────────────────────────────
const SLOT_SIZES = {
  studio: [IMAGE_SIZES.portrait_4x5, IMAGE_SIZES.portrait_2x3, IMAGE_SIZES.portrait_4x5, IMAGE_SIZES.portrait_2x3],
  wisuda: [IMAGE_SIZES.portrait_4x5, IMAGE_SIZES.portrait_2x3, IMAGE_SIZES.portrait_4x5, IMAGE_SIZES.portrait_2x3],
};

// ─────────────────────────────────────────────────────────────────────────────
export async function processQueue(batch, env) {
  for (const message of batch.messages) {
    await handleJob(message, env);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
async function handleJob(message, env) {
  const job = message.body;

  if (!job?.job_id || !job?.category || !job?.input) {
    console.error('[Queue] Malformed job — missing job_id, category, or input. Dropping.');
    message.ack();
    return;
  }

  const { job_id, category, input } = job;

  // ── Route legacy (frontend-built prompt) jobs to their own handler ──────────
  if (category === 'legacy') {
    await handleLegacyJob(message, env, job_id, input);
    return;
  }

  // ── Daily cost guard ────────────────────────────────────────────────────────
  const allowed = await checkDailyLimit(env);
  if (!allowed) {
    console.warn(`[Queue] Daily limit reached — dropping job ${job_id}.`);
    message.ack();
    return;
  }

  console.log(`[Queue] Processing job ${job_id} — category: ${category}`);
  await writeJobStatus(job_id, { status: 'processing' }, env);
  const startTime = Date.now();

  // ── 1. Build base prompt ────────────────────────────────────────────────────
  let basePrompt;
  try {
    basePrompt = buildPrompt({ ...input, category });
  } catch (err) {
    console.error(`[Queue] buildPrompt failed for job ${job_id}:`, err.message);
    await writeJobStatus(job_id, { status: 'failed', error: err.message }, env);
    message.retry();
    return;
  }

  basePrompt = applyWatermark(basePrompt, input);

  // ── 2. Consistency engine → 4 shot-varied prompts ──────────────────────────
  const prompts = buildConsistentPrompts(basePrompt, { category });

  // ── 3. Resolve face URL ─────────────────────────────────────────────────────
  const faceUrl = resolveFaceUrl(input, category);
  if (!faceUrl) {
    console.error(`[Queue] No face URL for job ${job_id}. Dropping.`);
    await writeJobStatus(job_id, { status: 'failed', error: 'Face URL tidak ditemukan.' }, env);
    message.ack();
    return;
  }

  const sizes    = SLOT_SIZES[category] || SLOT_SIZES.prewedding;
  const idWeight = input.id_weight ?? 1;
  const falKey   = input.fal_key;

  // ── 4. Generate 4 images in parallel ───────────────────────────────────────
  const generationResults = await Promise.all(
    prompts.map((prompt, i) =>
      generateImageWithFace(prompt, faceUrl, {
        image_size: sizes[i],
        id_weight:  idWeight,
        fal_key:    falKey,
      })
    )
  );

  const failed = generationResults.filter((r) => !r.success);
  if (failed.length > 0) {
    console.error(`[Queue] ${failed.length}/4 generations failed for job ${job_id}:`, failed[0].error);
    await writeJobStatus(job_id, { status: 'failed', error: 'AI generation gagal. Coba lagi.' }, env);
    message.retry();
    return;
  }

  // ── 5. Fetch image bytes → upload to RESULT_BUCKET ─────────────────────────
  const cdnUrls = [];

  for (let i = 0; i < generationResults.length; i++) {
    const falUrl = generationResults[i].image_url || generationResults[i].images?.[0];
    const r2Key  = `images/${job_id}_${i + 1}.png`;

    let imageBuffer;
    try {
      const res = await fetch(falUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      imageBuffer = await res.arrayBuffer();
    } catch (err) {
      console.error(`[Queue] Fetch image[${i + 1}] failed for job ${job_id}:`, err.message);
      await writeJobStatus(job_id, { status: 'failed', error: 'Gagal mengunduh gambar dari AI.' }, env);
      message.retry();
      return;
    }

    try {
      await env.RESULT_BUCKET.put(r2Key, imageBuffer, {
        httpMetadata: { contentType: 'image/png' },
      });
    } catch (err) {
      console.error(`[Queue] R2 upload[${i + 1}] failed for job ${job_id}:`, err.message);
      await writeJobStatus(job_id, { status: 'failed', error: 'Gagal menyimpan gambar.' }, env);
      message.retry();
      return;
    }

    cdnUrls.push(`${CDN_BASE}/${r2Key}`);
  }

  // ── 6. Write JOBS_KV — frontend polls this via GET /status ─────────────────
  await writeJobStatus(job_id, { status: 'done', images: cdnUrls }, env);

  // ── 7. Store full metadata in RESULT_BUCKET for /result/:job_id ────────────
  const generationTime = Date.now() - startTime;
  const metadata = {
    success:         true,
    job_id,
    images:          cdnUrls,
    prompt:          basePrompt,
    generation_time: `${generationTime}ms`,
    completed_at:    Math.floor(Date.now() / 1000),
  };

  try {
    await env.RESULT_BUCKET.put(
      `results/${job_id}.json`,
      JSON.stringify(metadata),
      { httpMetadata: { contentType: 'application/json' } }
    );
  } catch (err) {
    console.warn(`[Queue] Metadata write failed for job ${job_id}:`, err.message);
  }

  console.log(`[Queue] Job ${job_id} done — 4 images in ${generationTime}ms`);
  cdnUrls.forEach((url) => console.log(`  → ${url}`));

  // ── 8. Analytics & cost tracking ───────────────────────────────────────────
  await recordGeneration(env, input.user_id);
  await recordGenerationCost(env);

  // ── 9. Save to generation history ──────────────────────────────────────────
  const shareUrl = `https://potretai.studiocreative.id/share/${job_id}`;
  await saveGenerationHistory(input.user_id, cdnUrls[0], shareUrl, basePrompt, env);

  message.ack();
}

// ─────────────────────────────────────────────────────────────────────────────
// handleLegacyJob — processes category='legacy' jobs from legacyGenerate()
//
// Submits to fal.ai ASYNC queue (queue.fal.run) — returns in < 1s.
// Stores fal_request_id in JOBS_KV; /status endpoint polls fal.ai for result.
// This avoids the 30s wall-clock timeout that would kill a synchronous call.
//
// Generation speed: 20 inference steps → ~15–25s per image on fal.ai.
// ─────────────────────────────────────────────────────────────────────────────
async function handleLegacyJob(message, env, job_id, input) {
  const { prompt, face_image_url, image_size, id_weight, fal_key } = input;

  console.log(`[Queue] Legacy job ${job_id} — submitting to fal.ai async queue`);

  const finalPrompt = prompt;

  const FAL_QUEUE = 'https://queue.fal.run/fal-ai/flux-pulid';

  let queueRes;
  try {
    queueRes = await fetch(FAL_QUEUE, {
      method:  'POST',
      headers: {
        'Authorization': `Key ${fal_key}`,
        'Content-Type':  'application/json',
        'User-Agent':    'PotretAI-Worker/3.4',
      },
      body: JSON.stringify({
        prompt:               finalPrompt,
        reference_image_url:  face_image_url,   // pria face — flux-pulid only accepts 1 reference
        image_size:           image_size || { width: 1024, height: 1280 },
        num_images:           1,
        num_inference_steps:  20,
        guidance_scale:       4.5,
        id_weight:            id_weight ?? 1,
      }),
    });
  } catch (err) {
    console.error(`[Queue] Legacy fal.ai queue submit failed for job ${job_id}:`, err.message);
    await writeJobStatus(job_id, { status: 'failed', error: 'Gagal terhubung ke AI server.' }, env);
    message.retry();
    return;
  }

  if (!queueRes.ok) {
    const errText = await queueRes.text().catch(() => '');
    console.error(`[Queue] fal.ai queue error ${queueRes.status} for job ${job_id}:`, errText.slice(0, 200));
    const userMsg = queueRes.status === 401 ? 'API key tidak valid.' :
                    queueRes.status === 402 ? 'Kredit AI habis.' :
                    queueRes.status === 429 ? 'Terlalu banyak request. Coba lagi.' :
                    `AI error (${queueRes.status})`;
    await writeJobStatus(job_id, { status: 'failed', error: userMsg }, env);
    // Retry on 5xx (transient), drop on 4xx (permanent)
    if (queueRes.status >= 500) { message.retry(); } else { message.ack(); }
    return;
  }

  const queueData = await queueRes.json().catch(() => ({}));
  const fal_request_id = queueData?.request_id;

  if (!fal_request_id) {
    console.error(`[Queue] No request_id from fal.ai for job ${job_id}:`, JSON.stringify(queueData).slice(0, 200));
    await writeJobStatus(job_id, { status: 'failed', error: 'AI tidak memberikan job ID.' }, env);
    message.retry();
    return;
  }

  // Store fal_request_id in JOBS_KV for /status polling.
  // fal_key is NOT stored — handleStatus reads env.FAL_KEY from Worker secrets.
  await writeJobStatus(job_id, { status: 'processing', fal_request_id }, env);

  console.log(`[Queue] Legacy job ${job_id} submitted to fal.ai — fal_request_id=${fal_request_id}`);
  message.ack();  // Queue consumer done immediately — fal.ai runs async
}

// ─────────────────────────────────────────────────────────────────────────────
// Resolve the primary face URL from input based on category
// ─────────────────────────────────────────────────────────────────────────────
function resolveFaceUrl(input, category) {
  if (category === 'studio') {
    const mode = input.studio_mode || 'solo_wanita';
    if (mode === 'solo_wanita') return input.face_image_url_wanita || input.face_image_url || null;
    if (mode === 'solo_pria')   return input.face_image_url_pria   || input.face_image_url || null;
    return input.face_image_url_pria || input.face_image_url_wanita || input.face_image_url || null;
  }
  return input.face_image_url_wanita || input.face_image_url_pria || input.face_image_url || null;
}
