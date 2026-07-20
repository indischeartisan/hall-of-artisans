import type { CreationMode, CreationSubmissionSnapshot } from "../../domain/creation";
import type { WorkflowStatus } from "../../domain/workflow";
export type ReviewRequestStatus = WorkflowStatus;
export type SenderRole = "customer" | "artisan" | "system";

export interface StoryCardData { title: string; subtitle: string; imageUrl?: string }
export interface ArtisanReview { summary: string; olfactiveDirection: string; drydown: string }

export interface ReviewRequest {
  id: string; userId: string; creationId: string; requestNumber: string; status: ReviewRequestStatus;
  creationMode?: CreationMode;
  previewSnapshot?: CreationSubmissionSnapshot;
  submissionId?: string | null;
  submissionSnapshot?: CreationSubmissionSnapshot | null;
  perfumeName: string; concentration: string; bottleSize: string; fragranceDirection: string[];
  topNotes: string[]; heartNotes: string[]; baseNotes: string[]; fragranceBrief: string;
  storyCardData: StoryCardData; customerNotes: string; countryCode: string; pricingRegion: string;
  currency: string; estimatedPriceMin: number; estimatedPriceMax: number; finalPrice: number | null;
  artisanReview: ArtisanReview | null; recommendedAdjustments: string[]; includedItems: string[];
  estimatedProduction: string | null; revisionsIncluded: number | null; submittedAt: string | null;
  reviewedAt: string | null; approvedAt: string | null; paidAt: string | null; shippedAt: string | null;
  completedAt: string | null; lastUpdatedAt: string;
}

export interface RequestMessage { id: string; requestId: string; senderRole: SenderRole; senderName: string; message: string; createdAt: string; readAt: string | null; attachmentUrl?: string }
export interface RequestActivity { id: string; requestId: string; eventType: string; label: string; createdAt: string; metadata?: Record<string, string | number | boolean | null> }
export interface OrderItem {
  reviewRequestId: string;
  submissionId: string;
  submissionSnapshot: CreationSubmissionSnapshot;
  creationName: string;
  amount: number;
  currency: string;
  productionStatus: "not_started" | "in_production" | "completed";
  shippingStatus: "not_shipped" | "shipped" | "delivered";
  trackingNumber?: string;
}
export interface Order {
  id: string;
  /** Kept for backwards compatibility with locally stored single-item orders. */
  reviewRequestId?: string;
  items?: OrderItem[];
  orderNumber: string;
  amount: number;
  currency: string;
  paymentStatus: "pending" | "paid" | "refunded";
  productionStatus: "not_started" | "in_production" | "completed";
  shippingStatus: "not_shipped" | "shipped" | "delivered";
  trackingNumber?: string;
  shippingPreference?: "together" | "separately";
  createdAt: string;
}
export interface CheckoutDetails { recipient: string; address: string; phone: string; deliveryMethod: string; paymentMethod: string; shippingPreference?: "together" | "separately" }

export interface OrderDetailSnapshot { request: ReviewRequest; messages: RequestMessage[]; activity: RequestActivity[]; order: Order | null }
