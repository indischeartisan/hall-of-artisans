import { getSupabaseClient } from "../../lib/supabase";

export type ShippingDestination = { id: number; label: string; zipCode?: string };
export type TrustedShippingQuote = { quoteId: string; courierCode: string; serviceCode: string; shippingAmount: number; totalWeightGrams: number; etd: string; expiresAt: string };

type FunctionResponse<T> = { data: T | null; error: { message: string } | null };

async function invoke<T>(payload: Record<string, unknown>) {
  const response = await getSupabaseClient().functions.invoke("indische-shipping", { body: payload }) as FunctionResponse<T>;
  if (response.error) throw new Error(response.error.message);
  if (!response.data) throw new Error("Shipping service returned no data.");
  return response.data;
}

export async function searchShippingDestinations(query: string) {
  const result = await invoke<{ destinations: Array<{ id: number; label: string; zip_code?: string }> }>({ action: "search_destination", query });
  return result.destinations.map((destination): ShippingDestination => ({ id: destination.id, label: destination.label, zipCode: destination.zip_code }));
}

export async function createShippingQuote(input: { cartItems: Array<{ variantId: string; quantity: number }>; destinationId: number; courierCode: string; serviceCode: string; addressSnapshot?: Record<string, unknown> }) {
  const result = await invoke<{ quote_id: string; courier_code: string; service_code: string; shipping_amount: number; total_weight_grams: number; etd: string; expires_at: string }>({ action: "create_quote", cart_items: input.cartItems.map(item => ({ variant_id: item.variantId, quantity: item.quantity })), destination_id: input.destinationId, courier_code: input.courierCode, service_code: input.serviceCode, address_snapshot: input.addressSnapshot });
  return { quoteId: result.quote_id, courierCode: result.courier_code, serviceCode: result.service_code, shippingAmount: result.shipping_amount, totalWeightGrams: result.total_weight_grams, etd: result.etd, expiresAt: result.expires_at } satisfies TrustedShippingQuote;
}
