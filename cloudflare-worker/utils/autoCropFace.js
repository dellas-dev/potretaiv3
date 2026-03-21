/**
 * autoCropFace.js — Face-aware crop + resize for Cloudflare Workers
 *
 * Produces a 1024 × 1024 JPEG centred on the detected face.
 *
 * ── How it works ─────────────────────────────────────────────────────────────
 *
 * PRIMARY path — Cloudflare Image Resizing (cf.image):
 *   1. Store the validated image as a temporary object in R2.
 *   2. Fetch it back with `cf: { image: { gravity: 'face', fit: 'cover', … } }`.
 *      Cloudflare's own face-detection engine centres the crop on the face,
 *      applies any orientation correction, and down/up-scales to OUTPUT_SIZE.
 *   3. Read the transformed response body as an ArrayBuffer.
 *   4. Delete the temp R2 object (fire-and-forget).
 *   5. Return the cropped bytes.
 *
 * FALLBACK path (passthrough):
 *   - Used when Image Resizing is unavailable (e.g. free-tier zone, missing
 *     R2 binding, or cf.image returns a non-OK response).
 *   - Returns the original bytes unchanged.
 *   - The upstream validate + face-detect pipeline already ensures acceptable
 *     quality (≥ 512 × 512 px, exactly 1 face), so the fallback is safe.
 *
 * ── Requirements ─────────────────────────────────────────────────────────────
 *   env.FACES_BUCKET  — R2 bucket binding
 *   env.R2_CDN_BASE   — Public base URL for the bucket (https://pub-XXX.r2.dev)
 *   Cloudflare Image Resizing enabled on the zone (CF Pro / Business / Images)
 *
 * ── Why not Canvas / pixel manipulation? ─────────────────────────────────────
 *   OffscreenCanvas, createImageBitmap, and 2D Canvas are browser APIs that do
 *   not exist in the Cloudflare Workers V8 isolate runtime.
 */

const OUTPUT_SIZE = 1024;      // output: 1024 × 1024 px
const TEMP_PREFIX = 'tmp/';    // R2 key prefix for temporary objects

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crop and resize an image so the face is centred at 1024 × 1024 px.
 *
 * @param {ArrayBuffer} imageBytes  — Validated image bytes (JPEG or PNG)
 * @param {string}      mimeType    — 'image/jpeg' | 'image/png'
 * @param {Object}      env         — CF Worker env (needs FACES_BUCKET + R2_CDN_BASE)
 * @param {Object|null} alignParams — Output of alignFace() — used for logging only
 *
 * @returns {Promise<{
 *   croppedBytes: ArrayBuffer,
 *   mime:         string,    // always 'image/jpeg' when cf.image path succeeds
 *   method:       'cf-image' | 'passthrough',
 * }>}
 */
export async function autoCropFace(imageBytes, mimeType, env, alignParams = null) {
  // ── Guard: need R2 + CDN base for the cf.image round-trip ────────────────
  if (!env?.FACES_BUCKET || !env?.R2_CDN_BASE) {
    console.warn('[autoCropFace] R2 not configured — returning original bytes (passthrough).');
    return { croppedBytes: imageBytes, mime: mimeType, method: 'passthrough' };
  }

  const tempKey = `${TEMP_PREFIX}${crypto.randomUUID()}.${mimeType === 'image/png' ? 'png' : 'jpg'}`;

  // ── 1. Write original to a temp R2 key ───────────────────────────────────
  try {
    await env.FACES_BUCKET.put(tempKey, imageBytes, {
      httpMetadata: { contentType: mimeType },
    });
  } catch (putErr) {
    console.error('[autoCropFace] Temp R2 put failed:', putErr.message);
    return { croppedBytes: imageBytes, mime: mimeType, method: 'passthrough' };
  }

  const cdnBase = env.R2_CDN_BASE.replace(/\/$/, '');
  const tempUrl = `${cdnBase}/${tempKey}`;

  if (alignParams) {
    console.log(
      `[autoCropFace] Aligner: face ${alignParams.faceWidth}×${alignParams.faceHeight}px ` +
      `centre (${alignParams.faceCenterX},${alignParams.faceCenterY}) ` +
      `crop=${alignParams.cropSize}px ` +
      `centred=${alignParams.isCentered} ` +
      `cover=${(alignParams.coverRatio * 100).toFixed(1)}%`
    );
  }

  // ── 2. Fetch with cf.image — face-aware crop + resize ────────────────────
  let croppedBytes;
  let method;

  try {
    const cfRes = await fetch(tempUrl, {
      cf: {
        image: {
          width:   OUTPUT_SIZE,
          height:  OUTPUT_SIZE,
          fit:     'cover',        // fill the square, crop what doesn't fit
          gravity: 'face',         // CF Images face-detection centres the crop
          format:  'jpeg',         // always output JPEG (best quality/size ratio)
          quality: 92,             // high quality for AI face reference
        },
      },
    });

    if (cfRes.ok) {
      croppedBytes = await cfRes.arrayBuffer();
      method       = 'cf-image';
      console.log(
        `[autoCropFace] cf.image success — ` +
        `${(croppedBytes.byteLength / 1024).toFixed(0)} KB, 1024×1024 JPEG`
      );
    } else {
      console.warn(
        `[autoCropFace] cf.image responded ${cfRes.status} — ` +
        `falling back to original bytes. ` +
        `(Is Cloudflare Image Resizing enabled for this zone?)`
      );
      croppedBytes = imageBytes;
      method       = 'passthrough';
    }
  } catch (fetchErr) {
    console.error('[autoCropFace] cf.image fetch error:', fetchErr.message);
    croppedBytes = imageBytes;
    method       = 'passthrough';
  }

  // ── 3. Delete temp R2 object (fire-and-forget, don't block response) ─────
  env.FACES_BUCKET.delete(tempKey).catch((delErr) => {
    console.warn('[autoCropFace] Failed to delete temp R2 object:', delErr.message);
  });

  return {
    croppedBytes,
    mime:   method === 'cf-image' ? 'image/jpeg' : mimeType,
    method,
  };
}
