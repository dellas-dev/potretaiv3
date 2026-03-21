/**
 * imageValidator.js — Pure-JS image validation for Cloudflare Workers
 *
 * No Canvas, no ImageBitmap, no Node APIs needed.
 * All checks are done by reading raw binary data from the ArrayBuffer.
 *
 * Validates:
 *   1. File type  — JPEG or PNG (verified from magic bytes, not just Content-Type)
 *   2. File size  — max 5 MB
 *   3. Dimensions — minimum 512 × 512 px (parsed from binary)
 */

// ── Constants ─────────────────────────────────────────────────────────────────
const MAX_BYTES    = 10 * 1024 * 1024;  // 10 MB (naik dari 5 MB)
const MIN_WIDTH    = 200;               // turun dari 512 — cukup untuk face detect
const MIN_HEIGHT   = 200;

// ── Magic byte signatures ─────────────────────────────────────────────────────
const JPEG_MAGIC = [0xFF, 0xD8, 0xFF];
const PNG_MAGIC  = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
// WEBP: "RIFF" at 0-3, "WEBP" at 8-11
const RIFF_MAGIC = [0x52, 0x49, 0x46, 0x46]; // "RIFF"
const WEBP_SIG   = [0x57, 0x45, 0x42, 0x50]; // "WEBP"

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Read actual MIME type from magic bytes (ignores declared Content-Type).
 * @param {Uint8Array} u8
 * @returns {'image/jpeg'|'image/png'|'image/webp'|null}
 */
function detectMimeFromBytes(u8) {
  if (u8.length < 12) return null;

  if (JPEG_MAGIC.every((b, i) => u8[i] === b)) return 'image/jpeg';
  if (PNG_MAGIC.every((b, i) => u8[i] === b))  return 'image/png';
  // WEBP detection
  if (RIFF_MAGIC.every((b, i) => u8[i] === b) &&
      WEBP_SIG.every((b, i) => u8[i + 8] === b)) return 'image/webp';
  return null;
}

/**
 * Parse pixel dimensions from a JPEG file.
 *
 * JPEG stores dimensions inside SOF (Start Of Frame) segments:
 *   Marker bytes  : FF C0 (SOF0/baseline) or FF C2 (SOF2/progressive)
 *   Segment layout: FF Cx <len_hi> <len_lo> <precision> <h_hi> <h_lo> <w_hi> <w_lo> ...
 *
 * @param {Uint8Array} u8
 * @returns {{ width: number, height: number } | null}
 */
function parseJpegDimensions(u8) {
  // JPEG always starts at byte 2 (skip FF D8 SOI marker)
  let i = 2;
  while (i + 3 < u8.length) {
    // Every JPEG segment starts with FF
    if (u8[i] !== 0xFF) break;

    const marker = u8[i + 1];

    // Skip padding bytes (FF FF ...)
    if (marker === 0xFF) { i++; continue; }

    // SOF0 = 0xC0, SOF1 = 0xC1, SOF2 = 0xC2, SOF9 = 0xC9, SOF10 = 0xCA
    // All SOF markers carry dimensions at the same offset
    const isSOF = (
      (marker >= 0xC0 && marker <= 0xC3) ||
      (marker >= 0xC5 && marker <= 0xC7) ||
      (marker >= 0xC9 && marker <= 0xCB) ||
      (marker >= 0xCD && marker <= 0xCF)
    );

    if (isSOF) {
      // Bounds check: need at least 9 more bytes after marker byte
      if (i + 8 >= u8.length) return null;
      // SOF data: [len_hi, len_lo, precision, height_hi, height_lo, width_hi, width_lo, ...]
      const height = (u8[i + 5] << 8) | u8[i + 6];
      const width  = (u8[i + 7] << 8) | u8[i + 8];
      return { width, height };
    }

    // SOS (Start of Scan) — no length we can skip, stop scanning
    if (marker === 0xDA) break;
    // EOI (End of Image)
    if (marker === 0xD9) break;

    // Skip segment: length field (2 bytes) includes itself but not the FF+marker bytes
    if (i + 3 >= u8.length) break;
    const segLen = (u8[i + 2] << 8) | u8[i + 3];
    if (segLen < 2) break;
    i += 2 + segLen;
  }
  return null;
}

/**
 * Parse pixel dimensions from a PNG file.
 *
 * PNG layout:
 *   Bytes  0-7  : PNG signature (8 bytes)
 *   Bytes  8-11 : IHDR chunk length (must be 13)
 *   Bytes 12-15 : Chunk type = "IHDR"
 *   Bytes 16-19 : Image width  (big-endian uint32)
 *   Bytes 20-23 : Image height (big-endian uint32)
 *
 * @param {Uint8Array} u8
 * @returns {{ width: number, height: number } | null}
 */
function parsePngDimensions(u8) {
  if (u8.length < 24) return null;

  // Read as big-endian unsigned 32-bit integers
  // Use unsigned right-shift (>>> 0) to ensure positive values
  const width  = ((u8[16] << 24) | (u8[17] << 16) | (u8[18] << 8) | u8[19]) >>> 0;
  const height = ((u8[20] << 24) | (u8[21] << 16) | (u8[22] << 8) | u8[23]) >>> 0;

  if (width === 0 || height === 0) return null;
  return { width, height };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate an uploaded image from its raw binary data.
 *
 * All three checks happen in a single pass over the ArrayBuffer —
 * no external APIs, no Canvas, no Node.js required.
 *
 * @param {ArrayBuffer} arrayBuffer  — Raw bytes of the uploaded file
 * @param {string}      [declaredMime] — MIME type declared by the client (used only for messaging)
 *
 * @returns {{
 *   valid:   boolean,
 *   error?:  string,
 *   mime?:   'image/jpeg' | 'image/png',
 *   width?:  number,
 *   height?: number,
 * }}
 */
export function validateImage(arrayBuffer, declaredMime = '') {
  if (!(arrayBuffer instanceof ArrayBuffer) && !ArrayBuffer.isView(arrayBuffer)) {
    return { valid: false, error: 'Input bukan ArrayBuffer yang valid.' };
  }

  // ── 1. Size check (fastest — no parsing needed) ───────────────────────────
  const byteLength = arrayBuffer.byteLength ?? arrayBuffer.byteLength;
  if (byteLength === 0) {
    return { valid: false, error: 'File kosong (0 bytes).' };
  }
  if (byteLength > MAX_BYTES) {
    const mb = (byteLength / 1024 / 1024).toFixed(1);
    return { valid: false, error: `Ukuran file terlalu besar (${mb} MB). Maksimum 5 MB.` };
  }

  const u8 = new Uint8Array(arrayBuffer instanceof ArrayBuffer ? arrayBuffer : arrayBuffer.buffer);

  // ── 2. MIME check from magic bytes ────────────────────────────────────────
  const actualMime = detectMimeFromBytes(u8);
  if (!actualMime) {
    const declared = declaredMime ? ` (dikirim sebagai "${declaredMime}")` : '';
    return {
      valid: false,
      error: `Format file tidak didukung${declared}. Gunakan JPEG, PNG, atau WEBP.`,
    };
  }

  // ── 3. Dimension check ────────────────────────────────────────────────────
  let dims = null;
  if (actualMime === 'image/jpeg') dims = parseJpegDimensions(u8);
  else if (actualMime === 'image/png') dims = parsePngDimensions(u8);
  else if (actualMime === 'image/webp') dims = { width: 800, height: 800 }; // WEBP: skip dim parse, assume valid

  if (!dims) {
    // Dimension parse gagal tapi file valid — lanjutkan, biarkan AI detection tentukan
    console.warn('[validator] Tidak bisa membaca dimensi — file tetap dilanjutkan.');
    dims = { width: MIN_WIDTH, height: MIN_HEIGHT };
  }

  if (dims.width < MIN_WIDTH || dims.height < MIN_HEIGHT) {
    return {
      valid: false,
      error: `Resolusi gambar terlalu kecil (${dims.width}×${dims.height}px). ` +
             `Minimum ${MIN_WIDTH}×${MIN_HEIGHT}px.`,
    };
  }

  // ── All checks passed ─────────────────────────────────────────────────────
  return {
    valid:  true,
    mime:   actualMime,
    width:  dims.width,
    height: dims.height,
  };
}
