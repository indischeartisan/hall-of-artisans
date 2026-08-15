import { getSupabaseClient, isSupabaseConfigured } from "../../lib/supabase";

const POLL_INTERVAL_MS = 5000;

export function subscribeToRequestUpdates(requestId: string, onChange: () => void) {
  if (!requestId) return () => undefined;
  let debounceId: number | undefined;
  const notify = () => {
    window.clearTimeout(debounceId);
    debounceId = window.setTimeout(onChange, 120);
  };
  const pollId = window.setInterval(() => {
    if (document.visibilityState === "visible") onChange();
  }, POLL_INTERVAL_MS);
  if (!isSupabaseConfigured) return () => { window.clearInterval(pollId); window.clearTimeout(debounceId); };

  const client = getSupabaseClient();
  const channel = client
    .channel(`request-updates:${requestId}:${crypto.randomUUID()}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "request_messages", filter: `request_id=eq.${requestId}` }, notify)
    .on("postgres_changes", { event: "*", schema: "public", table: "request_activity", filter: `request_id=eq.${requestId}` }, notify)
    .on("postgres_changes", { event: "*", schema: "public", table: "review_requests", filter: `id=eq.${requestId}` }, notify)
    .subscribe();

  return () => {
    window.clearInterval(pollId);
    window.clearTimeout(debounceId);
    void client.removeChannel(channel);
  };
}

export function subscribeToStaffMessageUpdates(onChange: () => void) {
  let debounceId: number | undefined;
  const notify = () => {
    window.clearTimeout(debounceId);
    debounceId = window.setTimeout(onChange, 120);
  };
  const pollId = window.setInterval(() => {
    if (document.visibilityState === "visible") onChange();
  }, POLL_INTERVAL_MS);
  if (!isSupabaseConfigured) return () => { window.clearInterval(pollId); window.clearTimeout(debounceId); };

  const client = getSupabaseClient();
  const channel = client
    .channel(`staff-messages:${crypto.randomUUID()}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "request_messages" }, notify)
    .subscribe();
  return () => {
    window.clearInterval(pollId);
    window.clearTimeout(debounceId);
    void client.removeChannel(channel);
  };
}
