import type { ReviewRequestStatus } from "./types";

export type OrderRoom = "preparation" | "review" | "fulfillment" | "closed";

export const ORDER_ROOM_BY_STATUS: Record<ReviewRequestStatus, OrderRoom> = {
  DRAFT_PREVIEW: "preparation",
  SUBMITTED: "review",
  UNDER_REVIEW: "review",
  CONSULTATION: "review",
  READY_FOR_APPROVAL: "review",
  REVISION_REQUESTED: "review",
  READY_FOR_PAYMENT: "fulfillment",
  PAYMENT_PENDING: "fulfillment",
  PAID: "fulfillment",
  IN_PRODUCTION: "fulfillment",
  SHIPPED: "fulfillment",
  COMPLETED: "fulfillment",
  CANCELLED: "closed"
};

export const getOrderRoom = (status: ReviewRequestStatus): OrderRoom => ORDER_ROOM_BY_STATUS[status];
