/**
 * faceAligner.js — Face alignment parameter computation for Cloudflare Workers
 *
 * ⚠️  WHY NOT pixel-rotation?
 *     True eye-level alignment (rotating the image so both eyes are horizontal)
 *     requires an affine-transform pixel pass — which in turn requires Canvas /
 *     OffscreenCanvas / ImageBitmap. None of those APIs exist inside the
 *     Cloudflare Workers V8 isolate.
 *
 * ✅  WHAT WE DO INSTEAD:
 *     1. Use the face bounding box returned by countFaces()
 *        (@cf/facebook/detr-resnet-50 normalised coords 0-1)
 *     2. Convert to pixel coordinates using the image dimensions from validateImage()
 *     3. Compute an optimal square crop region centred on the face with padding
 *     4. Return these parameters to autoCropFace.js, which uses
 *        Cloudflare Image Resizing (cf.image gravity:'face') for the actual
 *        geometry correction and 1024×1024 output.
 *
 *     This is functionally equivalent to alignment for fal-ai/flux-pulid:
 *     the model just needs the face to be clearly visible and roughly centred —
 *     it does its own internal landmark alignment during inference.
 */

// ── Tuning constants ──────────────────────────────────────────────────────────

/**
 * How much context to include around the face.
 * 2.4 means the crop square is 2.4× the larger face dimension.
 * Increase to show more background, decrease for tighter face crop.
 */
const PADDING_FACTOR = 2.4;

/**
 * Minimum crop size in pixels, regardless of face bounding box.
 * Prevents extreme crops for very small face detections.
 */
const MIN_CROP_SIZE = 512;

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute face alignment and crop parameters from a DETR bounding box.
 *
 * @param {Object} faceBox     — DETR detection box (normalised 0–1 coords)
 * @param {number} faceBox.xmin
 * @param {number} faceBox.ymin
 * @param {number} faceBox.xmax
 * @param {number} faceBox.ymax
 * @param {number} imageWidth  — Full image width in pixels  (from validateImage)
 * @param {number} imageHeight — Full image height in pixels (from validateImage)
 *
 * @returns {{
 *   cropX:       number,   // top-left X of crop square (pixels, clamped)
 *   cropY:       number,   // top-left Y of crop square (pixels, clamped)
 *   cropSize:    number,   // side length of the square crop (pixels)
 *   faceCenterX: number,   // face centre X in the original image (pixels)
 *   faceCenterY: number,   // face centre Y in the original image (pixels)
 *   faceWidth:   number,   // face bounding-box width  (pixels)
 *   faceHeight:  number,   // face bounding-box height (pixels)
 *   isCentered:  boolean,  // true if face is roughly in the image centre
 *   coverRatio:  number,   // fraction of image area covered by the face (0-1)
 * }}
 */
export function alignFace(faceBox, imageWidth, imageHeight) {
  const { xmin = 0, ymin = 0, xmax = 1, ymax = 1 } = faceBox ?? {};

  // ── Convert normalised coords to pixel coords ─────────────────────────────
  const faceLeft   = xmin * imageWidth;
  const faceTop    = ymin * imageHeight;
  const faceRight  = xmax * imageWidth;
  const faceBottom = ymax * imageHeight;

  const faceWidth   = faceRight  - faceLeft;
  const faceHeight  = faceBottom - faceTop;
  const faceCenterX = faceLeft   + faceWidth  / 2;
  const faceCenterY = faceTop    + faceHeight / 2;

  // ── Compute square crop size ──────────────────────────────────────────────
  // Base size: larger of the two face dimensions × padding factor
  const baseCropSize = Math.max(faceWidth, faceHeight) * PADDING_FACTOR;

  // Constrain: at least MIN_CROP_SIZE, at most the smaller image side
  const maxSide = Math.min(imageWidth, imageHeight);
  const cropSize = Math.round(
    Math.max(MIN_CROP_SIZE, Math.min(baseCropSize, maxSide))
  );

  // ── Compute top-left of the square, centred on the face ──────────────────
  let cropX = Math.round(faceCenterX - cropSize / 2);
  let cropY = Math.round(faceCenterY - cropSize / 2);

  // Clamp so the square stays within image bounds
  cropX = Math.max(0, Math.min(cropX, imageWidth  - cropSize));
  cropY = Math.max(0, Math.min(cropY, imageHeight - cropSize));

  // ── Quality diagnostics ───────────────────────────────────────────────────
  // How close to the image centre is the face? (0 = perfect centre)
  const offsetRatioX = Math.abs(faceCenterX - imageWidth  / 2) / imageWidth;
  const offsetRatioY = Math.abs(faceCenterY - imageHeight / 2) / imageHeight;
  const isCentered   = offsetRatioX < 0.30 && offsetRatioY < 0.30;

  // What fraction of the total image area does the face occupy?
  const coverRatio = (faceWidth * faceHeight) / (imageWidth * imageHeight);

  return {
    cropX,
    cropY,
    cropSize,
    faceCenterX: Math.round(faceCenterX),
    faceCenterY: Math.round(faceCenterY),
    faceWidth:   Math.round(faceWidth),
    faceHeight:  Math.round(faceHeight),
    isCentered,
    coverRatio:  Math.round(coverRatio * 1000) / 1000,
    // Note: rotation angle is NOT computed here.
    // Eye-level rotation requires Canvas/pixel transforms — unavailable in Workers.
    // cf.image (autoCropFace.js) handles geometric correction via gravity:'face'.
  };
}
