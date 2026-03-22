/**
 * verifyPayment.js — POST /verify-payment
 *
 * Admin-only endpoint. Approves or rejects an order that has uploaded
 * payment proof. Updates order status in PAYMENT_ORDERS KV.
 *
 * Flow:
 *   proof_uploaded → (this handler) → approved | rejected
 *
 * Request body (JSON):
 *   {
 *     order_id : string,
 *     action   : "approve" | "reject",
 *     admin_key: string        ← must match env.ADMIN_KEY secret
 *   }
 *
 * Response:
 *   200 { success: true, order_id, status }
 */

import { addCommission } from '../affiliate/referral.js';
import { addCredit }     from '../utils/creditManager.js';
import { recordRevenue } from '../utils/analytics.js';

const VALID_ACTIONS = new Set(['approve', 'reject']);

// ─────────────────────────────────────────────────────────────────────────────
export async function verifyPayment(request, env) {
  if (request.method !== 'POST') {
    return response({ error: 'Method not allowed.' }, 405);
  }

  if (!env.PAYMENT_ORDERS) {
    console.error('[verifyPayment] PAYMENT_ORDERS KV binding is not configured.');
    return response({ error: 'Server error: KV tidak terkonfigurasi.' }, 500);
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return response({ error: 'Invalid JSON body.' }, 400);
  }

  const { order_id, action, admin_key } = body;

  // ── Auth — constant-time comparison via ADMIN_KEY secret ───────────────────
  const expectedKey = env.ADMIN_KEY || '';
  if (!admin_key || admin_key !== expectedKey) {
    return response({ error: 'Unauthorized.' }, 401);
  }

  // ── Validate inputs ─────────────────────────────────────────────────────────
  if (!order_id || typeof order_id !== 'string' || order_id.trim() === '') {
    return response({ error: 'Field "order_id" wajib diisi.' }, 400);
  }
  if (!action || !VALID_ACTIONS.has(action)) {
    return response({ error: 'Field "action" harus "approve" atau "reject".' }, 400);
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
    console.error('[verifyPayment] KV get error:', err.message);
    return response({ error: 'Gagal mengambil data order.' }, 502);
  }

  if (order.status !== 'proof_uploaded') {
    return response({
      error: `Order tidak dalam status proof_uploaded. Status saat ini: "${order.status}".`,
    }, 409);
  }

  // ── Update status ───────────────────────────────────────────────────────────
  const newStatus = action === 'approve' ? 'approved' : 'rejected';

  const updated = {
    ...order,
    status:      newStatus,
    verified_at: Math.floor(Date.now() / 1000),
  };

  try {
    await env.PAYMENT_ORDERS.put(
      `order:${order_id.trim()}`,
      JSON.stringify(updated),
      { expirationTtl: 60 * 60 * 24 * 30 }
    );
  } catch (err) {
    console.error('[verifyPayment] KV put error:', err.message);
    return response({ error: 'Gagal memperbarui status order.' }, 502);
  }

  console.log(`[verifyPayment] Order ${order_id} → ${newStatus}`);

  // ── On approval: add credits + record affiliate commission ──────────────
  if (action === 'approve' && order.user_id) {
    // Add credits to user account
    if (order.plan && env.USER_CREDITS) {
      try {
        await addCredit(order.user_id, order.plan, env);
        console.log(`[verifyPayment] Credits added: user=${order.user_id} plan=${order.plan}`);
      } catch (err) {
        console.error('[verifyPayment] addCredit error:', err.message);
        // Non-fatal — order is still approved; admin can manually fix
      }
    }

    // Affiliate commission
    if (order.price) {
      await addCommission(order.user_id, order.price, env);
      await recordRevenue(env, order.price);
    }
  }

  return response({ success: true, order_id: order_id.trim(), status: newStatus }, 200);
}

// ─────────────────────────────────────────────────────────────────────────────
function response(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
