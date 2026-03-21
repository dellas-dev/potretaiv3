// cloudflare-worker/payments/submitProof.js

function now() {
  return Math.floor(Date.now() / 1000);
}

export async function submitProof(request, env) {

  const formData = await request.formData();

  const orderId = formData.get("order_id");
  const file = formData.get("file");

  if (!orderId || !file) {
    return new Response(
      JSON.stringify({ error: "Missing data" }),
      { status: 400 }
    );
  }

  const orderKey = `order:${orderId}`;

  const orderData = await env.PAYMENT_ORDERS.get(orderKey);

  if (!orderData) {
    return new Response(
      JSON.stringify({ error: "Order not found" }),
      { status: 404 }
    );
  }

  const order = JSON.parse(orderData);

  const fileKey = `proofs/${orderId}.jpg`;

  await env.PAYMENT_PROOFS.put(fileKey, file.stream());

  order.proof_url = fileKey;
  order.status = "proof_uploaded";
  order.updated_at = now();

  await env.PAYMENT_ORDERS.put(orderKey, JSON.stringify(order));

  return new Response(
    JSON.stringify({
      success: true,
      message: "Proof uploaded"
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}