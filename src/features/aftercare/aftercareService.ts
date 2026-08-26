import { getSupabaseClient } from "../../lib/supabase";

export type AftercareKind = "GRATITUDE" | "REVIEW" | "ISSUE" | "ADJUSTMENT" | "REORDER";
export type AftercareStatus = "OPEN" | "DISCUSSING" | "RESOLVED";
export interface AftercareMessage { id: string; caseId: string; senderRole: "customer" | "artisan" | "admin"; senderName: string; message: string; createdAt: string }
export interface AftercareCase {
  id: string; reviewRequestId: string; userId: string; assignedReviewerId: string | null;
  kind: AftercareKind; status: AftercareStatus; subject: string; body: string; rating: number | null;
  linkedReviewRequestId: string | null; resolvedAt: string | null; createdAt: string; updatedAt: string;
  messages: AftercareMessage[];
}

const mapMessage = (row: any): AftercareMessage => ({ id: row.id, caseId: row.case_id, senderRole: row.sender_role, senderName: row.sender_name, message: row.message, createdAt: row.created_at });
const mapCase = (row: any, messages: AftercareMessage[] = []): AftercareCase => ({
  id: row.id, reviewRequestId: row.review_request_id, userId: row.user_id, assignedReviewerId: row.assigned_reviewer_id,
  kind: row.kind, status: row.status, subject: row.subject, body: row.body, rating: row.rating,
  linkedReviewRequestId: row.linked_review_request_id, resolvedAt: row.resolved_at, createdAt: row.created_at, updatedAt: row.updated_at,
  messages: messages.filter(message => message.caseId === row.id)
});

const client = () => getSupabaseClient() as any;
async function hydrate(rows: any[]): Promise<AftercareCase[]> {
  if (!rows.length) return [];
  const response = await client().from("aftercare_messages").select("id,case_id,sender_role,sender_name,message,created_at").in("case_id", rows.map(row => row.id)).order("created_at").limit(200);
  if (response.error) throw response.error;
  const messages = (response.data ?? []).map(mapMessage);
  return rows.map(row => mapCase(row, messages));
}

export const aftercareService = {
  async getForRequest(requestId: string) {
    const response = await client().from("aftercare_cases").select("id,review_request_id,user_id,assigned_reviewer_id,kind,status,subject,body,rating,linked_review_request_id,resolved_at,created_at,updated_at").eq("review_request_id", requestId).order("updated_at", { ascending: false }).limit(50);
    if (response.error) throw response.error;
    return hydrate(response.data ?? []);
  },
  async getAssigned() {
    const response = await client().from("aftercare_cases").select("id,review_request_id,user_id,assigned_reviewer_id,kind,status,subject,body,rating,linked_review_request_id,resolved_at,created_at,updated_at").order("updated_at", { ascending: false }).limit(100);
    if (response.error) throw response.error;
    return hydrate(response.data ?? []);
  },
  async create(requestId: string, input: { kind: AftercareKind; subject: string; body: string; rating?: number | null }) {
    const response = await client().rpc("create_aftercare_case", { target_request_id: requestId, case_kind: input.kind, case_subject: input.subject, case_body: input.body, case_rating: input.rating ?? null });
    if (response.error) throw response.error;
    return mapCase(response.data);
  },
  async send(caseId: string, message: string) {
    const response = await client().rpc("send_aftercare_message", { target_case_id: caseId, message_body: message.trim() });
    if (response.error) throw response.error;
    return mapMessage(response.data);
  },
  async resolve(caseId: string) {
    const response = await client().rpc("resolve_aftercare_case", { target_case_id: caseId });
    if (response.error) throw response.error;
    return mapCase(response.data);
  }
};
