/**
 * referral.js — Affiliate / Referral system
 *
 * KV: AFFILIATE_DATA
 *
 * Key schema:
 *   ref:{user_id}       — referrer stats { referrer, commission, total_sales }
 *   user_ref:{user_id}  — referral code used at registration { ref_code, registered_at }
 *
 * Flow:
 *   1. User A registers  → createReferral(user_id, env)
 *                          generates shareable link: ?ref=user_id
 *
 *   2. User B registers with ?ref=user_A
 *                        → trackReferral(user_B_id, 'user_A', env)
 *                          stores user_ref:user_B = { ref_code: 'user_A' }
 *
 *   3. User B buys plan  → addCommission(user_B_id, amount, env)
 *                          looks up user_ref:user_B → finds user_A
 *                          increments ref:user_A.commission + total_sales
 */

// Commission rate — 20% of the paid amount
const COMMISSION_RATE = 0.20;

// ─────────────────────────────────────────────────────────────────────────────
// createReferral
// Initialises referral record for a user. Call at registration.
// Returns the referral code (same as user_id for simplicity).
// ─────────────────────────────────────────────────────────────────────────────

export async function createReferral(user_id, env) {
  if (!env?.AFFILIATE_DATA) return user_id;

  const code = user_id;

  try {
    // Only create if not already existing
    const existing = await env.AFFILIATE_DATA.get(`ref:${code}`);
    if (!existing) {
      await env.AFFILIATE_DATA.put(
        `ref:${code}`,
        JSON.stringify({ referrer: user_id, commission: 0, total_sales: 0 })
      );
    }
  } catch (err) {
    console.warn('[referral] createReferral error:', err.message);
  }

  return code;
}

// ─────────────────────────────────────────────────────────────────────────────
// trackReferral
// Links a new user to the referral code they used at registration.
// Call when a new user signs up with ?ref=<code> in the URL.
// ─────────────────────────────────────────────────────────────────────────────

export async function trackReferral(new_user_id, ref_code, env) {
  if (!env?.AFFILIATE_DATA || !new_user_id || !ref_code) return;

  // Verify the referral code actually exists
  try {
    const ref = await env.AFFILIATE_DATA.get(`ref:${ref_code}`);
    if (!ref) {
      console.warn(`[referral] trackReferral — ref code "${ref_code}" not found.`);
      return;
    }

    // Prevent self-referral
    if (ref_code === new_user_id) {
      console.warn('[referral] trackReferral — self-referral rejected.');
      return;
    }

    await env.AFFILIATE_DATA.put(
      `user_ref:${new_user_id}`,
      JSON.stringify({ ref_code, registered_at: Math.floor(Date.now() / 1000) })
    );

    console.log(`[referral] User ${new_user_id} tracked under ref: ${ref_code}`);
  } catch (err) {
    console.warn('[referral] trackReferral error:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// addCommission
// Called after a payment is approved. Finds the referrer of the paying user
// and adds commission (COMMISSION_RATE × amount) to their balance.
// ─────────────────────────────────────────────────────────────────────────────

export async function addCommission(user_id, amount, env) {
  if (!env?.AFFILIATE_DATA || !user_id || !amount) return;

  try {
    // Look up which referral code this user signed up with
    const userRefRaw = await env.AFFILIATE_DATA.get(`user_ref:${user_id}`);
    if (!userRefRaw) return;   // user has no referrer

    const { ref_code } = JSON.parse(userRefRaw);

    // Load referrer's stats
    const refRaw = await env.AFFILIATE_DATA.get(`ref:${ref_code}`);
    if (!refRaw) return;

    const data = JSON.parse(refRaw);
    const commission = Math.round(amount * COMMISSION_RATE);

    data.total_sales += 1;
    data.commission  += commission;

    await env.AFFILIATE_DATA.put(`ref:${ref_code}`, JSON.stringify(data));

    console.log(`[referral] Commission +${commission} added to ${ref_code} (total: ${data.commission})`);
  } catch (err) {
    console.warn('[referral] addCommission error:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getAffiliateData
// Returns referral stats for a user. Used by the admin dashboard.
// ─────────────────────────────────────────────────────────────────────────────

export async function getAffiliateData(user_id, env) {
  if (!env?.AFFILIATE_DATA) return null;

  try {
    const raw = await env.AFFILIATE_DATA.get(`ref:${user_id}`);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('[referral] getAffiliateData error:', err.message);
    return null;
  }
}
