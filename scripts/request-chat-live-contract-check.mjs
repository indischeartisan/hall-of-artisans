import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [live, orderDetail, customerChat, customerHeader, customerHeaderCss, perfumer, perfumerLayout, perfumerService, adminLayout, migration] = await Promise.all([
  read("src/features/orders/requestLiveUpdates.ts"),
  read("src/features/orders/useOrderDetail.ts"),
  read("src/features/orders/components/OrderComponents.tsx"),
  read("src/components/GlobalHeader.tsx"),
  read("src/styles/entrance-hall.css"),
  read("src/features/perfumer/PerfumerWorkspacePages.tsx"),
  read("src/features/perfumer/PerfumerWorkspaceLayout.tsx"),
  read("src/features/perfumer/perfumerService.ts"),
  read("src/features/admin/AdminDashboardLayout.tsx"),
  read("supabase/migrations/20260810170000_enable_request_chat_realtime.sql"),
]);

for (const table of ["request_messages", "request_activity", "review_requests"]) {
  assert.match(live, new RegExp(`table: \"${table}\"`), `${table} must trigger a live refresh`);
  assert.match(migration, new RegExp(`add table public\\.${table}`), `${table} must be published to Supabase Realtime`);
}

assert.match(live, /setInterval\([\s\S]*POLL_INTERVAL_MS\)/, "live updates need a polling fallback");
assert.match(live, /document\.visibilityState === "visible"/, "background tabs must not keep polling");
assert.match(live, /visibilitychange/, "returning to a tab must refresh immediately");
assert.match(live, /window\.addEventListener\("focus"/, "refocusing a workspace must refresh immediately");
assert.match(orderDetail, /subscribeToRequestUpdates\(requestId/, "customer order room must subscribe");
assert.match(perfumer, /subscribeToRequestUpdates\(project\.id/, "perfumer project room must subscribe");
assert.match(perfumer, /role === "customer" \? customerName \|\| "Customer"/, "perfumer must see Customer, not You");
assert.match(customerChat, /message\.senderRole==="customer"\?"You":message\.senderName/, "customer must see their own message as You");
assert.match(migration, /'customer','Customer'/, "new customer messages must store a neutral label");
assert.match(migration, /revoke all on function public\.send_customer_request_message/, "message RPC must remain locked down");
assert.match(perfumer, /chat-unread-count/, "every perfumer chat needs an unread badge");
assert.match(perfumer, /if \(selectedId\) void perfumerService\.markMessagesRead\(selectedId\)/, "selecting an exact project must clear its unread messages");
assert.doesNotMatch(perfumer, /button\.textContent\?\.includes\(project\.requestNumber\)/, "read state must not infer a project from rendered button text");
assert.doesNotMatch(perfumer, /subscribeToRequestUpdates\([^\n]+markMessagesRead/, "background updates must not auto-clear unread messages");
assert.match(migration, /mark_staff_request_messages_read/, "unread state must be persisted securely");
assert.match(migration, /sender_role='customer' and read_at is null/, "only unread customer messages may be marked read");
assert.match(perfumerLayout, /perfumer-nav-badge/, "Customer Projects menu needs a total unread-chat badge");
assert.match(adminLayout, /subscribeToStaffMessageUpdates/, "admin metrics and orders must refresh when workflow data changes");
assert.match(perfumerService, /hoa:perfumer-chat-seen:v2:/, "legacy read_at values need a versioned local last-opened fallback");
assert.match(perfumerService, /row\.sender_name === "You"/, "legacy customer messages must still count as inbound chat");
assert.match(perfumerService, /hoa:perfumer-chat-read/, "opening a chat must publish an immediate local read event");
assert.match(perfumerService, /locallyReadRequests\.add\(requestId\)/, "a clicked project must synchronously enter the local read set");
assert.match(perfumer, /isRequestLocallyRead\(requestId\) \? 0/, "the local read set must override stale database unread values");
assert.match(perfumerLayout, /recentMessages\.map\(message/, "the workspace must clear badges without waiting for the database RPC");
assert.doesNotMatch(perfumer, /markMessagesRead\([^\n]+then\(context\.refresh\)/, "marking a chat read must not be overwritten by a stale refresh");
assert.match(customerHeader, /Messages &amp; Updates/, "customer account menu needs a notification center");
assert.match(customerHeader, /account-notification-badge/, "account trigger needs an unread badge");
assert.match(customerHeader, /notificationFilter === "chat"/, "notification center needs a Chat category");
assert.match(customerHeader, /notificationFilter === "update"/, "notification center needs an Updates category");
assert.match(customerHeader, /hoa:customer-notifications-seen:v2/, "customer read state needs a versioned per-project store");
assert.match(customerHeader, /notificationSeenByRequest\[item\.requestId\]/, "customer unread counts must be calculated per project");
assert.match(customerHeader, /markRequestNotificationsSeen\(requestId\)/, "opening a project must clear only that project's notifications");
assert.doesNotMatch(customerHeader, /const openNotification = \(requestId: string\) => \{ markNotificationsSeen\(\)/, "opening one project must not mark every project read");
assert.match(customerHeader, /setInterval\([\s\S]*5000\)/, "customer notifications need automatic refresh");
assert.match(customerHeaderCss, /\.account-notification-panel/, "notification center needs a visible panel layout");

console.log("Request chat live-update contract passed.");
