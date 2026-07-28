import { getSupabaseClient } from "../../lib/supabase";
import type { AppRole, Json, Tables } from "../../types/database.types";
import type { CommissionPackage, RequestActivity, RequestMessage, ReviewRequest } from "../orders/types";

type ReviewRow = Tables<"review_requests">;
type MessageRow = Tables<"request_messages">;
type ActivityRow = Tables<"request_activity">;

export type StaffRole = Extract<AppRole, "reviewer" | "admin" | "super_admin">;
export interface StaffAccess { signedIn: boolean; role: StaffRole | null; email: string; userId: string }
export interface StaffReviewer { userId: string; displayName: string }
export interface StaffRequestDetail { request: ReviewRequest; messages: RequestMessage[]; activity: RequestActivity[] }
export interface ArtisanProposalInput {
  summary: string;
  olfactiveDirection: string;
  drydown: string;
  finalPrice: number;
  estimatedProduction: string;
  revisionsIncluded: number;
  recommendedAdjustments: string[];
  includedItems: string[];
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const reviewFromRow = (row: ReviewRow): ReviewRequest => ({
  id: row.id, userId: row.user_id, creationId: row.creation_id, requestNumber: row.request_number,
  assignedReviewerId: row.assigned_reviewer_id, assignedAt: row.assigned_at,
  status: row.status as ReviewRequest["status"], creationMode: row.creation_mode,
  previewSnapshot: clone(row.preview_snapshot) as unknown as ReviewRequest["previewSnapshot"], submissionId: row.submission_id,
  submissionSnapshot: row.submission_snapshot ? clone(row.submission_snapshot) as unknown as ReviewRequest["submissionSnapshot"] : null,
  perfumeName: row.perfume_name, concentration: row.concentration, bottleSize: row.bottle_size,
  fragranceDirection: [...row.fragrance_direction], topNotes: [...row.top_notes], heartNotes: [...row.heart_notes], baseNotes: [...row.base_notes],
  fragranceBrief: row.fragrance_brief, storyCardData: clone(row.story_card_data) as unknown as ReviewRequest["storyCardData"],
  customerNotes: row.customer_notes, countryCode: row.country_code, pricingRegion: row.pricing_region, currency: row.currency,
  estimatedPriceMin: row.estimated_price_min, estimatedPriceMax: row.estimated_price_max, finalPrice: row.final_price,
  selectedPackageId: row.selected_package_id,
  packageSnapshot: row.package_snapshot ? clone(row.package_snapshot) as unknown as CommissionPackage : null,
  artisanReview: row.artisan_review ? clone(row.artisan_review) as unknown as ReviewRequest["artisanReview"] : null,
  recommendedAdjustments: [...row.recommended_adjustments], includedItems: [...row.included_items],
  estimatedProduction: row.estimated_production, revisionsIncluded: row.revisions_included,
  submittedAt: row.submitted_at, reviewedAt: row.reviewed_at, approvedAt: row.approved_at,
  consultationStartedAt: row.consultation_started_at, consultationCompletedAt: row.consultation_completed_at,
  readyForPaymentAt: row.ready_for_payment_at, paidAt: row.paid_at,
  shippedAt: row.shipped_at, completedAt: row.completed_at, lastUpdatedAt: row.updated_at
});
const messageFromRow = (row: MessageRow): RequestMessage => ({ id: row.id, requestId: row.request_id, senderRole: row.sender_role as RequestMessage["senderRole"], senderName: row.sender_name, message: row.message, createdAt: row.created_at, readAt: row.read_at, attachmentUrl: row.attachment_url ?? undefined });
const activityFromRow = (row: ActivityRow): RequestActivity => ({ id: row.id, requestId: row.request_id, eventType: row.event_type, label: row.label, createdAt: row.created_at, metadata: clone(row.metadata) as RequestActivity["metadata"] });

const staffRoles: StaffRole[] = ["reviewer", "admin", "super_admin"];

export const staffService = {
  async getAccess(): Promise<StaffAccess> {
    const client = getSupabaseClient();
    const user = await client.auth.getUser();
    if (user.error || !user.data.user) return { signedIn: false, role: null, email: "", userId: "" };
    const roles = await client.from("user_roles").select("role").eq("user_id", user.data.user.id).is("revoked_at", null);
    if (roles.error) throw roles.error;
    const role = staffRoles.find(candidate => roles.data?.some(item => item.role === candidate)) ?? null;
    return { signedIn: true, role, email: user.data.user.email ?? "", userId: user.data.user.id };
  },

  async getQueue(): Promise<ReviewRequest[]> {
    const response = await getSupabaseClient().from("review_requests").select("*").neq("status", "DRAFT_PREVIEW").order("updated_at", { ascending: false });
    if (response.error) throw response.error;
    return (response.data ?? []).map(reviewFromRow);
  },

  async getReviewers(): Promise<StaffReviewer[]> {
    const response = await getSupabaseClient().rpc("list_active_reviewers");
    if (response.error) throw response.error;
    return (response.data ?? []).map(item => ({ userId: item.user_id, displayName: item.display_name ?? "Staff reviewer" }));
  },

  async claim(requestId: string) {
    const response = await getSupabaseClient().rpc("claim_review_request", { target_request_id: requestId });
    if (response.error) throw response.error;
    return reviewFromRow(response.data);
  },

  async assign(requestId: string, reviewerId: string | null) {
    const response = await getSupabaseClient().rpc("assign_review_request", { target_request_id: requestId, reviewer_id: reviewerId });
    if (response.error) throw response.error;
    return reviewFromRow(response.data);
  },

  async getDetail(requestId: string): Promise<StaffRequestDetail | null> {
    const client = getSupabaseClient();
    const [request, messages, activity] = await Promise.all([
      client.from("review_requests").select("*").eq("id", requestId).maybeSingle(),
      client.from("request_messages").select("*").eq("request_id", requestId).order("created_at"),
      client.from("request_activity").select("*").eq("request_id", requestId).order("created_at")
    ]);
    if (request.error || messages.error || activity.error) throw request.error ?? messages.error ?? activity.error;
    if (!request.data) return null;
    return { request: reviewFromRow(request.data), messages: (messages.data ?? []).map(messageFromRow), activity: (activity.data ?? []).map(activityFromRow) };
  },

  async transition(requestId: string, nextStatus: string, label: string, proposal?: ArtisanProposalInput) {
    const proposalPayload = proposal ? {
      artisanReview: { summary: proposal.summary, olfactiveDirection: proposal.olfactiveDirection, drydown: proposal.drydown },
      finalPrice: proposal.finalPrice, estimatedProduction: proposal.estimatedProduction,
      revisionsIncluded: proposal.revisionsIncluded, recommendedAdjustments: proposal.recommendedAdjustments,
      includedItems: proposal.includedItems
    } as Json : null;
    const response = await getSupabaseClient().rpc("staff_transition_review_request", { target_request_id: requestId, next_status: nextStatus, proposal: proposalPayload, activity_label: label });
    if (response.error) throw response.error;
    return reviewFromRow(response.data);
  },

  async sendMessage(requestId: string, message: string) {
    const response = await getSupabaseClient().rpc("send_staff_request_message", { target_request_id: requestId, message_body: message.trim() });
    if (response.error) throw response.error;
    return messageFromRow(response.data);
  }
};
