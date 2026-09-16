import { getSupabaseClient } from "../../lib/supabase";
import { debugSupabaseFetch } from "../../lib/supabaseFetchDebug";
import { invalidateTtlCache } from "../../lib/ttlCache";
import type { Json } from "../../types/database.types";
import type { AppRole } from "../../types/database.types";
import type { RequestActivity, RequestMessage, ReviewRequest } from "../orders/types";
import { reviewActivityFromRow, reviewMessageFromRow, reviewRequestFromRow, reviewRequestSummaryFromRow } from "./reviewReadModel";

const REVIEW_QUEUE_COLUMNS = "id,user_id,creation_id,request_number,assigned_reviewer_id,assigned_at,status,creation_mode,submission_id,perfume_name,concentration,bottle_size,currency,final_price,selected_package_id,submitted_at,paid_at,completed_at,updated_at";
const REVIEW_DETAIL_COLUMNS = "id,user_id,creation_id,request_number,assigned_reviewer_id,assigned_at,status,creation_mode,submission_id,perfume_name,concentration,bottle_size,fragrance_direction,top_notes,heart_notes,base_notes,fragrance_brief,customer_notes,country_code,pricing_region,currency,estimated_price_min,estimated_price_max,final_price,selected_package_id,recommended_adjustments,included_items,estimated_production,revisions_included,submitted_at,reviewed_at,approved_at,consultation_started_at,consultation_completed_at,ready_for_payment_at,paid_at,shipped_at,completed_at,updated_at,preview_snapshot,submission_snapshot,story_card_data,package_snapshot,artisan_review";
const REVIEW_MESSAGE_COLUMNS = "id,request_id,sender_role,sender_name,message,created_at,read_at";
const REVIEW_ACTIVITY_COLUMNS = "id,request_id,event_type,label,created_at,metadata";
const invalidateReviewWorkspaceCaches = () => { invalidateTtlCache("admin:"); invalidateTtlCache("perfumer:"); };

export interface ReviewRequestDetail { request: ReviewRequest; messages: RequestMessage[]; activity: RequestActivity[] }
export type ReviewStaffRole = Extract<AppRole, "reviewer" | "admin" | "super_admin">;
export interface ReviewStaffAccess { signedIn: boolean; role: ReviewStaffRole | null; email: string; userId: string }
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

const reviewStaffRoles: ReviewStaffRole[] = ["reviewer", "admin", "super_admin"];

export async function getReviewStaffAccess(): Promise<ReviewStaffAccess> {
  const client = getSupabaseClient();
  const user = await client.auth.getUser();
  if (user.error || !user.data.user) return { signedIn: false, role: null, email: "", userId: "" };
  const roles = await client.from("user_roles").select("role").eq("user_id", user.data.user.id).is("revoked_at", null);
  if (roles.error) throw roles.error;
  const role = reviewStaffRoles.find(candidate => roles.data?.some(item => item.role === candidate)) ?? null;
  return { signedIn: true, role, email: user.data.user.email ?? "", userId: user.data.user.id };
}

export async function getAssignedReviewQueue(reviewerId: string): Promise<ReviewRequest[]> {
  const response = await getSupabaseClient().from("review_requests").select(REVIEW_QUEUE_COLUMNS)
    .eq("assigned_reviewer_id", reviewerId).neq("status", "DRAFT_PREVIEW")
    .order("updated_at", { ascending: false }).limit(30);
  if (response.error) throw response.error;
  return (response.data ?? []).map((row) => reviewRequestSummaryFromRow(row));
}

export async function getReviewRequestDetail(requestId: string): Promise<ReviewRequestDetail | null> {
  debugSupabaseFetch("projectSummary", "detail-open");
  const client = getSupabaseClient();
  const [request, messages, activity] = await Promise.all([
    client.from("review_requests").select(REVIEW_DETAIL_COLUMNS).eq("id", requestId).maybeSingle(),
    client.from("request_messages").select(REVIEW_MESSAGE_COLUMNS).eq("request_id", requestId).order("created_at", { ascending: false }).limit(30),
    client.from("request_activity").select(REVIEW_ACTIVITY_COLUMNS).eq("request_id", requestId).order("created_at", { ascending: false }).limit(50)
  ]);
  if (request.error || messages.error || activity.error) throw request.error ?? messages.error ?? activity.error;
  if (!request.data) return null;
  return {
    request: reviewRequestFromRow(request.data),
    messages: (messages.data ?? []).slice().reverse().map(reviewMessageFromRow),
    activity: (activity.data ?? []).slice().reverse().map(reviewActivityFromRow)
  };
}

export async function transitionReviewRequest(requestId: string, nextStatus: string, label: string, proposal?: ArtisanProposalInput): Promise<ReviewRequest> {
  const proposalPayload = proposal ? {
    artisanReview: { summary: proposal.summary, olfactiveDirection: proposal.olfactiveDirection, drydown: proposal.drydown },
    finalPrice: proposal.finalPrice, estimatedProduction: proposal.estimatedProduction,
    revisionsIncluded: proposal.revisionsIncluded, recommendedAdjustments: proposal.recommendedAdjustments,
    includedItems: proposal.includedItems
  } as Json : null;
  const response = await getSupabaseClient().rpc("staff_transition_review_request", { target_request_id: requestId, next_status: nextStatus, proposal: proposalPayload, activity_label: label });
  if (response.error) throw response.error;
  invalidateReviewWorkspaceCaches();
  return reviewRequestFromRow(response.data);
}

export async function sendStaffReviewMessage(requestId: string, message: string): Promise<RequestMessage> {
  const response = await getSupabaseClient().rpc("send_staff_request_message", { target_request_id: requestId, message_body: message.trim() });
  if (response.error) throw response.error;
  invalidateReviewWorkspaceCaches();
  return reviewMessageFromRow(response.data);
}
