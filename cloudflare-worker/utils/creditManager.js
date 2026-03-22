// cloudflare-worker/utils/creditManager.js

const LEDGER_TTL = 60 * 60 * 24 * 180; // 180 days
const LOG_TTL = 60 * 60 * 24 * 90;     // 90 days

const PACKAGE_PLANS = {
  spark: {
    plan: 'spark',
    package_tier: 'spark',
    credits_remaining: 8,
    can_generate_4: false,
    watermark: false,
    features: {
      studio: { femaleOutfits: 10, maleOutfits: 10, locations: 12, femalePoses: 10, malePoses: 10, lighting: 4 },
      wisuda: { outfits: 6, backgrounds: 6, poses: 6, lighting: 3 },
    },
  },
  signature: {
    plan: 'signature',
    package_tier: 'signature',
    credits_remaining: 20,
    can_generate_4: true,
    watermark: false,
    features: {
      studio: { femaleOutfits: 20, maleOutfits: 20, locations: 28, femalePoses: 20, malePoses: 20, lighting: 6 },
      wisuda: { outfits: 10, backgrounds: 10, poses: 10, lighting: 4 },
    },
  },
  prestige: {
    plan: 'prestige',
    package_tier: 'prestige',
    credits_remaining: 40,
    can_generate_4: true,
    watermark: false,
    features: {
      studio: { femaleOutfits: 'all', maleOutfits: 'all', locations: 'all', femalePoses: 'all', malePoses: 'all', lighting: 'all' },
      wisuda: { outfits: 'all', backgrounds: 'all', poses: 'all', lighting: 'all' },
    },
  },
  trial: {
    plan: 'trial',
    package_tier: 'spark',
    credits_remaining: 1,
    can_generate_4: false,
    watermark: true,
    features: {
      studio: { femaleOutfits: 6, maleOutfits: 6, locations: 6, femalePoses: 6, malePoses: 6, lighting: 2 },
      wisuda: { outfits: 4, backgrounds: 4, poses: 4, lighting: 2 },
    },
  },
  starter: {
    plan: 'starter',
    package_tier: 'signature',
    credits_remaining: 30,
    can_generate_4: true,
    watermark: false,
    features: PACKAGE_PLANS_SHIM('signature'),
  },
  pro: {
    plan: 'pro',
    package_tier: 'prestige',
    credits_remaining: 150,
    can_generate_4: true,
    watermark: false,
    features: PACKAGE_PLANS_SHIM('prestige'),
  },
};

function PACKAGE_PLANS_SHIM(tier) {
  return tier === 'prestige'
    ? {
        studio: { femaleOutfits: 'all', maleOutfits: 'all', locations: 'all', femalePoses: 'all', malePoses: 'all', lighting: 'all' },
        wisuda: { outfits: 'all', backgrounds: 'all', poses: 'all', lighting: 'all' },
      }
    : {
        studio: { femaleOutfits: 20, maleOutfits: 20, locations: 28, femalePoses: 20, malePoses: 20, lighting: 6 },
        wisuda: { outfits: 10, backgrounds: 10, poses: 10, lighting: 4 },
      };
}

const PLAN_ALIASES = {
  studio_spark: 'spark',
  wisuda_spark: 'spark',
  spark: 'spark',
  trial: 'trial',
  starter: 'starter',
  studio_sign: 'signature',
  wisuda_sign: 'signature',
  signature: 'signature',
  studio_pres: 'prestige',
  wisuda_pres: 'prestige',
  best_deal: 'prestige',
  prestige: 'prestige',
  pro: 'pro',
};

function now() {
  return Math.floor(Date.now() / 1000);
}

function buildUserKey(loginId) {
  return `user:${loginId}`;
}

function buildLedgerKey(loginId, referenceId = crypto.randomUUID()) {
  return `ledger:${loginId}:${Date.now()}:${referenceId}`;
}

function buildGenerateLogKey(loginId, requestId = crypto.randomUUID()) {
  return `generate:${loginId || 'anonymous'}:${Date.now()}:${requestId}`;
}

function normalizePlan(plan) {
  return PLAN_ALIASES[plan] || 'spark';
}

function buildCreditRecord(plan, loginId = '') {
  const normalizedPlan = normalizePlan(plan);
  const base = PACKAGE_PLANS[normalizedPlan] || PACKAGE_PLANS.spark;
  return {
    user_id: loginId,
    plan: base.plan,
    package_tier: base.package_tier,
    credits_remaining: base.credits_remaining,
    generates_remaining: base.credits_remaining,
    can_generate_4: base.can_generate_4,
    watermark: !!base.watermark,
    features: base.features,
    updated_at: now(),
    created_at: now(),
  };
}

function normalizeCreditRecord(data, loginId = '') {
  if (!data) return null;
  if (typeof data.credits_remaining === 'number') {
    return {
      ...data,
      user_id: data.user_id || loginId,
      package_tier: data.package_tier || normalizePlan(data.plan),
      plan: data.plan || normalizePlan(data.package_tier || 'spark'),
      generates_remaining: typeof data.generates_remaining === 'number' ? data.generates_remaining : data.credits_remaining,
      can_generate_4: typeof data.can_generate_4 === 'boolean' ? data.can_generate_4 : normalizePlan(data.package_tier || data.plan) !== 'spark',
      features: data.features || buildCreditRecord(data.package_tier || data.plan || 'spark').features,
      updated_at: data.updated_at || now(),
      created_at: data.created_at || now(),
    };
  }

  // Legacy schema compatibility
  const fallback = buildCreditRecord(data.plan || 'spark', loginId);
  const remaining = typeof data.generates_remaining === 'number' ? data.generates_remaining : fallback.credits_remaining;
  return {
    ...fallback,
    user_id: loginId,
    credits_remaining: remaining,
    generates_remaining: remaining,
    categories: data.categories || [],
    watermark: typeof data.watermark === 'boolean' ? data.watermark : fallback.watermark,
    updated_at: data.updated_at || now(),
    created_at: data.created_at || now(),
  };
}

async function saveUserCredit(loginId, credit, env) {
  await env.USER_CREDITS.put(buildUserKey(loginId), JSON.stringify({
    ...credit,
    user_id: loginId,
    updated_at: now(),
  }));
}

async function writeLedger(loginId, entry, env) {
  if (!env?.USER_CREDITS || !loginId) return;
  try {
    await env.USER_CREDITS.put(buildLedgerKey(loginId, entry.reference_id), JSON.stringify({
      user_id: loginId,
      created_at: now(),
      ...entry,
    }), { expirationTtl: LEDGER_TTL });
  } catch (err) {
    console.warn('[creditManager] writeLedger failed:', err.message);
  }
}

export async function writeGenerateLog(loginId, payload, env) {
  if (!env?.USAGE_ANALYTICS) return;
  try {
    await env.USAGE_ANALYTICS.put(buildGenerateLogKey(loginId, payload.request_id), JSON.stringify({
      user_id: loginId || '',
      created_at: now(),
      ...payload,
    }), { expirationTtl: LOG_TTL });
  } catch (err) {
    console.warn('[creditManager] writeGenerateLog failed:', err.message);
  }
}

export function getCreditCostForPhotoCount(photoCount) {
  return photoCount >= 4 ? 2 : 1;
}

export async function getUserCredit(loginId, env) {
  const key = buildUserKey(loginId);
  const data = await env.USER_CREDITS.get(key);
  if (!data) return null;
  const parsed = normalizeCreditRecord(JSON.parse(data), loginId);
  return parsed;
}

export async function createTrialCredit(loginId, env) {
  const credit = buildCreditRecord('trial', loginId);
  await saveUserCredit(loginId, credit, env);
  await writeLedger(loginId, {
    type: 'package_grant',
    delta: credit.credits_remaining,
    balance_after: credit.credits_remaining,
    package_tier: credit.package_tier,
    reference_id: crypto.randomUUID(),
    source: 'trial_bootstrap',
  }, env);
  return credit;
}

export async function ensureUserCredit(loginId, env, defaultPlan = 'trial') {
  let credit = await getUserCredit(loginId, env);
  if (!credit) {
    credit = buildCreditRecord(defaultPlan, loginId);
    await saveUserCredit(loginId, credit, env);
    await writeLedger(loginId, {
      type: 'package_grant',
      delta: credit.credits_remaining,
      balance_after: credit.credits_remaining,
      package_tier: credit.package_tier,
      reference_id: crypto.randomUUID(),
      source: 'ensure_user_credit',
    }, env);
  }
  return credit;
}

export async function addCredit(loginId, plan, env) {
  const credit = buildCreditRecord(plan, loginId);
  await saveUserCredit(loginId, credit, env);
  await writeLedger(loginId, {
    type: 'package_grant',
    delta: credit.credits_remaining,
    balance_after: credit.credits_remaining,
    package_tier: credit.package_tier,
    reference_id: crypto.randomUUID(),
    source: plan,
  }, env);
  return credit;
}

export function checkCategoryAccess(credit, category) {
  if (!credit?.features) return true;
  if (category === 'studio' || category === 'studio_foto') return !!credit.features.studio;
  if (category === 'wisuda') return !!credit.features.wisuda;
  return true;
}

export async function chargeGenerate(loginId, { photoCount = 2, service = 'studio_foto', requestId = crypto.randomUUID() } = {}, env) {
  const credit = await ensureUserCredit(loginId, env);
  const cost = getCreditCostForPhotoCount(photoCount);
  if (credit.credits_remaining < cost) {
    throw new Error('Generate quota exhausted');
  }

  credit.credits_remaining -= cost;
  credit.generates_remaining = credit.credits_remaining;
  await saveUserCredit(loginId, credit, env);
  await writeLedger(loginId, {
    type: photoCount >= 4 ? 'generate_4' : 'generate_2',
    delta: -cost,
    balance_after: credit.credits_remaining,
    package_tier: credit.package_tier,
    service,
    reference_id: requestId,
    source: 'generate',
  }, env);

  return { cost, balance_after: credit.credits_remaining, package_tier: credit.package_tier, request_id: requestId };
}

export async function refundGenerate(loginId, { photoCount = 2, service = 'studio_foto', requestId = crypto.randomUUID(), reason = 'generate_failed' } = {}, env) {
  const credit = await ensureUserCredit(loginId, env);
  const refund = getCreditCostForPhotoCount(photoCount);
  credit.credits_remaining += refund;
  credit.generates_remaining = credit.credits_remaining;
  await saveUserCredit(loginId, credit, env);
  await writeLedger(loginId, {
    type: 'refund_credit',
    delta: refund,
    balance_after: credit.credits_remaining,
    package_tier: credit.package_tier,
    service,
    reference_id: requestId,
    source: reason,
  }, env);
  return credit;
}

// Legacy helper compatibility
export async function deductGenerate(loginId, env) {
  const charged = await chargeGenerate(loginId, { photoCount: 2, service: 'legacy', requestId: crypto.randomUUID() }, env);
  return getUserCredit(loginId, env) || charged;
}
