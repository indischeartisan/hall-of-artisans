import { getSupabaseClient, isSupabaseConfigured } from "../../lib/supabase";

const DISCONNECTED_POLL_INTERVAL_MS = 300_000;
const NOTIFICATION_DISCONNECTED_POLL_INTERVAL_MS = 900_000;

function installForegroundRefresh(onChange: () => void) {
  const refresh = () => { if (document.visibilityState === "visible") onChange(); };
  window.addEventListener("focus", refresh);
  document.addEventListener("visibilitychange", refresh);
  return () => {
    window.removeEventListener("focus", refresh);
    document.removeEventListener("visibilitychange", refresh);
  };
}

export function subscribeToRequestUpdates(requestId: string, onChange: () => void) {
  if (!requestId) return () => undefined;
  let debounceId: number | undefined;
  let realtimeConnected = false;
  const notify = () => {
    window.clearTimeout(debounceId);
    debounceId = window.setTimeout(onChange, 120);
  };
  const pollId = window.setInterval(() => {
    if (!realtimeConnected && document.visibilityState === "visible") onChange();
  }, DISCONNECTED_POLL_INTERVAL_MS);
  const removeForegroundRefresh = installForegroundRefresh(onChange);
  if (!isSupabaseConfigured) return () => { window.clearInterval(pollId); window.clearTimeout(debounceId); removeForegroundRefresh(); };

  const client = getSupabaseClient();
  const channel = client
    .channel(`request-updates:${requestId}:${crypto.randomUUID()}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "request_messages", filter: `request_id=eq.${requestId}` }, notify)
    .on("postgres_changes", { event: "*", schema: "public", table: "request_activity", filter: `request_id=eq.${requestId}` }, notify)
    .subscribe(status => { realtimeConnected = status === "SUBSCRIBED"; });

  return () => {
    window.clearInterval(pollId);
    window.clearTimeout(debounceId);
    removeForegroundRefresh();
    void client.removeChannel(channel);
  };
}

export function subscribeToStaffMessageUpdates(requestIds: string[], onChange: () => void) {
  let debounceId: number | undefined;
  let realtimeConnected = false;
  const notify = () => {
    window.clearTimeout(debounceId);
    debounceId = window.setTimeout(onChange, 120);
  };
  const pollId = window.setInterval(() => {
    if (!realtimeConnected && document.visibilityState === "visible") onChange();
  }, DISCONNECTED_POLL_INTERVAL_MS);
  const removeForegroundRefresh = installForegroundRefresh(onChange);
  if (!isSupabaseConfigured) return () => { window.clearInterval(pollId); window.clearTimeout(debounceId); removeForegroundRefresh(); };

  const client = getSupabaseClient();
  let channel = client.channel(`staff-messages:${crypto.randomUUID()}`);
  for (const requestId of [...new Set(requestIds)].slice(0, 100)) {
    channel = channel
      .on("postgres_changes", { event: "*", schema: "public", table: "request_messages", filter: `request_id=eq.${requestId}` }, notify)
      .on("postgres_changes", { event: "*", schema: "public", table: "request_activity", filter: `request_id=eq.${requestId}` }, notify);
  }
  channel.subscribe(status => { realtimeConnected = status === "SUBSCRIBED"; });
  return () => {
    window.clearInterval(pollId);
    window.clearTimeout(debounceId);
    removeForegroundRefresh();
    void client.removeChannel(channel);
  };
}

export function subscribeToCustomerNotificationUpdates(userId: string, onChange: () => void) {
  let debounceId: number | undefined;
  let realtimeConnected = false;
  const notify = () => {
    window.clearTimeout(debounceId);
    debounceId = window.setTimeout(onChange, 250);
  };
  const pollId = window.setInterval(() => {
    if (!realtimeConnected && document.visibilityState === "visible") onChange();
  }, NOTIFICATION_DISCONNECTED_POLL_INTERVAL_MS);
  const removeForegroundRefresh = installForegroundRefresh(onChange);
  if (!isSupabaseConfigured) return () => { window.clearInterval(pollId); window.clearTimeout(debounceId); removeForegroundRefresh(); };

  const client = getSupabaseClient();
  const channel = client
    .channel(`customer-notifications:${crypto.randomUUID()}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `recipient_id=eq.${userId}` }, notify)
    .subscribe(status => { realtimeConnected = status === "SUBSCRIBED"; });
  return () => {
    window.clearInterval(pollId);
    window.clearTimeout(debounceId);
    removeForegroundRefresh();
    void client.removeChannel(channel);
  };
}
