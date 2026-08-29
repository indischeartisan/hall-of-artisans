import { getSupabaseClient } from "../../lib/supabase";
import type { RequestMessage, ReviewRequest } from "../orders/types";
import { staffService, type ArtisanProposalInput, type StaffRequestDetail } from "../admin/staffService";
import { aftercareService, type AftercareCase } from "../aftercare/aftercareService";
import { debugSupabaseFetch } from "../../lib/supabaseFetchDebug";
import { withTtlCache } from "../../lib/ttlCache";

export interface PerfumerWorkspaceData {
  projects: ReviewRequest[];
  recentMessages: RequestMessage[];
  customers: PerfumerCustomerSummary[];
  aftercareCases: AftercareCase[];
}
export interface PerfumerCustomerSummary { userId: string; displayName: string; artisanId: string | null }

const seenKey = (requestId: string) => `hoa:perfumer-chat-seen:v2:${requestId}`;
const lastSeenAt = (requestId: string) => typeof window === "undefined" ? 0 : Number(window.localStorage.getItem(seenKey(requestId)) ?? 0);
const locallyReadRequests = new Set<string>();
export const isRequestLocallyRead = (requestId: string) => locallyReadRequests.has(requestId);

export const perfumerService = {
  async getWorkspace(userId: string): Promise<PerfumerWorkspaceData> {
    return withTtlCache(`perfumer:workspace:${userId}`, 30_000, async () => {
    debugSupabaseFetch("perfumerWorkspace", "initial-or-recovery");
    const [queue, customerResponse, aftercareCases] = await Promise.all([staffService.getQueue(), getSupabaseClient().rpc("get_assigned_customer_summaries"), aftercareService.getAssigned()]);
    if (customerResponse.error) throw customerResponse.error;
    const projects = queue.filter(item => item.assignedReviewerId === userId);
    const customers = (customerResponse.data ?? []).map(item => ({ userId: item.user_id, displayName: item.display_name, artisanId: item.artisan_id }));
    const ids = projects.map(item => item.id);
    if (!ids.length) return { projects, recentMessages: [], customers, aftercareCases };
    const response = await getSupabaseClient().from("request_messages").select("id,request_id,sender_role,sender_name,message,created_at,read_at").in("request_id", ids).order("created_at", { ascending: false }).limit(50);
    if (response.error) throw response.error;
    const recentMessages: RequestMessage[] = (response.data ?? []).map(row => {
      const project = projects.find(item => item.id === row.request_id);
      const customer = customers.find(item => item.userId === project?.userId);
      const senderRole = row.sender_role === "customer" || row.sender_name === "You" || row.sender_name === "Customer" ? "customer" : row.sender_role as RequestMessage["senderRole"];
      if (senderRole === "customer" && new Date(row.created_at).getTime() > lastSeenAt(row.request_id)) locallyReadRequests.delete(row.request_id);
      return {
        id: row.id, requestId: row.request_id, senderRole,
        senderName: senderRole === "customer" ? customer?.displayName ?? "Customer" : row.sender_name,
        message: row.message, createdAt: row.created_at,
        readAt: senderRole === "customer" && new Date(row.created_at).getTime() > lastSeenAt(row.request_id) ? null : row.read_at ?? new Date(lastSeenAt(row.request_id)).toISOString()
      };
    });
    return { projects, recentMessages, customers, aftercareCases };
    });
  },
  getDetail(requestId: string): Promise<StaffRequestDetail | null> { return staffService.getDetail(requestId); },
  transition(requestId: string, nextStatus: string, label: string, proposal?: ArtisanProposalInput) { return staffService.transition(requestId, nextStatus, label, proposal); },
  sendMessage(requestId: string, message: string) { return staffService.sendMessage(requestId, message); },
  markMessagesRead(requestId: string) {
    const seenAt = Date.now();
    locallyReadRequests.add(requestId);
    window.localStorage.setItem(seenKey(requestId), String(seenAt));
    window.dispatchEvent(new CustomEvent("hoa:perfumer-chat-read", { detail: { requestId, seenAt } }));
    void (getSupabaseClient() as any).rpc("mark_staff_request_messages_read", { target_request_id: requestId }).then((response: { error?: unknown }) => {
      if (response.error) console.warn("Server unread state could not be synchronized; local unread state is active.", response.error);
    });
    return Promise.resolve();
  }
};
