import { getSupabaseClient } from "../../lib/supabase";
import type { ReviewRequest } from "../orders/types";
import { getAssignedReviewQueue, getReviewRequestDetail, sendStaffReviewMessage, transitionReviewRequest, type ArtisanProposalInput, type ReviewRequestDetail } from "../reviews/reviewWorkflowService";
import { aftercareService, type AftercareCase } from "../aftercare/aftercareService";
import { debugSupabaseFetch } from "../../lib/supabaseFetchDebug";
import { withTtlCache } from "../../lib/ttlCache";

export interface PerfumerWorkspaceData {
  projects: ReviewRequest[];
  customers: PerfumerCustomerSummary[];
  aftercareCases: AftercareCase[];
}
export interface PerfumerCustomerSummary { userId: string; displayName: string; artisanId: string | null }

export const perfumerService = {
  async getWorkspace(userId: string): Promise<PerfumerWorkspaceData> {
    return withTtlCache(`perfumer:workspace:${userId}`, 30_000, async () => {
    debugSupabaseFetch("perfumerWorkspace", "initial-or-recovery");
    const [projects, customerResponse, aftercareCases] = await Promise.all([getAssignedReviewQueue(userId), getSupabaseClient().rpc("get_assigned_customer_summaries"), aftercareService.getAssigned()]);
    if (customerResponse.error) throw customerResponse.error;
    const customers = (customerResponse.data ?? []).map(item => ({ userId: item.user_id, displayName: item.display_name, artisanId: item.artisan_id }));
    return { projects, customers, aftercareCases };
    });
  },
  getDetail(requestId: string): Promise<ReviewRequestDetail | null> { return getReviewRequestDetail(requestId); },
  transition(requestId: string, nextStatus: string, label: string, proposal?: ArtisanProposalInput) { return transitionReviewRequest(requestId, nextStatus, label, proposal); },
  sendMessage(requestId: string, message: string) { return sendStaffReviewMessage(requestId, message); },
  markMessagesRead(requestId: string) {
    void (getSupabaseClient() as any).rpc("mark_staff_request_messages_read", { target_request_id: requestId }).then((response: { error?: unknown }) => {
      if (response.error) console.warn("Server unread state could not be synchronized.", response.error);
    });
    return Promise.resolve();
  }
};
