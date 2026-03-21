// cloudflare-worker/payments/verifyPayment.js

import { addCredit } from "../utils/creditManager.js";

function now() {
  return Math.floor(Date.now() / 1000);
}

export async function verifyPayment(request, env) {

  const body = await request.json();

  const { order_id, status } = body;

  const key = `order:${order_id}`;

  const orderData = await env.PAYMENT_ORDERS.get(key);

  if (!orderData) {
    return new Response(
      JSON.stringify({ error: "Order not found" }),
      { status: 404 }
    );
  }

  const order = JSON.parse(orderData);

  if (status === "approved") {

    await addCredit(order.user_id, order.plan, env);

    order.status = "approved";

  } else {

    order.status = "rejected";

  }

  order.updated_at = now();

  await env.PAYMENT_ORDERS.put(key, JSON.stringify(order));

  return new Response(
    JSON.stringify({
      success: true,
      status: order.status
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}