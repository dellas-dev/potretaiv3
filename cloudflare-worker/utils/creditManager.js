// cloudflare-worker/utils/creditManager.js

const TRIAL_PLAN = {
  plan: "trial",
  generates_remaining: 1,
  categories: ["studio", "family"],
  watermark: true
};

const STARTER_PLAN = {
  plan: "starter",
  generates_remaining: 30,
  categories: ["studio", "family"],
  watermark: false
};

const PRO_PLAN = {
  plan: "pro",
  generates_remaining: 150,
  categories: [
    "prewedding",
    "wedding",
    "engagement",
    "studio",
    "family"
  ],
  watermark: false
};

function now() {
  return Math.floor(Date.now() / 1000);
}

function buildKey(loginId) {
  return `user:${loginId}`;
}

/**
 * Get user credit from KV
 */
export async function getUserCredit(loginId, env) {
  const key = buildKey(loginId);

  const data = await env.USER_CREDITS.get(key);

  if (!data) return null;

  return JSON.parse(data);
}

/**
 * Create trial credit for new user
 */
export async function createTrialCredit(loginId, env) {
  const key = buildKey(loginId);

  const credit = {
    ...TRIAL_PLAN,
    updated_at: now()
  };

  await env.USER_CREDITS.put(key, JSON.stringify(credit));

  return credit;
}

/**
 * Ensure user has credit record
 * If not → create trial
 */
export async function ensureUserCredit(loginId, env) {
  let credit = await getUserCredit(loginId, env);

  if (!credit) {
    credit = await createTrialCredit(loginId, env);
  }

  return credit;
}

/**
 * Add credit after payment approved
 */
export async function addCredit(loginId, plan, env) {
  const key = buildKey(loginId);

  let newPlan;

  if (plan === "starter") {
    newPlan = STARTER_PLAN;
  } else if (plan === "pro") {
    newPlan = PRO_PLAN;
  } else {
    throw new Error("Invalid plan");
  }

  const credit = {
    ...newPlan,
    updated_at: now()
  };

  await env.USER_CREDITS.put(key, JSON.stringify(credit));

  return credit;
}

/**
 * Check if category allowed
 */
export function checkCategoryAccess(credit, category) {
  if (!credit.categories.includes(category)) {
    return false;
  }

  return true;
}

/**
 * Deduct 1 generate
 */
export async function deductGenerate(loginId, env) {
  const key = buildKey(loginId);

  const data = await env.USER_CREDITS.get(key);

  if (!data) {
    throw new Error("User credit not found");
  }

  const credit = JSON.parse(data);

  if (credit.generates_remaining <= 0) {
    throw new Error("Generate quota exhausted");
  }

  credit.generates_remaining -= 1;
  credit.updated_at = now();

  await env.USER_CREDITS.put(key, JSON.stringify(credit));

  return credit;
}