import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [orderDetail, orderPage, customerChat, customerHeader, customerHeaderCss, perfumer, perfumerLayout, perfumerService, adminLayout, migration] = await Promise.all([
  read("src/features/orders/useOrderDetail.ts"), read("src/features/orders/OrderDetailPage.tsx"),
  read("src/features/orders/components/OrderComponents.tsx"), read("src/components/GlobalHeader.tsx"),
  read("src/styles/entrance-hall.css"), read("src/features/perfumer/PerfumerWorkspacePages.tsx"),
  read("src/features/perfumer/PerfumerWorkspaceLayout.tsx"), read("src/features/perfumer/perfumerService.ts"),
  read("src/features/admin/AdminDashboardLayout.tsx"), read("supabase/migrations/20260810170000_enable_request_chat_realtime.sql"),
]);

for (const source of [orderDetail, customerHeader, perfumer, perfumerLayout, adminLayout]) {
  assert.doesNotMatch(source, /subscribeTo(Request|Staff|Customer)/, "active screens must not subscribe to background Realtime updates");
}
assert.doesNotMatch(orderDetail, /setInterval|setTimeout/, "customer detail must not poll in the background");
assert.match(orderPage, /Refresh Messages &amp; Status/, "customer project room needs an explicit refresh button");
assert.match(customerHeader, /Refresh Notifications/, "customer notification center needs an explicit refresh button");
assert.match(adminLayout, /Refresh Data/, "admin workspace needs an explicit refresh button");
assert.match(perfumerLayout, /Refresh Data/, "perfumer workspace needs an explicit refresh button");
assert.match(perfumer, /Refresh Messages/, "perfumer chat needs an explicit refresh button");
assert.match(perfumer, /role === "customer" \? customerName \|\| "Customer"/, "perfumer must see Customer, not You");
assert.match(customerChat, /message\.senderRole==="customer"\?"You":message\.senderName/, "customer must see their own message as You");
assert.match(migration, /'customer','Customer'/, "new customer messages must store a neutral label");
assert.match(migration, /revoke all on function public\.send_customer_request_message/, "message RPC must remain locked down");
assert.match(perfumer, /if \(selectedId\) void perfumerService\.markMessagesRead\(selectedId\)/, "selecting a project must clear its unread messages");
assert.match(migration, /mark_staff_request_messages_read/, "unread state must be persisted securely");
assert.doesNotMatch(perfumerService, /from\("request_messages"\)/, "perfumer workspace must not preload messages for every project");
assert.doesNotMatch(perfumerLayout, /perfumer-nav-badge/, "perfumer navigation must not depend on a global message preload");
assert.match(customerHeader, /Messages &amp; Updates/, "customer account menu needs a notification center");
assert.match(customerHeader, /notificationFilter === "chat"/, "notification center needs a Chat category");
assert.match(customerHeader, /notificationFilter === "update"/, "notification center needs an Updates category");
assert.doesNotMatch(customerHeader, /getDetail\(request\.id\)/, "notifications must not load every request detail");
assert.match(customerHeaderCss, /\.account-notification-panel/, "notification center needs a visible panel layout");

console.log("Manual-refresh chat and notification contract passed.");
