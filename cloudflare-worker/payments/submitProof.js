/**
 * submitProof.js — POST /submit-payment-proof
 *
 * Accepts a payment proof image upload from the user, stores it in
 * PAYMENT_PROOFS R2, then updates the order status in PAYMENT_ORDERS KV.
 *
 * Flow:
 *   waiting_payment → (this handler) → proof_uploaded
 *
 * Request: multipart/form-data
 *   order_id  : string
 *   proof     : image file (JPEG / PNG / WebP — max 5 MB)
 *
 * Response:
 *   200 { success: true, order_id, proof_url }
 */

const MAX_FILE_BYTES = 5 * 1024 * 1024;   // 5 MB
const ALLOWED_MIME   = new Set(['image/jpeg', 'image/png', 'image/webp']);

// ─────────────────────────────────────────────────────────────────────────────
export async function submitProof(request, env) {
  if (request.method !== 'POST') {
    return response({ error: 'Method not allowed.' }, 405);
  }

  if (!env.PAYMENT_ORDERS) {
    console.error('[submitProof] PAYMENT_ORDERS KV binding is not configured.');
    return response({ error: 'Server error: KV tidak terkonfigurasi.' }, 500);
  }
  if (!env.PAYMENT_PROOFS) {
    console.error('[submitProof] PAYMENT_PROOFS R2 binding is not configured.');
    return response({ error: 'Server error: R2 bucket tidak terkonfigurasi.' }, 500);
  }

  // ── Parse multipart ─────────────────────────────────────────────────────────
  let formData;
  try {
    formData = await request.formData();
  } catch {
    return response({ error: 'Request harus multipart/form-data.' }, 400);
  }

  const order_id = formData.get('order_id');
  const file     = formData.get('proof');

  if (!order_id || typeof order_id !== 'string' || order_id.trim() === '') {
    return response({ error: 'Field "order_id" wajib diisi.' }, 400);
  }
  if (!file || typeof file.arrayBuffer !== 'function') {
    return response({ error: 'Field "proof" tidak ditemukan atau bukan file.' }, 400);
  }

  // ── Validate file ───────────────────────────────────────────────────────────
  const mime = file.type || '';
  if (!ALLOWED_MIME.has(mime)) {
    return response({ error: 'Format file tidak didukung. Gunakan JPEG, PNG, atau WebP.' }, 422);
  }

  let fileBytes;
  try {
    fileBytes = await file.arrayBuffer();
  } catch {
    return response({ error: 'Gagal membaca file.' }, 400);
  }

  if (fileBytes.byteLength > MAX_FILE_BYTES) {
    return response({ error: 'Ukuran file terlalu besar. Maksimal 5 MB.' }, 422);
  }

  // ── Load order from KV ──────────────────────────────────────────────────────
  let order;
  try {
    const raw = await env.PAYMENT_ORDERS.get(`order:${order_id.trim()}`);
    if (!raw) {
      return response({ error: `Order "${order_id}" tidak ditemukan.` }, 404);
    }
    order = JSON.parse(raw);
  } catch (err) {
    console.error('[submitProof] KV get error:', err.message);
    return response({ error: 'Gagal mengambil data order.' }, 502);
  }

  if (order.status !== 'waiting_payment') {
    return response({
      error: `Order tidak dalam status waiting_payment. Status saat ini: "${order.status}".`,
    }, 409);
  }

  // ── Upload proof to R2 ──────────────────────────────────────────────────────
  const ext     = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
  const r2Key   = `proofs/${order_id}.${ext}`;

  try {
    await env.PAYMENT_PROOFS.put(r2Key, fileBytes, {
      httpMetadata: { contentType: mime },
    });
    console.log(`[submitProof] R2 upload: ${r2Key} (${fileBytes.byteLength} bytes)`);
  } catch (err) {
    console.error('[submitProof] R2 put error:', err.message);
    return response({ error: 'Gagal menyimpan bukti pembayaran. Coba lagi.' }, 502);
  }

  // ── Update order in KV ──────────────────────────────────────────────────────
  const proof_url = r2Key;   // internal R2 key; expose CDN URL if R2 public access is enabled

  const updated = {
    ...order,
    status:       'proof_uploaded',
    proof_url,
    submitted_at: Math.floor(Date.now() / 1000),
  };

  try {
    await env.PAYMENT_ORDERS.put(
      `order:${order_id.trim()}`,
      JSON.stringify(updated),
      { expirationTtl: 60 * 60 * 24 * 30 }
    );
  } catch (err) {
    console.error('[submitProof] KV put error:', err.message);
    return response({ error: 'Gagal memperbarui status order.' }, 502);
  }

  console.log(`[submitProof] Order ${order_id} → proof_uploaded`);

  return response({ success: true, order_id: order_id.trim(), proof_url }, 200);
}

// ─────────────────────────────────────────────────────────────────────────────
function response(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
