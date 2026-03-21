// cloudflare-worker/payments/createOrder.js

function now() {
  return Math.floor(Date.now() / 1000);
}

function generateOrderId() {
  return "ORD-" + crypto.randomUUID();
}

const PLAN_PRICE = {
  starter: 97000,
  pro: 297000
};

export async function createOrder(request, env) {

  const body = await request.json();
  const { login_id, plan } = body;

  if (!PLAN_PRICE[plan]) {
    return new Response(
      JSON.stringify({ error: "Invalid plan" }),
      { status: 400 }
    );
  }

  const orderId = generateOrderId();

  const order = {
    order_id: orderId,
    user_id: login_id,
    plan: plan,
    price: PLAN_PRICE[plan],
    status: "waiting_payment",
    proof_url: null,
    created_at: now()
  };

  await env.PAYMENT_ORDERS.put(
    `order:${orderId}`,
    JSON.stringify(order)
  );

  return new Response(
    JSON.stringify({
      success: true,
      order_id: orderId,
      price: order.price,
      qris_image: "/brand_asset/qris.png"
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}