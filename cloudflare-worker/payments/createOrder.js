/**
 * createOrder.js — POST /create-order
 *
 * Creates a new payment order and stores it in PAYMENT_ORDERS KV.
 *
 * KV key   : order:{order_id}
 * KV value : { order_id, user_id, plan, price, status, proof_url, created_at }
 *
 * Order statuses:
 *   waiting_payment → proof_uploaded → approved | rejected
 *
 * Request body (JSON):
 *   { user_id: string, plan: "spark" | "signature" | "prestige" | "topup_mini" | "topup_plus" | "topup_pro" }
 *
 * Response:
 *   201 { success: true, order_id, plan, price, created_at }
 */

// ── Plan catalogue ────────────────────────────────────────────────────────────
const PLANS = {
  spark:      { price: 69000,  type: 'package' },
  signature:  { price: 119000, type: 'package' },
  prestige:   { price: 179000, type: 'package' },
  topup_mini: { price: 39000,  type: 'topup' },
  topup_plus: { price: 69000,  type: 'topup' },
  topup_pro:  { price: 149000, type: 'topup' },
};

// ── Order ID generator ────────────────────────────────────────────────────────
function generateOrderId() {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${digits}`;
}

// ─────────────────────────────────────────────────────────────────────────────
export async function createOrder(request, env) {
  if (request.method !== 'POST') {
    return response({ error: 'Method not allowed.' }, 405);
  }

  if (!env.PAYMENT_ORDERS) {
    console.error('[createOrder] PAYMENT_ORDERS KV binding is not configured.');
    return response({ error: 'Server error: KV tidak terkonfigurasi.' }, 500);
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return response({ error: 'Invalid JSON body.' }, 400);
  }

  const { user_id, plan } = body;

  if (!user_id || typeof user_id !== 'string' || user_id.trim() === '') {
    return response({ error: 'Field "user_id" wajib diisi.' }, 400);
  }
  if (!plan || !PLANS[plan]) {
    return response({
      error: `Field "plan" tidak valid. Pilihan: ${Object.keys(PLANS).join(', ')}.`,
    }, 400);
  }

  // ── Build order ─────────────────────────────────────────────────────────────
  const order_id   = generateOrderId();
  const created_at = Math.floor(Date.now() / 1000);

  /** @type {Order} */
  const order = {
    order_id,
    user_id:   user_id.trim(),
    plan,
    price:     PLANS[plan].price,
    order_type: PLANS[plan].type,
    status:    'waiting_payment',
    proof_url: null,
    created_at,
  };

  // ── Persist to KV ───────────────────────────────────────────────────────────
  try {
    await env.PAYMENT_ORDERS.put(
      `order:${order_id}`,
      JSON.stringify(order),
      { expirationTtl: 60 * 60 * 24 * 30 }  // 30 days
    );
  } catch (err) {
    console.error('[createOrder] KV put error:', err.message);
    return response({ error: 'Gagal menyimpan order. Coba lagi.' }, 502);
  }

  console.log(`[createOrder] Created ${order_id} — user=${user_id} plan=${plan} price=${order.price}`);

  return response({
    success:    true,
    order_id,
    plan,
    price:      order.price,
    created_at,
  }, 201);
}

// ─────────────────────────────────────────────────────────────────────────────
function response(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
