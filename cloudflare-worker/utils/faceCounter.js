/**
 * faceCounter.js — Face detection for Cloudflare Workers
 *
 * ⚠️  WHY NOT @vladmandic/face-api?
 *     face-api.js requires TensorFlow.js + WebGL + Canvas — none of which
 *     exist in the Cloudflare Workers V8 isolate runtime.
 *     ImageBitmap / createImageBitmap are also browser-only APIs.
 *
 * ✅  SOLUTION — Cloudflare Workers AI (native, zero cold-start overhead):
 *     Model: @cf/facebook/detr-resnet-50
 *       - DE⟨TR⟩: Detection Transformer trained on COCO dataset
 *       - Returns bounding boxes with class labels + confidence scores
 *       - "person" label detections = face presence proxy
 *       - Runs in the same Worker request, no external network call
 *
 *     Requires [[ai]] binding in wrangler.toml:
 *       [ai]
 *       binding = "AI"
 *
 * CONFIDENCE THRESHOLD
 *   Only detections with score >= FACE_CONFIDENCE_THRESHOLD are counted.
 *   Default: 0.72 (tuned for solo portrait photos — reduces false positives
 *   from background elements while capturing clear foreground subjects).
 */

const FACE_CONFIDENCE_THRESHOLD = 0.30; // turun dari 0.72 — DETR/COCO jarang detect headshot dengan score tinggi
const WORKERS_AI_MODEL           = '@cf/facebook/detr-resnet-50';

// COCO labels that indicate a human subject in the frame
// ("person" covers full-body and cropped-face shots alike)
const PERSON_LABELS = new Set(['person']);

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Count the number of human faces (persons) in an image using Workers AI.
 *
 * @param {ArrayBuffer} imageBytes — Raw image bytes (JPEG or PNG)
 * @param {Object}      env        — Cloudflare Worker env bindings (needs env.AI)
 *
 * @returns {Promise<{
 *   face_count: number,
 *   detections?: Array<{ label: string, score: number, box: object }>,
 *   error?:      string,
 * }>}
 */
export async function countFaces(imageBytes, env) {
  // ── Guard: Workers AI binding must be present ────────────────────────────
  if (!env?.AI) {
    console.warn(
      '[faceCounter] env.AI (Workers AI) binding is not configured. ' +
      'Add [ai] binding = "AI" to wrangler.toml. ' +
      'Defaulting to face_count = 1 (validation skipped).'
    );
    // Graceful degradation — do not block uploads when AI is misconfigured
    return { face_count: 1, error: 'Workers AI not configured' };
  }

  if (!imageBytes || imageBytes.byteLength === 0) {
    return { face_count: 0, error: 'Empty image bytes' };
  }

  // ── Run object detection ─────────────────────────────────────────────────
  let result;
  try {
    // Workers AI expects image bytes as a plain Uint8Array (spread into Array)
    const u8 = new Uint8Array(
      imageBytes instanceof ArrayBuffer ? imageBytes : imageBytes.buffer
    );

    result = await env.AI.run(WORKERS_AI_MODEL, {
      image: [...u8],   // Workers AI requires a plain JS Array, not Uint8Array
    });
  } catch (err) {
    console.error('[faceCounter] Workers AI run error:', err.message);
    // Fail open — do not block valid photos due to AI service errors
    return { face_count: 1, error: `AI detection failed: ${err.message}` };
  }

  // ── Parse detections ─────────────────────────────────────────────────────
  const rawDetections = result?.detections;
  if (!Array.isArray(rawDetections)) {
    console.warn('[faceCounter] Unexpected response shape — fail-open:', JSON.stringify(result).slice(0, 200));
    return { face_count: 1, error: 'Unexpected AI response format' }; // fail-open
  }

  // Filter to high-confidence person detections only
  const personDetections = rawDetections.filter((d) => {
    const label      = (d.label || '').toLowerCase();
    const confidence = d.score ?? d.confidence ?? 0;
    return PERSON_LABELS.has(label) && confidence >= FACE_CONFIDENCE_THRESHOLD;
  });

  console.log(
    `[faceCounter] Detected ${personDetections.length} person(s) ` +
    `(raw: ${rawDetections.length} total detections, ` +
    `threshold: ${FACE_CONFIDENCE_THRESHOLD})`
  );

  return {
    face_count:  personDetections.length,
    detections:  personDetections,
  };
}
