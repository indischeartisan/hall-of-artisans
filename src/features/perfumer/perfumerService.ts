import { getSupabaseClient } from "../../lib/supabase";
import type { RequestMessage, ReviewRequest } from "../orders/types";
import { staffService, type StaffRequestDetail } from "../admin/staffService";
import { aftercareService, type AftercareCase } from "../aftercare/aftercareService";

export interface PerfumerWorkspaceData {
  projects: ReviewRequest[];
  recentMessages: RequestMessage[];
  customers: PerfumerCustomerSummary[];
  aftercareCases: AftercareCase[];
}
export interface PerfumerCustomerSummary { userId: string; displayName: string; artisanId: string | null }

export const perfumerService = {
  async getWorkspace(userId: string): Promise<PerfumerWorkspaceData> {
    const [queue, customerResponse, aftercareCases] = await Promise.all([staffService.getQueue(), getSupabaseClient().rpc("get_assigned_customer_summaries"), aftercareService.getAssigned()]);
    if (customerResponse.error) throw customerResponse.error;
    const projects = queue.filter(item => item.assignedReviewerId === userId);
    const customers = (customerResponse.data ?? []).map(item => ({ userId: item.user_id, displayName: item.display_name, artisanId: item.artisan_id }));
    const ids = projects.map(item => item.id);
    if (!ids.length) return { projects, recentMessages: [], customers, aftercareCases };
    const response = await getSupabaseClient().from("request_messages").select("*").in("request_id", ids).order("created_at", { ascending: false }).limit(12);
    if (response.error) throw response.error;
    const recentMessages: RequestMessage[] = (response.data ?? []).map(row => ({
      id: row.id, requestId: row.request_id, senderRole: row.sender_role as RequestMessage["senderRole"],
      senderName: row.sender_name, message: row.message, createdAt: row.created_at, readAt: row.read_at,
      attachmentUrl: row.attachment_url ?? undefined
    }));
    return { projects, recentMessages, customers, aftercareCases };
  },
  getDetail(requestId: string): Promise<StaffRequestDetail | null> { return staffService.getDetail(requestId); },
  transition(requestId: string, nextStatus: string, label: string) { return staffService.transition(requestId, nextStatus, label); },
  sendMessage(requestId: string, message: string) { return staffService.sendMessage(requestId, message); }
};
