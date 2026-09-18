import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type Destination = {
  id: number;
  label: string;
  zip_code?: string;
};

type ShippingRate = {
  name: string;
  code: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
};

const providerBaseUrl = "https://rajaongkir.komerce.id/api/v1";
const corsHeaders = {
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-origin": "*",
  "content-type": "application/json; charset=utf-8",
};

const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: corsHeaders });

function asPositiveInteger(value: unknown, field: string, maximum: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > maximum) throw new Error(`${field} must be a whole number between 1 and ${maximum}.`);
  return parsed;
}

function asCourier(value: unknown) {
  if (typeof value !== "string" || !/^[a-z]+(?:,[a-z]+)*$/.test(value)) throw new Error("courier must contain one or more lowercase provider codes.");
  return value;
}

async function providerFetch(path: string, init: RequestInit, apiKey: string) {
  const response = await fetch(`${providerBaseUrl}${path}`, {
    ...init,
    headers: { key: apiKey, ...(init.headers ?? {}) },
  });
  const payload = await response.json().catch(() => null) as { meta?: { message?: string }; data?: unknown } | null;
  if (!response.ok) throw new Error(payload?.meta?.message ?? "RajaOngkir request failed.");
  return payload?.data;
}

async function authenticateRequest(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;

  const url = Deno.env.get("SUPABASE_URL");
  const publishableKeys = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (!url || !publishableKeys) return null;

  const key = JSON.parse(publishableKeys).default;
  if (typeof key !== "string") return null;
  const client = createClient(url, key, { global: { headers: { Authorization: authorization } } });
  const { data, error } = await client.auth.getUser();
  return error ? null : data.user;
}

function serviceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const keys = Deno.env.get("SUPABASE_SECRET_KEYS");
  const key = keys ? JSON.parse(keys).default : null;
  if (!url || typeof key !== "string") throw new Error("SHIPPING_PROVIDER_ERROR");
  return createClient(url, key);
}

async function fingerprint(cart: Array<{ variant_id: string; quantity: number }>) {
  const canonical = [...cart].sort((a, b) => a.variant_id.localeCompare(b.variant_id)).map(({ variant_id, quantity }) => `${variant_id}:${quantity}`).join("|");
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return reply(405, { error: "Method not allowed." });

  const user = await authenticateRequest(request);
  if (!user) return reply(401, { error: "UNAUTHENTICATED" });

  const apiKey = Deno.env.get("RAJAONGKIR_SHIPPING_COST_API_KEY");
  const originId = Deno.env.get("INDISCHE_SHIPPING_ORIGIN_ID");
  if (!apiKey || !originId) return reply(503, { error: "Shipping service is not configured." });

  try {
    const body = await request.json() as Record<string, unknown>;
    if (body.action === "create_quote") {
      if (!Array.isArray(body.cart_items) || !body.cart_items.length) return reply(400, { error: "PRODUCT_NOT_FOUND" });
      const cart = body.cart_items.map((item) => ({ variant_id: typeof item?.variant_id === "string" ? item.variant_id : "", quantity: Number(item?.quantity) }));
      if (cart.some((item) => !item.variant_id || !Number.isInteger(item.quantity) || item.quantity < 1)) return reply(400, { error: "INVALID_QUANTITY" });
      if (new Set(cart.map((item) => item.variant_id)).size !== cart.length) return reply(400, { error: "INVALID_QUANTITY" });
      const destinationId = asPositiveInteger(body.destination_id, "destination_id", Number.MAX_SAFE_INTEGER);
      const courier = asCourier(body.courier_code);
      const service = typeof body.service_code === "string" && /^[A-Za-z0-9<>-]+$/.test(body.service_code) ? body.service_code : "";
      if (!service) return reply(400, { error: "SHIPPING_SERVICE_NOT_FOUND" });
      const admin = serviceClient();
      const { data: products, error: productsError } = await admin.from("product_variants").select("id,is_active,stock_quantity,weight_grams,products!inner(status,sale_type,preorder_closes_at)").in("id", cart.map((item) => item.variant_id));
      if (productsError) throw new Error("SHIPPING_PROVIDER_ERROR");
      if (!products || products.length !== cart.length) return reply(400, { error: "PRODUCT_NOT_FOUND" });
      let totalWeight = 0;
      for (const item of cart) {
        const product = products.find((row) => row.id === item.variant_id)!;
        const parent = product.products as unknown as { status: string; sale_type: string; preorder_closes_at: string | null };
        if (!product.is_active || parent.status !== "ACTIVE") return reply(400, { error: "PRODUCT_UNAVAILABLE" });
        if (!product.weight_grams || product.weight_grams <= 0) return reply(400, { error: "PRODUCT_WEIGHT_MISSING" });
        if (parent.sale_type === "READY_STOCK" && (product.stock_quantity ?? 0) < item.quantity) return reply(400, { error: "INSUFFICIENT_STOCK" });
        if (parent.sale_type === "PREORDER" && parent.preorder_closes_at && new Date(parent.preorder_closes_at) <= new Date()) return reply(400, { error: "PREORDER_CLOSED" });
        totalWeight += product.weight_grams * item.quantity;
      }
      const quoteData = await providerFetch("/calculate/domestic-cost", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ origin: originId, destination: String(destinationId), weight: String(totalWeight), courier, price: "lowest" }) }, apiKey);
      const selected = Array.isArray(quoteData) ? quoteData.find((rate) => String((rate as ShippingRate).code).toLowerCase() === courier && String((rate as ShippingRate).service).toUpperCase() === service.toUpperCase()) as ShippingRate | undefined : undefined;
      if (!selected || !Number.isInteger(Number(selected.cost)) || Number(selected.cost) <= 0) return reply(400, { error: "SHIPPING_SERVICE_NOT_FOUND" });
      const expiresAt = new Date(Date.now() + 15 * 60_000).toISOString();
      const { data: quote, error: quoteError } = await admin.schema("private").from("shipping_quotes").insert({ user_id: user.id, destination_id: String(destinationId), courier_code: courier, service_code: selected.service, shipping_amount: Number(selected.cost), total_weight_grams: totalWeight, cart_fingerprint: await fingerprint(cart), expires_at: expiresAt, address_snapshot: typeof body.address_snapshot === "object" ? body.address_snapshot : null }).select("id,expires_at").single();
      if (quoteError || !quote) throw new Error("SHIPPING_PROVIDER_ERROR");
      return reply(200, { quote_id: quote.id, courier_code: courier, service_code: selected.service, shipping_amount: Number(selected.cost), total_weight_grams: totalWeight, etd: selected.etd, expires_at: quote.expires_at });
    }
    if (body.action === "search_destination") {
      const query = typeof body.query === "string" ? body.query.trim() : "";
      if (query.length < 2 || query.length > 100) return reply(400, { error: "query must be between 2 and 100 characters." });
      const results = await providerFetch(`/destination/domestic-destination?search=${encodeURIComponent(query)}&limit=20&offset=0`, { method: "GET" }, apiKey);
      const destinations = Array.isArray(results) ? results.map((item): Destination => ({
        id: asPositiveInteger((item as Destination).id, "destination id", Number.MAX_SAFE_INTEGER),
        label: String((item as Destination).label),
        zip_code: (item as Destination).zip_code,
      })) : [];
      return reply(200, { destinations });
    }

    return reply(400, { error: "Unsupported shipping action." });
  } catch (error) {
    return reply(400, { error: error instanceof Error ? error.message : "Shipping request could not be completed." });
  }
});
