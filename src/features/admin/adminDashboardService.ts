import { getSupabaseClient } from "../../lib/supabase";
import { getLocalOrderStage, isLocallyConfirmedOrder, isLocallyConfirmedOrderId, registerLocallyConfirmedOrder, setLocalOrderStage } from "../../dev/confirmedOrderOverrides";
import type { Json, Tables } from "../../types/database.types";
import type { ReviewRequest } from "../orders/types";
import { staffService, type StaffReviewer } from "./staffService";
import { aftercareService, type AftercareCase } from "../aftercare/aftercareService";

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

export interface AdminActivityItem {
  id: string;
  requestId: string;
  creationName: string;
  label: string;
  createdAt: string;
}

export interface AdminAftercareCase extends AftercareCase {
  creationName: string;
  requestNumber: string;
  customer: AdminCustomer;
}

export interface AdminMessageItem {
  id: string;
  requestId: string;
  creationName: string;
  message: string;
  senderName: string;
  createdAt: string;
}

export interface AdminDashboardSnapshot {
  creations: AdminCreation[];
  orders: AdminOrder[];
  reviewers: StaffReviewer[];
  activity: AdminActivityItem[];
  customerMessages: AdminMessageItem[];
  aftercare: AdminAftercareCase[];
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
  },
  async getSnapshot(): Promise<AdminDashboardSnapshot> {
    const client = getSupabaseClient();
    const [requests, reviewers, orderRows, orderItemRows, activityRows, messageRows, aftercareRows] = await Promise.all([
      staffService.getQueue(),
      staffService.getReviewers().catch(() => []),
      client.from("customer_orders").select("id,user_id,order_number,amount,currency,payment_status,production_status,shipping_status,shipping_preference,tracking_number,checkout_details,created_at,updated_at").order("updated_at", { ascending: false }).limit(100),
      client.from("order_items").select("id,order_id,review_request_id,submission_id,creation_name,amount,currency,production_status,shipping_status,tracking_number,created_at").order("created_at", { ascending: false }).limit(300),
      client.from("request_activity").select("id,request_id,label,created_at").order("created_at", { ascending: false }).limit(20),
      client.from("request_messages").select("id,request_id,message,sender_name,created_at").eq("sender_role", "customer").order("created_at", { ascending: false }).limit(20),
      aftercareService.getAssigned()
    ]);
    if (orderRows.error || orderItemRows.error || activityRows.error || messageRows.error) {
      throw orderRows.error ?? orderItemRows.error ?? activityRows.error ?? messageRows.error;
    }

    const users = [...new Set([...requests.map(item => item.userId), ...(orderRows.data ?? []).map(item => item.user_id)])];
    const customers = await customerMap(users);
    const reviewerNames = new Map(reviewers.map(item => [item.userId, item.displayName]));
    const requestNames = new Map(requests.map(item => [item.id, item.perfumeName]));
    const requestNumbers = new Map(requests.map(item => [item.id, item.requestNumber]));
    const requestPaidAt = new Map(requests.map(item => [item.id, item.paidAt]));
    const orderItems = new Map<string, AdminOrderItem[]>();
    (orderItemRows.data ?? []).forEach(row => orderItems.set(row.order_id, [...(orderItems.get(row.order_id) ?? []), mapOrderItem(row)]));

    const creations = requests.map(request => ({
      request,
      customer: customers.get(request.userId)!,
      reviewerName: request.assignedReviewerId ? reviewerNames.get(request.assignedReviewerId) ?? "Assigned staff" : "Unassigned"
    }));
    const orders = (orderRows.data ?? []).map((row: OrderRow): AdminOrder => {
      const items = orderItems.get(row.id) ?? [];
      const paidDates = items.map(item => requestPaidAt.get(item.reviewRequestId)).filter((value): value is string => Boolean(value)).sort();
      const locallyConfirmed = isLocallyConfirmedOrder(row.order_number);
      if (locallyConfirmed) registerLocallyConfirmedOrder(row.id, row.order_number);
      const localStage = getLocalOrderStage(row.id);
      return {
        id: row.id, userId: row.user_id, orderNumber: row.order_number, amount: row.amount, currency: row.currency,
        paymentStatus: locallyConfirmed ? "paid" : row.payment_status, productionStatus: localStage ?? row.production_status, shippingStatus: row.shipping_status,
        shippingPreference: row.shipping_preference, trackingNumber: row.tracking_number, createdAt: row.created_at,
        updatedAt: row.updated_at, checkoutDetails: jsonObject(row.checkout_details), customer: customers.get(row.user_id)!,
        items, paidAt: locallyConfirmed ? paidDates.at(-1) ?? row.updated_at : paidDates.at(-1) ?? null
      };
    });
    return {
      creations,
      orders,
      reviewers,
      activity: (activityRows.data ?? []).map(item => ({ ...item, requestId: item.request_id, creationName: requestNames.get(item.request_id) ?? "Creation", createdAt: item.created_at })),
      customerMessages: (messageRows.data ?? []).map(item => ({ ...item, requestId: item.request_id, creationName: requestNames.get(item.request_id) ?? "Creation", senderName: item.sender_name, createdAt: item.created_at })),
      aftercare: aftercareRows.map(item => ({ ...item, creationName: requestNames.get(item.reviewRequestId) ?? "Completed creation", requestNumber: requestNumbers.get(item.reviewRequestId) ?? "—", customer: customers.get(item.userId)! }))
    };
  }
};
