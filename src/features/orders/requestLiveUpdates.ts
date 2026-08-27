import { getSupabaseClient, isSupabaseConfigured } from "../../lib/supabase";

export const STALE_AFTER_MS = 5 * 60 * 1000;
const DISCONNECTED_POLL_INTERVAL_MS = STALE_AFTER_MS;
const NOTIFICATION_DISCONNECTED_POLL_INTERVAL_MS = 900_000;
const RECOVERY_COALESCE_MS = 750;

export type StaffRealtimeTable = "request_messages" | "request_activity" | "aftercare_cases" | "aftercare_messages";
export interface StaffRealtimeEvent {
  table: StaffRealtimeTable;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Record<string, unknown>;
  old: Record<string, unknown>;
}

interface LiveUpdateOptions {
  onRecovery?: () => void;
  getLastSuccessfulFetch?: () => number;
}

function installStaleRecovery(onRecovery: () => void, isConnected: () => boolean, getLastSuccessfulFetch: () => number) {
  let coalesceId: number | undefined;
  const recoverIfStale = () => {
    if (document.visibilityState !== "visible" || Date.now() - getLastSuccessfulFetch() < STALE_AFTER_MS || isConnected()) return;
    window.clearTimeout(coalesceId);
    coalesceId = window.setTimeout(onRecovery, RECOVERY_COALESCE_MS);
  };
  window.addEventListener("focus", recoverIfStale);
  document.addEventListener("visibilitychange", recoverIfStale);
  return () => {
    window.clearTimeout(coalesceId);
    window.removeEventListener("focus", recoverIfStale);
    document.removeEventListener("visibilitychange", recoverIfStale);
  };
}

export function subscribeToRequestUpdates(requestId: string, onChange: () => void, options: LiveUpdateOptions = {}) {
  if (!requestId) return () => undefined;
  let debounceId: number | undefined;
  let realtimeConnected = false;
  let lastSuccessfulFetch = Date.now();
  const notify = () => { window.clearTimeout(debounceId); debounceId = window.setTimeout(onChange, 500); };
  const getLastFetch = options.getLastSuccessfulFetch ?? (() => lastSuccessfulFetch);
  const recover = () => { lastSuccessfulFetch = Date.now(); (options.onRecovery ?? onChange)(); };
  const pollId = window.setInterval(() => {
    if (!realtimeConnected && document.visibilityState === "visible" && Date.now() - getLastFetch() >= STALE_AFTER_MS) recover();
  }, DISCONNECTED_POLL_INTERVAL_MS);
  const removeForegroundRefresh = installStaleRecovery(recover, () => realtimeConnected, getLastFetch);
  if (!isSupabaseConfigured) return () => { window.clearInterval(pollId); window.clearTimeout(debounceId); removeForegroundRefresh(); };

  const client = getSupabaseClient();
  const channel = client.channel(`request-updates:${requestId}:${crypto.randomUUID()}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "request_messages", filter: `request_id=eq.${requestId}` }, notify)
    .on("postgres_changes", { event: "*", schema: "public", table: "request_activity", filter: `request_id=eq.${requestId}` }, notify)
    .subscribe(status => { realtimeConnected = status === "SUBSCRIBED"; });
  return () => { window.clearInterval(pollId); window.clearTimeout(debounceId); removeForegroundRefresh(); void client.removeChannel(channel); };
}

export function subscribeToStaffMessageUpdates(requestIds: string[], onEvent: (event: StaffRealtimeEvent) => void, options: LiveUpdateOptions = {}) {
  let realtimeConnected = false;
  let lastSuccessfulFetch = Date.now();
  const allowedIds = new Set(requestIds);
  const getLastFetch = options.getLastSuccessfulFetch ?? (() => lastSuccessfulFetch);
  const recover = () => { lastSuccessfulFetch = Date.now(); options.onRecovery?.(); };
  const pollId = window.setInterval(() => {
    if (!realtimeConnected && document.visibilityState === "visible" && Date.now() - getLastFetch() >= STALE_AFTER_MS) recover();
  }, DISCONNECTED_POLL_INTERVAL_MS);
  const removeForegroundRefresh = installStaleRecovery(recover, () => realtimeConnected, getLastFetch);
  if (!isSupabaseConfigured) return () => { window.clearInterval(pollId); removeForegroundRefresh(); };

  const client = getSupabaseClient();
  const receive = (table: StaffRealtimeTable) => (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => {
    const row = Object.keys(payload.new ?? {}).length ? payload.new : payload.old;
    const requestId = String(row.request_id ?? row.id ?? "");
    if (table === "request_messages" && !allowedIds.has(requestId)) return;
    onEvent({ table, eventType: payload.eventType as StaffRealtimeEvent["eventType"], new: payload.new ?? {}, old: payload.old ?? {} });
  };
  const channel = client.channel(`staff-workspace:${crypto.randomUUID()}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "request_messages" }, receive("request_messages"))
    .on("postgres_changes", { event: "*", schema: "public", table: "request_activity" }, receive("request_activity"))
    .on("postgres_changes", { event: "*", schema: "public", table: "aftercare_cases" }, receive("aftercare_cases"))
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "aftercare_messages" }, receive("aftercare_messages"))
    .subscribe(status => { realtimeConnected = status === "SUBSCRIBED"; });
  return () => { window.clearInterval(pollId); removeForegroundRefresh(); void client.removeChannel(channel); };
}

export function subscribeToCustomerNotificationUpdates(userId: string, onChange: () => void) {
  let debounceId: number | undefined;
  let realtimeConnected = false;
  let lastSuccessfulFetch = Date.now();
  const notify = () => { window.clearTimeout(debounceId); debounceId = window.setTimeout(() => { lastSuccessfulFetch = Date.now(); onChange(); }, 500); };
  const pollId = window.setInterval(() => {
    if (!realtimeConnected && document.visibilityState === "visible" && Date.now() - lastSuccessfulFetch >= STALE_AFTER_MS) notify();
  }, NOTIFICATION_DISCONNECTED_POLL_INTERVAL_MS);
  const removeForegroundRefresh = installStaleRecovery(notify, () => realtimeConnected, () => lastSuccessfulFetch);
  if (!isSupabaseConfigured) return () => { window.clearInterval(pollId); window.clearTimeout(debounceId); removeForegroundRefresh(); };
  const client = getSupabaseClient();
  const channel = client.channel(`customer-notifications:${crypto.randomUUID()}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `recipient_id=eq.${userId}` }, notify)
    .subscribe(status => { realtimeConnected = status === "SUBSCRIBED"; });
  return () => { window.clearInterval(pollId); window.clearTimeout(debounceId); removeForegroundRefresh(); void client.removeChannel(channel); };
}
