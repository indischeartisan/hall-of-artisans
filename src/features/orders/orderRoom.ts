import type { ReviewRequestStatus } from "./types";

export type OrderRoom = "preparation" | "review" | "approval" | "fulfillment" | "closed";

export const ORDER_ROOM_BY_STATUS: Record<ReviewRequestStatus, OrderRoom> = {
  DRAFT_PREVIEW: "preparation",
  SUBMITTED: "review",
  UNDER_REVIEW: "review",
  WAITING_FOR_REPLY: "review",
  REVISION_REQUESTED: "review",
  READY_FOR_APPROVAL: "approval",
  READY_FOR_CHECKOUT: "fulfillment",
  PAYMENT_PENDING: "fulfillment",
  PAID: "fulfillment",
  IN_PRODUCTION: "fulfillment",
  SHIPPED: "fulfillment",
  COMPLETED: "fulfillment",
  CANCELLED: "closed"
};

export const getOrderRoom = (status: ReviewRequestStatus): OrderRoom => ORDER_ROOM_BY_STATUS[status];
