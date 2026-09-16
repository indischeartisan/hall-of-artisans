import { getSupabaseClient } from "../../lib/supabase";

export type ShippingDestination = { id: number; label: string; zipCode?: string };
export type ShippingRate = { name: string; code: string; service: string; description: string; cost: number; etd: string };

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

export async function quoteShipping(input: { destinationId: number; weightGrams: number; courier: string }) {
  return invoke<{ origin_id: string; destination_id: number; weight_grams: number; rates: ShippingRate[] }>({
    action: "quote",
    destination_id: input.destinationId,
    weight_grams: input.weightGrams,
    courier: input.courier,
  });
}
