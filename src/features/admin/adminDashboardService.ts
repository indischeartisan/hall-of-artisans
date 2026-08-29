import { getSupabaseClient } from "../../lib/supabase";
import { getLocalOrderStage, isLocallyConfirmedOrder, isLocallyConfirmedOrderId, registerLocallyConfirmedOrder, setLocalOrderStage } from "../../dev/confirmedOrderOverrides";
import type { Json, Tables } from "../../types/database.types";
import type { ReviewRequest } from "../orders/types";
import { staffService } from "./staffService";
import { aftercareService, type AftercareCase } from "../aftercare/aftercareService";
import { debugSupabaseFetch } from "../../lib/supabaseFetchDebug";
import { invalidateTtlCache, withTtlCache } from "../../lib/ttlCache";

type OrderRow = Tables<"customer_orders">;
type OrderItemRow = Tables<"order_items">;

export interface AdminCustomer {
  userId: string;
  name: string;
  artisanId: string;
}

export interface AdminCreation {
  request: ReviewRequest;
  customer: AdminCustomer;
  reviewerName: string;
}

export interface AdminOrderItem {
  id: string;
  reviewRequestId: string;
  creationName: string;
  amount: number;
  currency: string;
  productionStatus: string;
  shippingStatus: string;
  trackingNumber: string | null;
}

export interface AdminOrder {
  id: string;
  userId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  productionStatus: string;
  shippingStatus: string;
  shippingPreference: string;
  trackingNumber: string | null;
  createdAt: string;
  updatedAt: string;
  checkoutDetails: Record<string, unknown>;
  customer: AdminCustomer;
  items: AdminOrderItem[];
  paidAt: string | null;
}

export interface AdminAftercareCase extends AftercareCase {
  creationName: string;
  requestNumber: string;
  customer: AdminCustomer;
}

export interface AdminDashboardSnapshot {
  creations: AdminCreation[];
  orders: AdminOrder[];
}

const jsonObject = (value: Json): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

async function customerMap(userIds: string[]) {
  const result = new Map<string, AdminCustomer>();
  userIds.forEach(userId => result.set(userId, { userId, name: `Customer ${userId.slice(0, 6)}`, artisanId: "Not issued" }));
  if (!userIds.length) return result;
  const client = getSupabaseClient();
  const [profiles, artisanIds] = await Promise.all([
    client.from("profiles").select("id,display_name").in("id", userIds),
    client.from("artisan_ids").select("user_id,public_id,display_name_snapshot").in("user_id", userIds).is("revoked_at", null)
  ]);
  (profiles.data ?? []).forEach(profile => {
    const current = result.get(profile.id);
    if (current) result.set(profile.id, { ...current, name: profile.display_name || current.name });
  });
  (artisanIds.data ?? []).forEach(identity => {
    const current = result.get(identity.user_id);
    if (current) result.set(identity.user_id, { ...current, name: identity.display_name_snapshot || current.name, artisanId: identity.public_id });
  });
  return result;
}

type AdminOrderItemRow = Pick<OrderItemRow, "id" | "review_request_id" | "creation_name" | "amount" | "currency" | "production_status" | "shipping_status" | "tracking_number">;

const mapOrderItem = (row: AdminOrderItemRow): AdminOrderItem => ({
  id: row.id,
  reviewRequestId: row.review_request_id,
  creationName: row.creation_name,
  amount: row.amount,
  currency: row.currency,
  productionStatus: row.production_status,
  shippingStatus: row.shipping_status,
  trackingNumber: row.tracking_number
});

export const adminDashboardService = {
  async transitionOrder(orderId: string, stage: "CONFIRM_PAYMENT" | "START_PRODUCTION" | "MARK_SHIPPED" | "MARK_DELIVERED", trackingNumber?: string) {
    if (isLocallyConfirmedOrderId(orderId) && stage === "START_PRODUCTION") {
      setLocalOrderStage(orderId, "in_production");
      return;
    }
    const { error } = await (getSupabaseClient() as any).rpc("admin_transition_order", {
      target_order_id: orderId,
      next_stage: stage,
      target_tracking_number: trackingNumber?.trim() || null
    });
    if (error) throw error;
    invalidateTtlCache("admin:");
  },
  async getAftercare(snapshot: AdminDashboardSnapshot): Promise<AdminAftercareCase[]> {
    const rows = await aftercareService.getAssigned();
    const creations = new Map(snapshot.creations.map(item => [item.request.id, item]));
    return rows.map((item: AftercareCase) => {
      const creation = creations.get(item.reviewRequestId);
      return {
        ...item,
        creationName: creation?.request.perfumeName ?? "Completed creation",
        requestNumber: creation?.request.requestNumber ?? "—",
        customer: creation?.customer ?? { userId: item.userId, name: "Customer", artisanId: "Not issued" }
      };
    });
  },
  async getOrderCheckout(orderId: string): Promise<Record<string, unknown>> {
    const response = await getSupabaseClient().from("customer_orders").select("checkout_details").eq("id", orderId).maybeSingle();
    if (response.error) throw response.error;
    return response.data ? jsonObject(response.data.checkout_details) : {};
  },
  async getOrderItems(orders: AdminOrder[]): Promise<AdminOrder[]> {
    if (!orders.length) return orders;
    const response = await getSupabaseClient().from("order_items")
      .select("id,order_id,review_request_id,creation_name,amount,currency,production_status,shipping_status,tracking_number")
      .in("order_id", orders.map(order => order.id)).order("created_at", { ascending: false }).limit(100);
    if (response.error) throw response.error;
    const items = new Map<string, AdminOrderItem[]>();
    (response.data ?? []).forEach(row => items.set(row.order_id, [...(items.get(row.order_id) ?? []), mapOrderItem(row)]));
    return orders.map(order => ({ ...order, items: items.get(order.id) ?? [] }));
  },
  async getSnapshot(): Promise<AdminDashboardSnapshot> {
    return withTtlCache("admin:snapshot", 30_000, async () => {
    debugSupabaseFetch("adminWorkspace", "initial-or-recovery");
    const client = getSupabaseClient();
    const [requests, orderRows] = await Promise.all([
      staffService.getQueue(),
      client.from("customer_orders").select("id,user_id,order_number,amount,currency,payment_status,production_status,shipping_status,shipping_preference,tracking_number,created_at,updated_at").order("updated_at", { ascending: false }).limit(30)
    ]);
    if (orderRows.error) throw orderRows.error;

    const users = [...new Set([...requests.map(item => item.userId), ...(orderRows.data ?? []).map(item => item.user_id)])];
    const customers = await customerMap(users);

    const creations = requests.map(request => ({
      request,
      customer: customers.get(request.userId)!,
      reviewerName: request.assignedReviewerId ? "Assigned staff" : "Unassigned"
    }));
    const orders = (orderRows.data ?? []).map((row: OrderRow): AdminOrder => {
      const items: AdminOrderItem[] = [];
      const locallyConfirmed = isLocallyConfirmedOrder(row.order_number);
      if (locallyConfirmed) registerLocallyConfirmedOrder(row.id, row.order_number);
      const localStage = getLocalOrderStage(row.id);
      return {
        id: row.id, userId: row.user_id, orderNumber: row.order_number, amount: row.amount, currency: row.currency,
        paymentStatus: locallyConfirmed ? "paid" : row.payment_status, productionStatus: localStage ?? row.production_status, shippingStatus: row.shipping_status,
        shippingPreference: row.shipping_preference, trackingNumber: row.tracking_number, createdAt: row.created_at,
        updatedAt: row.updated_at, checkoutDetails: {}, customer: customers.get(row.user_id)!,
        items, paidAt: locallyConfirmed || row.payment_status.toLowerCase() === "paid" ? row.updated_at : null
      };
    });
    return {
      creations,
      orders,
    };
    });
  }
};
