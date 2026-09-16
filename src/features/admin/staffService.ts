import { getSupabaseClient } from "../../lib/supabase";
import { debugSupabaseFetch } from "../../lib/supabaseFetchDebug";
import { invalidateTtlCache } from "../../lib/ttlCache";
import type { ReviewRequest } from "../orders/types";
import { reviewRequestFromRow, reviewRequestSummaryFromRow } from "../reviews/reviewReadModel";
import { getAssignedReviewQueue, getReviewRequestDetail, getReviewStaffAccess, sendStaffReviewMessage, transitionReviewRequest, type ArtisanProposalInput, type ReviewRequestDetail, type ReviewStaffAccess, type ReviewStaffRole } from "../reviews/reviewWorkflowService";

const STAFF_QUEUE_COLUMNS = "id,user_id,creation_id,request_number,assigned_reviewer_id,assigned_at,status,creation_mode,submission_id,perfume_name,concentration,bottle_size,currency,final_price,selected_package_id,submitted_at,paid_at,completed_at,updated_at";
const invalidateStaffCaches = () => { invalidateTtlCache("admin:"); invalidateTtlCache("perfumer:"); };

export type StaffRole = ReviewStaffRole;
export type StaffAccess = ReviewStaffAccess;
export interface StaffReviewer { userId: string; displayName: string }
export type StaffRequestDetail = ReviewRequestDetail;
export type { ArtisanProposalInput };

export const staffService = {
  getAccess(): Promise<StaffAccess> { return getReviewStaffAccess(); },
  async getQueue(): Promise<ReviewRequest[]> {
    const response = await getSupabaseClient().from("review_requests").select(STAFF_QUEUE_COLUMNS).neq("status", "DRAFT_PREVIEW").order("updated_at", { ascending: false }).limit(30);
    if (response.error) throw response.error;
    return (response.data ?? []).map(reviewRequestSummaryFromRow);
  },
  getAssignedQueue(reviewerId: string): Promise<ReviewRequest[]> { return getAssignedReviewQueue(reviewerId); },
  async getQueueItem(requestId: string): Promise<ReviewRequest | null> {
    debugSupabaseFetch("projectSummary", "manual-project-refresh");
    const response = await getSupabaseClient().from("review_requests").select(STAFF_QUEUE_COLUMNS).eq("id", requestId).neq("status", "DRAFT_PREVIEW").maybeSingle();
    if (response.error) throw response.error;
    return response.data ? reviewRequestSummaryFromRow(response.data) : null;
  },
  async getReviewers(): Promise<StaffReviewer[]> {
    const response = await getSupabaseClient().rpc("list_active_reviewers");
    if (response.error) throw response.error;
    return (response.data ?? []).flatMap(item => item.user_id ? [{ userId: item.user_id, displayName: item.display_name ?? "Staff reviewer" }] : []);
  },
  async claim(requestId: string) {
    const response = await getSupabaseClient().rpc("claim_review_request", { target_request_id: requestId });
    if (response.error) throw response.error;
    invalidateStaffCaches();
    return reviewRequestFromRow(response.data);
  },
  async assign(requestId: string, reviewerId: string | null) {
    const response = await (getSupabaseClient() as any).rpc("assign_review_request", { target_request_id: requestId, reviewer_id: reviewerId });
    if (response.error) throw response.error;
    invalidateStaffCaches();
    return reviewRequestFromRow(response.data);
  },
  getDetail(requestId: string): Promise<StaffRequestDetail | null> { return getReviewRequestDetail(requestId); },
  transition(requestId: string, nextStatus: string, label: string, proposal?: ArtisanProposalInput) { return transitionReviewRequest(requestId, nextStatus, label, proposal); },
  sendMessage(requestId: string, message: string) { return sendStaffReviewMessage(requestId, message); }
};
