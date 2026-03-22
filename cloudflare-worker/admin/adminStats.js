import { getDailyStats, getTotals } from '../utils/analytics.js';

function response(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getDailyCost(env) {
  if (!env?.USAGE_ANALYTICS) return { generations: 0 };
  const date = new Date().toISOString().split('T')[0];
  try {
    const raw = await env.USAGE_ANALYTICS.get(`cost:${date}`);
    return raw ? JSON.parse(raw) : { generations: 0 };
  } catch {
    return { generations: 0 };
  }
}

async function summarizeOrders(env) {
  if (!env?.PAYMENT_ORDERS) return { waiting_payment: 0, proof_uploaded: 0, approved: 0, rejected: 0, recent: [] };
  const listed = await env.PAYMENT_ORDERS.list({ prefix: 'order:', limit: 200 });
  const summary = { waiting_payment: 0, proof_uploaded: 0, approved: 0, rejected: 0, recent: [] };

  const items = await Promise.all((listed.keys || []).map(async ({ name }) => {
    try {
      const raw = await env.PAYMENT_ORDERS.get(name);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }));

  items.filter(Boolean).forEach((order) => {
    if (summary[order.status] !== undefined) summary[order.status] += 1;
  });

  summary.recent = items
    .filter(Boolean)
    .sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
    .slice(0, 10)
    .map((order) => ({
      order_id: order.order_id,
      user_id: order.user_id,
      plan: order.plan,
      status: order.status,
      price: order.price,
      created_at: order.created_at,
    }));

  return summary;
}

async function recentGenerateLogs(env) {
  if (!env?.USAGE_ANALYTICS) return [];
  const listed = await env.USAGE_ANALYTICS.list({ prefix: 'generate:', limit: 100 });
  const rows = await Promise.all((listed.keys || []).map(async ({ name }) => {
    try {
      const raw = await env.USAGE_ANALYTICS.get(name);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }));

  return rows
    .filter(Boolean)
    .sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
    .slice(0, 12)
    .map((row) => ({
      user_id: row.user_id,
      service: row.service,
      photo_count: row.photo_count,
      status: row.status,
      package_tier: row.package_tier,
      charged_credits: row.charged_credits,
      result_count: row.result_count || 0,
      created_at: row.created_at,
    }));
}

export async function handleAdminStats(request, env) {
  if (request.method !== 'POST') {
    return response({ error: 'Method not allowed.' }, 405);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return response({ error: 'Invalid JSON body.' }, 400);
  }

  const adminKey = body?.admin_key || '';
  if (!adminKey || adminKey !== (env.ADMIN_KEY || '')) {
    return response({ error: 'Unauthorized.' }, 401);
  }

  const today = await getDailyStats(env);
  const totals = await getTotals(env);
  const dailyCost = await getDailyCost(env);
  const orderSummary = await summarizeOrders(env);
  const recentGenerates = await recentGenerateLogs(env);

  return response({
    success: true,
    today,
    totals,
    daily_cost: dailyCost,
    orders: orderSummary,
    recent_generates: recentGenerates,
  }, 200);
}
