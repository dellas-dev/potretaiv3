/**
 * tests/payments/paymentFlow.test.js
 *
 * Tests the complete payment lifecycle:
 *   1. createOrder    — create KV entry, return order_id
 *   2. submitProof    — upload file to R2, update order status
 *   3. verifyPayment  — admin approves/rejects, adds credits + commission
 *   4. creditManager  — getUserCredit, ensureUserCredit, addCredit, deductGenerate
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { createOrder }   from '@payments/createOrder.js';
import { submitProof }   from '@payments/submitProof.js';
import { verifyPayment } from '@payments/verifyPayment.js';
import {
  getUserCredit,
  createTrialCredit,
  ensureUserCredit,
  addCredit,
  checkCategoryAccess,
  deductGenerate,
} from '@utils/creditManager.js';
import { createMockEnv } from '@helpers/mockEnv.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Make a POST /create-order request */
function makeOrderRequest(body, origin = 'https://potretai.com') {
  return new Request('https://worker.com/create-order', {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin':       origin,
    },
    body: JSON.stringify(body),
  });
}

/** Make a POST /submit-payment-proof multipart request */
function makeProofRequest(orderId, fileBytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]).buffer) {
  const fd = new FormData();
  fd.append('order_id', orderId);
  fd.append('proof', new File([fileBytes], 'proof.jpg', { type: 'image/jpeg' }));
  return new Request('https://worker.com/submit-payment-proof', {
    method: 'POST',
    headers: { Origin: 'https://potretai.com' },
    body:   fd,
  });
}

/** Make a POST /verify-payment request */
function makeVerifyRequest(body, origin = 'https://potretai.com') {
  return new Request('https://worker.com/verify-payment', {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin':       origin,
    },
    body: JSON.stringify(body),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// creditManager.js
// ─────────────────────────────────────────────────────────────────────────────
describe('creditManager', () => {
  let env;
  beforeEach(() => { env = createMockEnv(); });

  describe('getUserCredit', () => {
    it('returns null for a new user', async () => {
      const credit = await getUserCredit('new_user', env);
      expect(credit).toBeNull();
    });

    it('returns stored credit data', async () => {
      await createTrialCredit('user_a', env);
      const credit = await getUserCredit('user_a', env);
      expect(credit).not.toBeNull();
      expect(credit.plan).toBe('trial');
    });
  });

  describe('createTrialCredit', () => {
    it('creates trial plan with 1 generate', async () => {
      const credit = await createTrialCredit('trial_user', env);
      expect(credit.plan).toBe('trial');
      expect(credit.generates_remaining).toBe(1);
      expect(credit.watermark).toBe(true);
    });

    it('stores in USER_CREDITS KV', async () => {
      await createTrialCredit('trial_user2', env);
      expect(env.USER_CREDITS._has('user:trial_user2')).toBe(true);
    });

    it('only allows studio and family categories for trial', async () => {
      const credit = await createTrialCredit('trial_user3', env);
      expect(credit.categories).toContain('studio');
      expect(credit.categories).toContain('family');
      expect(credit.categories).not.toContain('prewedding');
      expect(credit.categories).not.toContain('wedding');
    });
  });

  describe('ensureUserCredit', () => {
    it('creates trial credit for brand new user', async () => {
      const credit = await ensureUserCredit('brand_new_user', env);
      expect(credit.plan).toBe('trial');
    });

    it('returns existing credit without overwriting', async () => {
      await addCredit('existing_user', 'pro', env);
      const credit = await ensureUserCredit('existing_user', env);
      expect(credit.plan).toBe('pro');
    });
  });

  describe('addCredit — starter plan', () => {
    it('adds 30 generates for starter plan', async () => {
      const credit = await addCredit('user_b', 'starter', env);
      expect(credit.plan).toBe('starter');
      expect(credit.generates_remaining).toBe(30);
      expect(credit.watermark).toBe(false);
    });

    it('starter allows studio and family only', async () => {
      const credit = await addCredit('user_b2', 'starter', env);
      expect(credit.categories).toContain('studio');
      expect(credit.categories).not.toContain('prewedding');
    });
  });

  describe('addCredit — pro plan', () => {
    it('adds 150 generates for pro plan', async () => {
      const credit = await addCredit('user_c', 'pro', env);
      expect(credit.plan).toBe('pro');
      expect(credit.generates_remaining).toBe(150);
      expect(credit.watermark).toBe(false);
    });

    it('pro allows all 5 categories', async () => {
      const credit = await addCredit('user_c2', 'pro', env);
      ['prewedding', 'wedding', 'engagement', 'studio', 'family'].forEach(cat => {
        expect(credit.categories).toContain(cat);
      });
    });
  });

  describe('addCredit — invalid plan', () => {
    it('throws for invalid plan name', async () => {
      await expect(addCredit('user_d', 'diamond', env)).rejects.toThrow();
    });
  });

  describe('checkCategoryAccess', () => {
    it('trial plan cannot access prewedding', () => {
      const credit = { plan: 'trial', categories: ['studio', 'family'] };
      expect(checkCategoryAccess(credit, 'prewedding')).toBe(false);
    });

    it('pro plan can access all categories', () => {
      const credit = { plan: 'pro', categories: ['prewedding','wedding','engagement','studio','family'] };
      ['prewedding', 'wedding', 'engagement', 'studio', 'family'].forEach(cat => {
        expect(checkCategoryAccess(credit, cat)).toBe(true);
      });
    });
  });

  describe('deductGenerate', () => {
    it('decrements generates_remaining by 1', async () => {
      await addCredit('user_e', 'starter', env);
      const after = await deductGenerate('user_e', env);
      expect(after.generates_remaining).toBe(29);
    });

    it('throws when generates_remaining is already 0', async () => {
      await createTrialCredit('trial_user_exhaust', env);
      await deductGenerate('trial_user_exhaust', env); // use the 1 trial credit
      await expect(deductGenerate('trial_user_exhaust', env)).rejects.toThrow('quota');
    });

    it('throws when user does not exist', async () => {
      await expect(deductGenerate('ghost_user', env)).rejects.toThrow();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// createOrder.js
// ─────────────────────────────────────────────────────────────────────────────
describe('createOrder', () => {
  let env;
  beforeEach(() => { env = createMockEnv(); });

  it('returns 201 + order_id for valid starter order', async () => {
    const req = makeOrderRequest({ user_id: 'user_1', plan: 'starter' });
    const res = await createOrder(req, env);
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(typeof body.order_id).toBe('string');
    expect(body.order_id).toMatch(/^ORD-/);
  });

  it('returns 201 + correct price for starter plan (97000)', async () => {
    const req = makeOrderRequest({ user_id: 'user_1', plan: 'starter' });
    const res = await createOrder(req, env);
    const body = await res.json();
    expect(body.price).toBe(97000);
  });

  it('returns 201 + correct price for pro plan (197000)', async () => {
    const req = makeOrderRequest({ user_id: 'user_1', plan: 'pro' });
    const res = await createOrder(req, env);
    const body = await res.json();
    expect(body.price).toBe(197000);
  });

  it('stores order in PAYMENT_ORDERS KV with status waiting_payment', async () => {
    const req = makeOrderRequest({ user_id: 'user_2', plan: 'starter' });
    const res = await createOrder(req, env);
    const { order_id } = await res.json();

    const raw = env.PAYMENT_ORDERS._rawGet(`order:${order_id}`);
    const stored = JSON.parse(raw);
    expect(stored.status).toBe('waiting_payment');
    expect(stored.user_id).toBe('user_2');
    expect(stored.plan).toBe('starter');
  });

  it('returns 400 for invalid plan name', async () => {
    const req = makeOrderRequest({ user_id: 'user_3', plan: 'diamond' });
    const res = await createOrder(req, env);
    expect(res.status).toBe(400);
  });

  it('returns 400 when user_id is missing', async () => {
    const req = makeOrderRequest({ plan: 'starter' });
    const res = await createOrder(req, env);
    expect(res.status).toBe(400);
  });

  it('returns 405 for GET method', async () => {
    const req = new Request('https://worker.com/create-order', { method: 'GET' });
    const res = await createOrder(req, env);
    expect(res.status).toBe(405);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// verifyPayment.js  (submitProof requires real multipart which is tricky to unit-test)
// ─────────────────────────────────────────────────────────────────────────────
describe('verifyPayment', () => {
  let env;
  let orderId;

  beforeEach(async () => {
    env = createMockEnv();
    orderId = 'ORD-TEST1';
    // Seed an order in proof_uploaded state
    await env.PAYMENT_ORDERS.put(
      `order:${orderId}`,
      JSON.stringify({
        order_id:   orderId,
        user_id:    'user_pay_1',
        plan:       'starter',
        price:      97000,
        status:     'proof_uploaded',
        created_at: Math.floor(Date.now() / 1000),
      })
    );
  });

  it('approves order and returns status=approved', async () => {
    const req = makeVerifyRequest({ order_id: orderId, action: 'approve', admin_key: 'test_admin_key_xxxxxxxxx' });
    const res = await verifyPayment(req, env);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('approved');
  });

  it('rejects order and returns status=rejected', async () => {
    const req = makeVerifyRequest({ order_id: orderId, action: 'reject', admin_key: 'test_admin_key_xxxxxxxxx' });
    const res = await verifyPayment(req, env);
    const body = await res.json();
    expect(body.status).toBe('rejected');
  });

  it('adds USER_CREDITS on approval', async () => {
    const req = makeVerifyRequest({ order_id: orderId, action: 'approve', admin_key: 'test_admin_key_xxxxxxxxx' });
    await verifyPayment(req, env);
    const credit = await getUserCredit('user_pay_1', env);
    expect(credit).not.toBeNull();
    expect(credit.plan).toBe('starter');
    expect(credit.generates_remaining).toBe(30);
  });

  it('does NOT add credits on rejection', async () => {
    const req = makeVerifyRequest({ order_id: orderId, action: 'reject', admin_key: 'test_admin_key_xxxxxxxxx' });
    await verifyPayment(req, env);
    const credit = await getUserCredit('user_pay_1', env);
    expect(credit).toBeNull();
  });

  it('returns 401 for wrong admin_key', async () => {
    const req = makeVerifyRequest({ order_id: orderId, action: 'approve', admin_key: 'WRONG_KEY' });
    const res = await verifyPayment(req, env);
    expect(res.status).toBe(401);
  });

  it('returns 404 for non-existent order', async () => {
    const req = makeVerifyRequest({ order_id: 'ORD-GHOST', action: 'approve', admin_key: 'test_admin_key_xxxxxxxxx' });
    const res = await verifyPayment(req, env);
    expect(res.status).toBe(404);
  });

  it('returns 409 if order is not in proof_uploaded status', async () => {
    // Change order to waiting_payment
    await env.PAYMENT_ORDERS.put(
      `order:${orderId}`,
      JSON.stringify({ status: 'waiting_payment', user_id: 'user_pay_1', plan: 'starter', price: 97000 })
    );
    const req = makeVerifyRequest({ order_id: orderId, action: 'approve', admin_key: 'test_admin_key_xxxxxxxxx' });
    const res = await verifyPayment(req, env);
    expect(res.status).toBe(409);
  });

  it('returns 400 for invalid action', async () => {
    const req = makeVerifyRequest({ order_id: orderId, action: 'delete', admin_key: 'test_admin_key_xxxxxxxxx' });
    const res = await verifyPayment(req, env);
    expect(res.status).toBe(400);
  });

  it('returns 405 for non-POST method', async () => {
    const req = new Request('https://worker.com/verify-payment', { method: 'GET' });
    const res = await verifyPayment(req, env);
    expect(res.status).toBe(405);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Full payment flow integration test
// ─────────────────────────────────────────────────────────────────────────────
describe('Full payment flow integration', () => {
  it('completes: createOrder → verifyPayment(approve) → user has credits', async () => {
    const env = createMockEnv();
    const userId = 'full_flow_user';

    // Step 1: Create order
    const createReq  = makeOrderRequest({ user_id: userId, plan: 'pro' });
    const createRes  = await createOrder(createReq, env);
    expect(createRes.status).toBe(201);
    const { order_id } = await createRes.json();

    // Step 2: Simulate proof_uploaded status (normally done by submitProof)
    const orderRaw = JSON.parse(env.PAYMENT_ORDERS._rawGet(`order:${order_id}`));
    orderRaw.status = 'proof_uploaded';
    await env.PAYMENT_ORDERS.put(`order:${order_id}`, JSON.stringify(orderRaw));

    // Step 3: Admin approves
    const verifyReq = makeVerifyRequest({ order_id, action: 'approve', admin_key: 'test_admin_key_xxxxxxxxx' });
    const verifyRes = await verifyPayment(verifyReq, env);
    expect(verifyRes.status).toBe(200);

    // Step 4: User now has pro credits
    const credit = await getUserCredit(userId, env);
    expect(credit.plan).toBe('pro');
    expect(credit.generates_remaining).toBe(150);
    expect(credit.watermark).toBe(false);
    expect(credit.categories).toContain('prewedding');
  });
});
