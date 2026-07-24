import { createArtisanBenchSubmissionSnapshot, createDescribedCreationSnapshot, type DescribedCreationInput } from "../../domain/creation";
import { validateCheckoutCandidates } from "../../domain/checkout";
import { canTransition, isChatAvailable, isCheckoutAvailable, type WorkflowActor, type WorkflowStatus } from "../../domain/workflow";
import { DEMO_REQUEST_ID, demoActivity, demoMessages, demoRequest } from "../../dev/fixtures/orderFixtures";
import { getSupabaseClient, isSupabaseConfigured } from "../../lib/supabase";
import type { Json, Tables } from "../../types/database.types";
import { DRAFT_SCHEMA_VERSION, type ArtisanBenchState, type PerfumeDraft } from "../../types/perfumeDraft";
import type { CheckoutDetails, Order, OrderDetailSnapshot, OrderItem, RequestActivity, RequestMessage, ReviewRequest } from "./types";

export type BespokeSubmissionInput = DescribedCreationInput;
export interface ServiceResult<T = undefined> { ok: boolean; data?: T; error?: string }

export const ORDER_STORAGE_KEYS = {
  requests: "hallOfArtisans.reviewRequests.v1",
  messages: "hallOfArtisans.requestMessages.v1",
  activity: "hallOfArtisans.requestActivity.v1",
  orders: "hallOfArtisans.orders.v1",
  checkout: "hallOfArtisans.checkout.v1"
} as const;

type ReviewRow = Tables<"review_requests">;
type MessageRow = Tables<"request_messages">;
type ActivityRow = Tables<"request_activity">;
type OrderRow = Tables<"customer_orders">;
type OrderItemRow = Tables<"order_items">;

class OrderServiceError extends Error {
  constructor(message: string, readonly cause?: unknown) { super(message); this.name = "OrderServiceError"; }
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const emitChange = () => window.dispatchEvent(new CustomEvent("hoa:orders-change"));
const readLocal = <T,>(key: string, fallback: T): T => {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
};
const validCurrency = (value: string) => /^[A-Z]{3}$/.test(value);

async function verifiedUserId(): Promise<string> {
  if (!isSupabaseConfigured) throw new OrderServiceError("Supabase is not configured for My Orders.");
  const client = getSupabaseClient();
  const session = await client.auth.getSession();
  if (session.error) throw new OrderServiceError("Unable to read your sign-in session.", session.error);
  if (!session.data.session) throw new OrderServiceError("Please sign in to open My Orders.");
  const user = await client.auth.getUser();
  if (user.error || !user.data.user) throw new OrderServiceError("Your sign-in session could not be verified. Please sign in again.", user.error);
  return user.data.user.id;
}

function reviewFromRow(row: ReviewRow): ReviewRequest {
  return {
    id: row.id, userId: row.user_id, creationId: row.creation_id, requestNumber: row.request_number,
    status: row.status as ReviewRequest["status"], creationMode: row.creation_mode,
    previewSnapshot: clone(row.preview_snapshot) as ReviewRequest["previewSnapshot"],
    submissionId: row.submission_id,
    submissionSnapshot: row.submission_snapshot ? clone(row.submission_snapshot) as ReviewRequest["submissionSnapshot"] : null,
    perfumeName: row.perfume_name, concentration: row.concentration, bottleSize: row.bottle_size,
    fragranceDirection: [...row.fragrance_direction], topNotes: [...row.top_notes], heartNotes: [...row.heart_notes], baseNotes: [...row.base_notes],
    fragranceBrief: row.fragrance_brief,
    storyCardData: clone(row.story_card_data) as unknown as ReviewRequest["storyCardData"],
    customerNotes: row.customer_notes, countryCode: row.country_code, pricingRegion: row.pricing_region,
    currency: row.currency, estimatedPriceMin: row.estimated_price_min, estimatedPriceMax: row.estimated_price_max,
    finalPrice: row.final_price,
    artisanReview: row.artisan_review ? clone(row.artisan_review) as unknown as ReviewRequest["artisanReview"] : null,
    recommendedAdjustments: [...row.recommended_adjustments], includedItems: [...row.included_items],
    estimatedProduction: row.estimated_production, revisionsIncluded: row.revisions_included,
    submittedAt: row.submitted_at, reviewedAt: row.reviewed_at, approvedAt: row.approved_at,
    paidAt: row.paid_at, shippedAt: row.shipped_at, completedAt: row.completed_at, lastUpdatedAt: row.updated_at
  };
}

function messageFromRow(row: MessageRow): RequestMessage {
  return { id: row.id, requestId: row.request_id, senderRole: row.sender_role as RequestMessage["senderRole"], senderName: row.sender_name, message: row.message, createdAt: row.created_at, readAt: row.read_at, attachmentUrl: row.attachment_url ?? undefined };
}
function activityFromRow(row: ActivityRow): RequestActivity {
  return { id: row.id, requestId: row.request_id, eventType: row.event_type, label: row.label, createdAt: row.created_at, metadata: clone(row.metadata) as RequestActivity["metadata"] };
}
function itemFromRow(row: OrderItemRow): OrderItem {
  return { reviewRequestId: row.review_request_id, submissionId: row.submission_id, submissionSnapshot: clone(row.submission_snapshot) as unknown as OrderItem["submissionSnapshot"], creationName: row.creation_name, amount: row.amount, currency: row.currency, productionStatus: row.production_status as OrderItem["productionStatus"], shippingStatus: row.shipping_status as OrderItem["shippingStatus"], trackingNumber: row.tracking_number ?? undefined };
}
function orderFromRows(row: OrderRow, items: OrderItemRow[]): Order {
  return { id: row.id, items: items.map(itemFromRow), orderNumber: row.order_number, amount: row.amount, currency: row.currency, paymentStatus: row.payment_status as Order["paymentStatus"], productionStatus: row.production_status as Order["productionStatus"], shippingStatus: row.shipping_status as Order["shippingStatus"], trackingNumber: row.tracking_number ?? undefined, shippingPreference: row.shipping_preference as Order["shippingPreference"], createdAt: row.created_at };
}

function previewPayload(request: ReviewRequest): Json {
  return {
    id: request.id, creationId: request.creationId, creationMode: request.creationMode ?? "described",
    previewSnapshot: clone(request.previewSnapshot ?? {}), perfumeName: request.perfumeName,
    concentration: request.concentration, bottleSize: request.bottleSize,
    fragranceDirection: [...request.fragranceDirection], topNotes: [...request.topNotes], heartNotes: [...request.heartNotes], baseNotes: [...request.baseNotes],
    fragranceBrief: request.fragranceBrief, storyCardData: clone(request.storyCardData), customerNotes: request.customerNotes,
    countryCode: request.countryCode, pricingRegion: request.pricingRegion, currency: request.currency,
    estimatedPriceMin: request.estimatedPriceMin, estimatedPriceMax: request.estimatedPriceMax
  } as Json;
}

async function importLegacyRequests(userId: string, existingIds: Set<string>): Promise<boolean> {
  const migrationKey = `hallOfArtisans.ordersMigratedToSupabase.${userId}`;
  if (localStorage.getItem(migrationKey) === "1") return false;
  const legacy = readLocal<ReviewRequest[]>(ORDER_STORAGE_KEYS.requests, []).filter(item => item.id !== DEMO_REQUEST_ID && ["DRAFT_PREVIEW", "SUBMITTED"].includes(item.status));
  let imported = false;
  for (const request of legacy) {
    if (existingIds.has(request.id)) continue;
    const created = await getSupabaseClient().rpc("create_review_preview", { request_payload: previewPayload(request) });
    if (created.error) throw new OrderServiceError("Unable to migrate a local My Orders record.", created.error);
    if (request.status === "SUBMITTED") {
      const submitted = await getSupabaseClient().rpc("submit_review_request", { target_request_id: created.data.id });
      if (submitted.error) throw new OrderServiceError("Unable to migrate a submitted My Orders record.", submitted.error);
    }
    imported = true;
  }
  localStorage.setItem(migrationKey, "1");
  return imported;
}

async function loadRequests(includeDemo = false, allowMigration = true): Promise<ReviewRequest[]> {
  const userId = await verifiedUserId();
  const query = await getSupabaseClient().from("review_requests").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
  if (query.error) throw new OrderServiceError("Unable to load My Orders.", query.error);
  const rows = query.data ?? [];
  if (allowMigration && await importLegacyRequests(userId, new Set(rows.map(row => row.id)))) return loadRequests(includeDemo, false);
  const requests = rows.map(reviewFromRow);
  return includeDemo && import.meta.env.DEV ? [clone(demoRequest), ...requests] : requests;
}

async function rpcReview(name: "submit_review_request" | "customer_transition_review_request", args: Record<string, unknown>): Promise<ServiceResult<ReviewRequest>> {
  const response = name === "submit_review_request"
    ? await getSupabaseClient().rpc(name, args as { target_request_id: string })
    : await getSupabaseClient().rpc(name, args as { target_request_id: string; next_status: string; activity_label?: string | null });
  if (response.error || !response.data) return { ok: false, error: response.error?.message ?? "The request could not be updated." };
  emitChange();
  return { ok: true, data: reviewFromRow(response.data) };
}

export const orderService = {
  ensureDemoData() { return import.meta.env.DEV ? DEMO_REQUEST_ID : undefined; },
  getRequests(includeDemo = false) { return loadRequests(includeDemo); },

  async getDetail(requestId: string): Promise<OrderDetailSnapshot | null> {
    if (requestId === DEMO_REQUEST_ID && import.meta.env.DEV) return { request: clone(demoRequest), messages: clone(demoMessages), activity: clone(demoActivity), order: null };
    const userId = await verifiedUserId();
    const requestResult = await getSupabaseClient().from("review_requests").select("*").eq("id", requestId).eq("user_id", userId).maybeSingle();
    if (requestResult.error) throw new OrderServiceError("Unable to open this request.", requestResult.error);
    if (!requestResult.data) return null;
    const [messages, activity, item] = await Promise.all([
      getSupabaseClient().from("request_messages").select("*").eq("request_id", requestId).order("created_at"),
      getSupabaseClient().from("request_activity").select("*").eq("request_id", requestId).order("created_at"),
      getSupabaseClient().from("order_items").select("*").eq("review_request_id", requestId).maybeSingle()
    ]);
    if (messages.error || activity.error || item.error) throw new OrderServiceError("Unable to load all order details.", messages.error ?? activity.error ?? item.error);
    let order: Order | null = null;
    if (item.data) {
      const [header, items] = await Promise.all([
        getSupabaseClient().from("customer_orders").select("*").eq("id", item.data.order_id).single(),
        getSupabaseClient().from("order_items").select("*").eq("order_id", item.data.order_id).order("created_at")
      ]);
      if (header.error || items.error) throw new OrderServiceError("Unable to load this order.", header.error ?? items.error);
      order = orderFromRows(header.data, items.data ?? []);
    }
    return { request: reviewFromRow(requestResult.data), messages: (messages.data ?? []).map(messageFromRow), activity: (activity.data ?? []).map(activityFromRow), order };
  },

  async createBespokePreview(input: BespokeSubmissionInput, existingPreviewId?: string, sourceDraftId?: string): Promise<ReviewRequest> {
    await verifiedUserId();
    const stamp = new Date().toISOString();
    const snapshot = createDescribedCreationSnapshot(input, stamp, sourceDraftId ?? null);
    const provisional: ReviewRequest = {
      id: existingPreviewId ?? `bespoke-${globalThis.crypto.randomUUID()}`, userId: "", creationId: `creation-${globalThis.crypto.randomUUID()}`,
      requestNumber: "Preview only", status: "DRAFT_PREVIEW", creationMode: "described", previewSnapshot: snapshot,
      submissionId: null, submissionSnapshot: null, perfumeName: snapshot.perfumeName, concentration: snapshot.concentration,
      bottleSize: "To be confirmed", fragranceDirection: snapshot.preferredNotes, topNotes: [], heartNotes: [], baseNotes: [],
      fragranceBrief: snapshot.writtenStory, storyCardData: { title: snapshot.title, subtitle: "A personal story awaiting artisan interpretation.", imageUrl: "/assets/images/my-artisan-id-conservatory.webp" },
      customerNotes: [snapshot.notesToAvoid.length ? `Please avoid: ${snapshot.notesToAvoid.join(", ")}.` : "", snapshot.additionalNotes].filter(Boolean).join(" "),
      countryCode: "ID", pricingRegion: "Indonesia", currency: "IDR", estimatedPriceMin: 699000, estimatedPriceMax: 1499000,
      finalPrice: null, artisanReview: null, recommendedAdjustments: [], includedItems: [], estimatedProduction: null, revisionsIncluded: null,
      submittedAt: null, reviewedAt: null, approvedAt: null, paidAt: null, shippedAt: null, completedAt: null, lastUpdatedAt: stamp
    };
    const response = await getSupabaseClient().rpc("create_review_preview", { request_payload: previewPayload(provisional) });
    if (response.error || !response.data) throw new OrderServiceError("Unable to create your review preview.", response.error);
    emitChange();
    return reviewFromRow(response.data);
  },

  async createArtisanBenchPreview(state: ArtisanBenchState, sourceDraftId?: string, materialNames: Record<string, string> = {}): Promise<ReviewRequest> {
    await verifiedUserId();
    const stamp = new Date().toISOString();
    const title = state.perfumeName.trim() || "Untitled Artisan Bench Creation";
    const draft: PerfumeDraft = {
      id: sourceDraftId ?? `bench-preview-${globalThis.crypto.randomUUID()}`,
      schemaVersion: DRAFT_SCHEMA_VERSION,
      mode: "artisan_bench",
      draftName: title,
      perfumeName: state.perfumeName || undefined,
      formula: clone(state.formula),
      formulaMetadata: clone(state.formulaMetadata),
      fragranceBrief: state.fragranceBrief ? clone(state.fragranceBrief) : undefined,
      storyCard: state.storyCard ? clone(state.storyCard) : undefined,
      benchState: clone(state),
      status: state.formulaMetadata.total === 100 ? "ready" : "draft",
      createdAt: stamp,
      updatedAt: stamp
    };
    const snapshot = createArtisanBenchSubmissionSnapshot(draft, materialNames, stamp);
    const notesFor = (layer: "top" | "heart" | "base") => {
      const briefNotes = state.fragranceBrief?.notes[layer] ?? [];
      if (briefNotes.length) return [...briefNotes];
      return snapshot.formulaMaterials.filter(item => item.layer === layer).map(item => item.materialName);
    };
    const provisional: ReviewRequest = {
      id: `bespoke-${globalThis.crypto.randomUUID()}`, userId: "", creationId: `creation-${globalThis.crypto.randomUUID()}`,
      requestNumber: "Preview only", status: "DRAFT_PREVIEW", creationMode: "artisan_bench", previewSnapshot: snapshot,
      submissionId: null, submissionSnapshot: null, perfumeName: snapshot.perfumeName, concentration: state.fragranceBrief?.concentration || state.concentration.toUpperCase(),
      bottleSize: "To be confirmed", fragranceDirection: snapshot.moodOrDirection, topNotes: notesFor("top"), heartNotes: notesFor("heart"), baseNotes: notesFor("base"),
      fragranceBrief: state.fragranceBrief?.concept || "Artisan Bench formula preview awaiting completion.",
      storyCardData: {
        title: state.storyCard?.perfumeName || snapshot.perfumeName,
        subtitle: state.storyCard?.conceptLine || "A fragrance composed at the Artisan Bench.",
        imageUrl: "/assets/images/my-artisan-id-conservatory.webp"
      },
      customerNotes: state.fragranceBrief?.internalBrief || "",
      countryCode: "ID", pricingRegion: "Indonesia", currency: "IDR", estimatedPriceMin: 699000, estimatedPriceMax: 1499000,
      finalPrice: null, artisanReview: null, recommendedAdjustments: [], includedItems: [], estimatedProduction: null, revisionsIncluded: null,
      submittedAt: null, reviewedAt: null, approvedAt: null, paidAt: null, shippedAt: null, completedAt: null, lastUpdatedAt: stamp
    };
    const response = await getSupabaseClient().rpc("create_review_preview", { request_payload: previewPayload(provisional) });
    if (response.error || !response.data) throw new OrderServiceError("Unable to create your Artisan Bench preview in My Orders.", response.error);
    emitChange();
    return reviewFromRow(response.data);
  },

  async submitForReview(requestId: string) { await verifiedUserId(); return rpcReview("submit_review_request", { target_request_id: requestId }); },

  async updateStatus(requestId: string, status: WorkflowStatus, actor: WorkflowActor, label?: string): Promise<ServiceResult<ReviewRequest>> {
    await verifiedUserId();
    if (actor !== "customer") return { ok: false, error: "Staff workflow changes require the upcoming administrative backend." };
    const detail = await this.getDetail(requestId);
    if (!detail) return { ok: false, error: "Request not found." };
    if (!canTransition(detail.request.status, status, actor)) return { ok: false, error: `Customer cannot move ${detail.request.status} to ${status}.` };
    return rpcReview("customer_transition_review_request", { target_request_id: requestId, next_status: status, activity_label: label ?? null });
  },

  async setFinalPrice(): Promise<ServiceResult> { return { ok: false, error: "Final pricing requires the upcoming administrative backend." }; },

  async sendMessage(requestId: string, message: string, senderRole: "customer" | "artisan" = "customer"): Promise<ServiceResult> {
    await verifiedUserId();
    if (senderRole !== "customer") return { ok: false, error: "Artisan messages require the upcoming staff workspace." };
    const detail = await this.getDetail(requestId);
    if (!detail) return { ok: false, error: "Request not found." };
    if (!isChatAvailable(detail.request.status)) return { ok: false, error: "Chat is not available for this status." };
    const response = await getSupabaseClient().rpc("send_customer_request_message", { target_request_id: requestId, message_body: message.trim() });
    if (response.error) return { ok: false, error: response.error.message };
    emitChange();
    return { ok: true };
  },

  getCheckoutSelection() { return readLocal<string[]>(ORDER_STORAGE_KEYS.checkout, []); },
  setCheckoutSelection(requestIds: string[]) { localStorage.setItem(ORDER_STORAGE_KEYS.checkout, JSON.stringify([...new Set(requestIds)])); },
  async getCheckoutEligibleRequests() {
    return (await loadRequests()).filter(item => isCheckoutAvailable(item.status) && item.status === "READY_FOR_CHECKOUT" && item.finalPrice !== null && item.finalPrice > 0 && validCurrency(item.currency) && Boolean(item.submissionId && item.submissionSnapshot));
  },

  async createCheckout(requestIds: string[], details: CheckoutDetails): Promise<ServiceResult<Order>> {
    await verifiedUserId();
    const selected = (await loadRequests()).filter(item => requestIds.includes(item.id));
    const validationError = validateCheckoutCandidates(selected);
    if (validationError) return { ok: false, error: validationError };
    const response = await getSupabaseClient().rpc("create_order_checkout", { request_ids: [...new Set(requestIds)], checkout_payload: clone(details) as unknown as Json });
    if (response.error || !response.data) return { ok: false, error: response.error?.message ?? "Checkout could not be created." };
    const items = await getSupabaseClient().from("order_items").select("*").eq("order_id", response.data.id).order("created_at");
    if (items.error) return { ok: false, error: items.error.message };
    this.setCheckoutSelection([]); emitChange();
    return { ok: true, data: orderFromRows(response.data, items.data ?? []) };
  },

  async simulatePaymentConfirmation(): Promise<ServiceResult> {
    return { ok: false, error: "Payment confirmation must be performed by a trusted server webhook." };
  }
};
