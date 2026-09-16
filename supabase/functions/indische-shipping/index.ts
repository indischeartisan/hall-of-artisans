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
  if (!authorization?.startsWith("Bearer ")) return false;

  const url = Deno.env.get("SUPABASE_URL");
  const publishableKeys = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (!url || !publishableKeys) return false;

  const key = JSON.parse(publishableKeys).default;
  if (typeof key !== "string") return false;
  const client = createClient(url, key, { global: { headers: { Authorization: authorization } } });
  const { data, error } = await client.auth.getUser();
  return !error && Boolean(data.user);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return reply(405, { error: "Method not allowed." });

  if (!await authenticateRequest(request)) return reply(401, { error: "Authentication is required." });

  const apiKey = Deno.env.get("RAJAONGKIR_SHIPPING_COST_API_KEY");
  const originId = Deno.env.get("INDISCHE_SHIPPING_ORIGIN_ID");
  if (!apiKey || !originId) return reply(503, { error: "Shipping service is not configured." });

  try {
    const body = await request.json() as Record<string, unknown>;
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

    if (body.action === "quote") {
      const destinationId = asPositiveInteger(body.destination_id, "destination_id", Number.MAX_SAFE_INTEGER);
      const weight = asPositiveInteger(body.weight_grams, "weight_grams", 30_000);
      const courier = asCourier(body.courier);
      const data = await providerFetch("/calculate/domestic-cost", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ origin: originId, destination: String(destinationId), weight: String(weight), courier, price: "lowest" }),
      }, apiKey);
      const rates = Array.isArray(data) ? data.map((item): ShippingRate => ({
        name: String((item as ShippingRate).name),
        code: String((item as ShippingRate).code),
        service: String((item as ShippingRate).service),
        description: String((item as ShippingRate).description),
        cost: Number((item as ShippingRate).cost),
        etd: String((item as ShippingRate).etd),
      })).filter((rate) => Number.isFinite(rate.cost) && rate.cost >= 0) : [];
      return reply(200, { origin_id: originId, destination_id: destinationId, weight_grams: weight, rates });
    }

    return reply(400, { error: "Unsupported shipping action." });
  } catch (error) {
    return reply(400, { error: error instanceof Error ? error.message : "Shipping request could not be completed." });
  }
});
