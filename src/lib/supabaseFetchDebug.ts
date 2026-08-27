type FetchResource = "adminWorkspace" | "perfumerWorkspace" | "projectSummary" | "projectHeavy" | "aftercareCases" | "aftercareMessages";

const counters = new Map<FetchResource, number>();

export function debugSupabaseFetch(resource: FetchResource, reason: string, queryType: "lightweight" | "heavy" = "lightweight") {
  if (!import.meta.env.DEV) return;
  const count = (counters.get(resource) ?? 0) + 1;
  counters.set(resource, count);
  console.debug("[SUPABASE FETCH]", { resource, reason, queryType, count, timestamp: new Date().toISOString() });
}
