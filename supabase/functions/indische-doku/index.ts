import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const dokuSandboxUrl = "https://api-sandbox.doku.com/checkout/v1/payment";
const notificationPath = "/functions/v1/indische-doku";
const jsonHeaders = { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, x-client-info, apikey, content-type" };
const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: jsonHeaders });

const base64 = (bytes: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const sha256 = async (value: string) => base64(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
const hmac = async (secret: string, value: string) => {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
};

function credentials() {
  const clientId = Deno.env.get("DOKU_CLIENT_ID");
  const sharedKey = Deno.env.get("DOKU_SHARED_KEY");
  const appUrl = Deno.env.get("INDISCHE_APP_URL")?.replace(/\/$/, "");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!clientId || !sharedKey || !appUrl || !supabaseUrl) throw new Error("DOKU sandbox is not configured.");
  return { clientId, sharedKey, appUrl, notificationUrl: Deno.env.get("DOKU_NOTIFICATION_URL") ?? `${supabaseUrl}${notificationPath}` };
}

function publicKey() {
  const keys = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (!keys) throw new Error("Supabase publishable key is unavailable.");
  const key = JSON.parse(keys).default;
  if (typeof key !== "string") throw new Error("Supabase publishable key is unavailable.");
  return key;
}

function secretKey() {
  const keys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (!keys) throw new Error("Supabase secret key is unavailable.");
  const key = JSON.parse(keys).default;
  if (typeof key !== "string") throw new Error("Supabase secret key is unavailable.");
  return key;
}

async function userFromRequest(request: Request) {
  const authorization = request.headers.get("authorization");
  const url = Deno.env.get("SUPABASE_URL");
  if (!authorization?.startsWith("Bearer ") || !url) return null;
  const client = createClient(url, publicKey(), { global: { headers: { Authorization: authorization } } });
  const { data, error } = await client.auth.getUser();
  return error ? null : data.user;
}

function signatureText(clientId: string, requestId: string, timestamp: string, requestTarget: string, digest: string) {
  return `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;
}

async function createPayment(request: Request, body: { action?: string; order_id?: string }) {
  const user = await userFromRequest(request);
  if (!user) return reply(401, { error: "Authentication is required." });
  if (body.action !== "create_payment" || typeof body.order_id !== "string") return reply(400, { error: "A Shop order is required." });

  const { clientId, sharedKey, appUrl, notificationUrl } = credentials();
  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, secretKey());
  const { data: order, error: orderError } = await admin.from("customer_orders")
    .select("id,user_id,order_number,grand_total,currency,payment_provider,payment_reference,payment_url,order_kind,customer_name_snapshot,customer_email_snapshot,customer_phone_snapshot")
    .eq("id", body.order_id).eq("user_id", user.id).eq("order_kind", "SHOP").single();
  if (orderError || !order) return reply(404, { error: "Indische Shop order not found." });
  if (order.payment_provider === "DOKU" && order.payment_url) return reply(200, { reference: order.payment_reference, payment_url: order.payment_url });
  if (!order.grand_total || order.grand_total <= 0 || order.currency !== "IDR") return reply(400, { error: "Order total is not payable." });

  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const returnUrl = `${appUrl}/checkout/doku/return?order=${encodeURIComponent(order.id)}`;
  const paymentBody = JSON.stringify({
    order: {
      amount: Number(order.grand_total), invoice_number: order.order_number, currency: "IDR",
      callback_url: returnUrl, callback_url_result: returnUrl, callback_url_cancel: `${returnUrl}&status=cancelled`,
      language: "ID", auto_redirect: true,
    },
    payment: { payment_due_date: 60 },
    customer: { name: order.customer_name_snapshot ?? "Indische Customer", email: order.customer_email_snapshot ?? user.email, phone: order.customer_phone_snapshot ?? undefined },
    override_notification_url: notificationUrl,
  });
  const digest = await sha256(paymentBody);
  const signature = `HMACSHA256=${await hmac(sharedKey, signatureText(clientId, requestId, timestamp, "/checkout/v1/payment", digest))}`;
  const response = await fetch(dokuSandboxUrl, { method: "POST", headers: { "content-type": "application/json", "client-id": clientId, "request-id": requestId, "request-timestamp": timestamp, signature }, body: paymentBody });
  const responseBody = await response.json().catch(() => null) as { payment?: { url?: string }; message?: string } | null;
  if (!response.ok || !responseBody?.payment?.url) return reply(502, { error: responseBody?.message ?? "DOKU sandbox could not create payment." });

  const { error: updateError } = await admin.from("customer_orders").update({ payment_provider: "DOKU", payment_reference: order.order_number, payment_url: responseBody.payment.url }).eq("id", order.id).eq("user_id", user.id);
  if (updateError) return reply(500, { error: "Payment was created but its order could not be updated." });
  return reply(200, { reference: order.order_number, payment_url: responseBody.payment.url });
}

async function receiveNotification(request: Request, rawBody: string) {
  const { clientId, sharedKey } = credentials();
  const requestId = request.headers.get("request-id");
  const timestamp = request.headers.get("request-timestamp");
  const signature = request.headers.get("signature");
  const incomingClientId = request.headers.get("client-id");
  if (!requestId || !timestamp || !signature || incomingClientId !== clientId) return reply(401, { error: "Invalid DOKU notification." });
  const expected = `HMACSHA256=${await hmac(sharedKey, signatureText(clientId, requestId, timestamp, notificationPath, await sha256(rawBody)))}`;
  if (signature !== expected) return reply(401, { error: "Invalid DOKU signature." });
  const payload = JSON.parse(rawBody) as { order?: { invoice_number?: string }; transaction?: { status?: string } };
  const invoice = payload.order?.invoice_number;
  if (!invoice) return reply(400, { error: "DOKU notification has no invoice number." });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, secretKey());
  const { data: order } = await admin.from("customer_orders").select("id").eq("order_number", invoice).eq("order_kind", "SHOP").eq("payment_provider", "DOKU").maybeSingle();
  if (!order) return reply(200, { received: true });
  const { data, error } = await admin.rpc("process_doku_payment_event", { target_order_id: order.id, target_event_id: requestId, provider_status: payload.transaction?.status ?? "", event_payload: payload });
  if (error) return reply(500, { error: "Notification could not be processed." });
  return reply(200, { received: true, result: data });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: jsonHeaders });
  if (request.method !== "POST") return reply(405, { error: "Method not allowed." });
  const rawBody = await request.text();
  try {
    const parsed = JSON.parse(rawBody) as { action?: string };
    return parsed.action === "create_payment" ? await createPayment(request, parsed) : await receiveNotification(request, rawBody);
  } catch (error) {
    return reply(400, { error: error instanceof Error ? error.message : "DOKU request could not be processed." });
  }
});
