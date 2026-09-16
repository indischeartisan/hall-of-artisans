import type { CommissionPackage, RequestActivity, RequestMessage, ReviewRequest } from "../orders/types";
import type { Json, Tables } from "../../types/database.types";

export type ReviewRequestRow = Tables<"review_requests">;
export type ReviewRequestSummaryRow = Partial<ReviewRequestRow> & Pick<ReviewRequestRow, "id" | "user_id" | "creation_id" | "request_number" | "status" | "perfume_name" | "updated_at">;
export type ReviewMessageRow = Pick<Tables<"request_messages">, "id" | "request_id" | "sender_role" | "sender_name" | "message" | "created_at" | "read_at">;
export type ReviewActivityRow = Pick<Tables<"request_activity">, "id" | "request_id" | "event_type" | "label" | "created_at" | "metadata">;

export const cloneReviewJson = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export function reviewRequestFromRow(row: ReviewRequestRow): ReviewRequest {
  return {
    id: row.id, userId: row.user_id, creationId: row.creation_id, requestNumber: row.request_number,
    assignedReviewerId: row.assigned_reviewer_id, assignedAt: row.assigned_at,
    status: row.status as ReviewRequest["status"], creationMode: row.creation_mode,
    previewSnapshot: cloneReviewJson(row.preview_snapshot) as unknown as ReviewRequest["previewSnapshot"],
    submissionId: row.submission_id,
    submissionSnapshot: row.submission_snapshot ? cloneReviewJson(row.submission_snapshot) as unknown as ReviewRequest["submissionSnapshot"] : null,
    perfumeName: row.perfume_name, concentration: row.concentration, bottleSize: row.bottle_size,
    fragranceDirection: [...row.fragrance_direction], topNotes: [...row.top_notes], heartNotes: [...row.heart_notes], baseNotes: [...row.base_notes],
    fragranceBrief: row.fragrance_brief,
    storyCardData: cloneReviewJson(row.story_card_data) as unknown as ReviewRequest["storyCardData"],
    customerNotes: row.customer_notes, countryCode: row.country_code, pricingRegion: row.pricing_region,
    currency: row.currency, estimatedPriceMin: row.estimated_price_min, estimatedPriceMax: row.estimated_price_max,
    finalPrice: row.final_price, selectedPackageId: row.selected_package_id,
    packageSnapshot: row.package_snapshot ? cloneReviewJson(row.package_snapshot) as unknown as CommissionPackage : null,
    artisanReview: row.artisan_review ? cloneReviewJson(row.artisan_review) as unknown as ReviewRequest["artisanReview"] : null,
    recommendedAdjustments: [...row.recommended_adjustments], includedItems: [...row.included_items],
    estimatedProduction: row.estimated_production, revisionsIncluded: row.revisions_included,
    submittedAt: row.submitted_at, reviewedAt: row.reviewed_at, approvedAt: row.approved_at,
    consultationStartedAt: row.consultation_started_at, consultationCompletedAt: row.consultation_completed_at,
    readyForPaymentAt: row.ready_for_payment_at,
    paidAt: row.paid_at, shippedAt: row.shipped_at, completedAt: row.completed_at, lastUpdatedAt: row.updated_at
  };
}

export function reviewRequestSummaryFromRow(row: ReviewRequestSummaryRow): ReviewRequest {
  return {
    id: row.id, userId: row.user_id, creationId: row.creation_id, requestNumber: row.request_number,
    assignedReviewerId: row.assigned_reviewer_id ?? null, assignedAt: row.assigned_at ?? null,
    status: row.status as ReviewRequest["status"], creationMode: row.creation_mode ?? undefined,
    submissionId: row.submission_id ?? null, perfumeName: row.perfume_name,
    concentration: row.concentration ?? "", bottleSize: row.bottle_size ?? "",
    fragranceDirection: row.fragrance_direction ?? [], topNotes: row.top_notes ?? [], heartNotes: row.heart_notes ?? [], baseNotes: row.base_notes ?? [],
    fragranceBrief: row.fragrance_brief ?? "", storyCardData: { title: row.perfume_name, subtitle: "" }, customerNotes: row.customer_notes ?? "",
    countryCode: row.country_code ?? "", pricingRegion: row.pricing_region ?? "", currency: row.currency ?? "IDR",
    estimatedPriceMin: row.estimated_price_min ?? 0, estimatedPriceMax: row.estimated_price_max ?? 0, finalPrice: row.final_price ?? null,
    selectedPackageId: row.selected_package_id ?? null, packageSnapshot: null, artisanReview: null,
    recommendedAdjustments: row.recommended_adjustments ?? [], includedItems: row.included_items ?? [], estimatedProduction: row.estimated_production ?? null,
    revisionsIncluded: row.revisions_included ?? null, submittedAt: row.submitted_at ?? null, reviewedAt: row.reviewed_at ?? null,
    approvedAt: row.approved_at ?? null, consultationStartedAt: row.consultation_started_at ?? null,
    consultationCompletedAt: row.consultation_completed_at ?? null, readyForPaymentAt: row.ready_for_payment_at ?? null,
    paidAt: row.paid_at ?? null, shippedAt: row.shipped_at ?? null, completedAt: row.completed_at ?? null, lastUpdatedAt: row.updated_at
  };
}

export const reviewMessageFromRow = (row: ReviewMessageRow): RequestMessage => ({
  id: row.id, requestId: row.request_id, senderRole: row.sender_role as RequestMessage["senderRole"], senderName: row.sender_name,
  message: row.message, createdAt: row.created_at, readAt: row.read_at
});

export const reviewActivityFromRow = (row: ReviewActivityRow): RequestActivity => ({
  id: row.id, requestId: row.request_id, eventType: row.event_type, label: row.label, createdAt: row.created_at,
  metadata: cloneReviewJson(row.metadata as Json) as RequestActivity["metadata"]
});
