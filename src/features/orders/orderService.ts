import { createArtisanBenchSubmissionSnapshot, createDescribedCreationSnapshot, type DescribedCreationInput } from "../../domain/creation";
import { validateCheckoutCandidates } from "../../domain/checkout";
import { canTransition, isChatAvailable, isCheckoutAvailable, type WorkflowActor, type WorkflowStatus } from "../../domain/workflow";
import { DEMO_REQUEST_ID, demoActivity, demoMessages, demoRequest } from "../../dev/fixtures/orderFixtures";
import { getLocalOrderStage, isLocallyConfirmedOrder, registerLocallyConfirmedOrder } from "../../dev/confirmedOrderOverrides";
import { getSupabaseClient, isSupabaseConfigured } from "../../lib/supabase";
import type { Json, Tables } from "../../types/database.types";
import { DRAFT_SCHEMA_VERSION, type ArtisanBenchState, type PerfumeDraft } from "../../types/perfumeDraft";
import type { CheckoutDetails, CommissionPackage, Order, OrderDetailSnapshot, OrderItem, RequestActivity, RequestMessage, ReviewRequest } from "./types";
import { signedChatAttachment, uploadCustomerChatImage } from "./chatAttachments";
import { invalidateTtlCache, withTtlCache } from "../../lib/ttlCache";

export type BespokeSubmissionInput = DescribedCreationInput;
export interface ServiceResult<T = undefined> { ok: boolean; data?: T; error?: string }
export type CustomerNotification = { id: string; requestId: string; kind: "chat" | "update"; title: string; detail: string; createdAt: string; readAt: string | null };

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
type PackageRow = Tables<"commission_packages">;

const REVIEW_LIST_COLUMNS = "id,user_id,creation_id,request_number,assigned_reviewer_id,assigned_at,status,creation_mode,submission_id,perfume_name,concentration,bottle_size,fragrance_direction,top_notes,heart_notes,base_notes,fragrance_brief,customer_notes,country_code,pricing_region,currency,estimated_price_min,estimated_price_max,final_price,selected_package_id,recommended_adjustments,included_items,estimated_production,revisions_included,submitted_at,reviewed_at,approved_at,consultation_started_at,consultation_completed_at,ready_for_payment_at,paid_at,shipped_at,completed_at,updated_at";
const REVIEW_DETAIL_COLUMNS = `${REVIEW_LIST_COLUMNS},preview_snapshot,submission_snapshot,story_card_data,package_snapshot,artisan_review`;
const ACTIVITY_COLUMNS = "id,request_id,user_id,event_type,label,created_at,metadata";
const ORDER_ITEM_COLUMNS = "id,order_id,user_id,review_request_id,submission_id,submission_snapshot,creation_name,amount,currency,production_status,shipping_status,tracking_number,created_at";
const ORDER_COLUMNS = "id,user_id,order_number,amount,currency,payment_status,production_status,shipping_status,shipping_preference,tracking_number,checkout_details,created_at,updated_at";
const detailRequestCache = new Map<string, ReviewRequest>();
const cacheDetailRequest = (key: string, request: ReviewRequest) => {
  detailRequestCache.delete(key);
  detailRequestCache.set(key, request);
  while (detailRequestCache.size > 3) detailRequestCache.delete(detailRequestCache.keys().next().value!);
};

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
  if (!isSupabaseConfigured) throw new OrderServiceError("Supabase is not configured for My Creations.");
  const client = getSupabaseClient();
  const user = await client.auth.getUser();
  if (user.error || !user.data.user) throw new OrderServiceError("Please sign in to open My Creations.", user.error);
  return user.data.user.id;
}

function reviewFromRow(row: ReviewRow): ReviewRequest {
  return {
    id: row.id, userId: row.user_id, creationId: row.creation_id, requestNumber: row.request_number,
    assignedReviewerId: row.assigned_reviewer_id, assignedAt: row.assigned_at,
    status: row.status as ReviewRequest["status"], creationMode: row.creation_mode,
    previewSnapshot: clone(row.preview_snapshot) as unknown as ReviewRequest["previewSnapshot"],
    submissionId: row.submission_id,
    submissionSnapshot: row.submission_snapshot ? clone(row.submission_snapshot) as unknown as ReviewRequest["submissionSnapshot"] : null,
    perfumeName: row.perfume_name, concentration: row.concentration, bottleSize: row.bottle_size,
    fragranceDirection: [...row.fragrance_direction], topNotes: [...row.top_notes], heartNotes: [...row.heart_notes], baseNotes: [...row.base_notes],
    fragranceBrief: row.fragrance_brief,
    storyCardData: clone(row.story_card_data) as unknown as ReviewRequest["storyCardData"],
    customerNotes: row.customer_notes, countryCode: row.country_code, pricingRegion: row.pricing_region,
    currency: row.currency, estimatedPriceMin: row.estimated_price_min, estimatedPriceMax: row.estimated_price_max,
    finalPrice: row.final_price, selectedPackageId: row.selected_package_id,
    packageSnapshot: row.package_snapshot ? clone(row.package_snapshot) as unknown as CommissionPackage : null,
    artisanReview: row.artisan_review ? clone(row.artisan_review) as unknown as ReviewRequest["artisanReview"] : null,
    recommendedAdjustments: [...row.recommended_adjustments], includedItems: [...row.included_items],
    estimatedProduction: row.estimated_production, revisionsIncluded: row.revisions_included,
    submittedAt: row.submitted_at, reviewedAt: row.reviewed_at, approvedAt: row.approved_at,
    consultationStartedAt: row.consultation_started_at, consultationCompletedAt: row.consultation_completed_at,
    readyForPaymentAt: row.ready_for_payment_at,
    paidAt: row.paid_at, shippedAt: row.shipped_at, completedAt: row.completed_at, lastUpdatedAt: row.updated_at
  };
}

function reviewSummaryFromRow(row: Partial<ReviewRow> & Pick<ReviewRow, "id" | "user_id" | "creation_id" | "request_number" | "status" | "perfume_name" | "updated_at">): ReviewRequest {
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

function packageFromRow(row: PackageRow): CommissionPackage {
  return { id: row.id, slug: row.slug, name: row.name, description: row.description, price: row.price,
    currency: row.currency, concentration: row.concentration, bottleSize: row.bottle_size,
    includedItems: [...row.included_items], consultationsIncluded: row.consultations_included,
    estimatedProduction: row.estimated_production, displayOrder: row.display_order };
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
  const locallyConfirmed = isLocallyConfirmedOrder(row.order_number);
  if (locallyConfirmed) registerLocallyConfirmedOrder(row.id, row.order_number);
  return { id: row.id, items: items.map(itemFromRow), orderNumber: row.order_number, amount: row.amount, currency: row.currency, paymentStatus: locallyConfirmed ? "paid" : row.payment_status as Order["paymentStatus"], productionStatus: (getLocalOrderStage(row.id) ?? row.production_status) as Order["productionStatus"], shippingStatus: row.shipping_status as Order["shippingStatus"], trackingNumber: row.tracking_number ?? undefined, shippingPreference: row.shipping_preference as Order["shippingPreference"], createdAt: row.created_at };
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
  } as unknown as Json;
}

async function importLegacyRequests(userId: string, existingIds: Set<string>): Promise<boolean> {
  const migrationKey = `hallOfArtisans.ordersMigratedToSupabase.${userId}`;
  if (localStorage.getItem(migrationKey) === "1") return false;
  const legacy = readLocal<ReviewRequest[]>(ORDER_STORAGE_KEYS.requests, []).filter(item => item.id !== DEMO_REQUEST_ID && ["DRAFT_PREVIEW", "SUBMITTED"].includes(item.status));
  let imported = false;
  for (const request of legacy) {
    if (existingIds.has(request.id)) continue;
    const created = await getSupabaseClient().rpc("create_review_preview", { request_payload: previewPayload(request) });
    if (created.error) throw new OrderServiceError("Unable to migrate a local creation record.", created.error);
    if (request.status === "SUBMITTED") {
      const fallbackPackage = await getSupabaseClient().from("commission_packages").select("id").eq("is_active", true).order("display_order").limit(1).single();
      if (fallbackPackage.error) throw new OrderServiceError("Unable to assign a package to the legacy submission.", fallbackPackage.error);
      const selected = await getSupabaseClient().rpc("select_review_package", { target_request_id: created.data.id, target_package_id: fallbackPackage.data.id });
      if (selected.error) throw new OrderServiceError("Unable to assign a package to the legacy submission.", selected.error);
      const submitted = await getSupabaseClient().rpc("submit_review_request", { target_request_id: created.data.id });
      if (submitted.error) throw new OrderServiceError("Unable to migrate a submitted creation record.", submitted.error);
    }
    imported = true;
  }
  localStorage.setItem(migrationKey, "1");
  return imported;
}

async function loadRequests(includeDemo = false, allowMigration = true): Promise<ReviewRequest[]> {
  const userId = await verifiedUserId();
  const query = await getSupabaseClient().from("review_requests").select(REVIEW_LIST_COLUMNS).eq("user_id", userId).order("updated_at", { ascending: false }).limit(100);
  if (query.error) throw new OrderServiceError("Unable to load My Creations.", query.error);
  const rows = query.data ?? [];
  if (allowMigration && await importLegacyRequests(userId, new Set(rows.map(row => row.id)))) return loadRequests(includeDemo, false);
  const requests = rows.map(row => reviewSummaryFromRow(row as unknown as ReviewRow));
  return includeDemo && import.meta.env.DEV ? [clone(demoRequest), ...requests] : requests;
}

async function loadCheckoutRequests(): Promise<ReviewRequest[]> {
  const userId = await verifiedUserId();
  const query = await getSupabaseClient().from("review_requests").select(REVIEW_LIST_COLUMNS)
    .eq("user_id", userId).eq("status", "READY_FOR_PAYMENT").not("submission_snapshot", "is", null)
    .order("updated_at", { ascending: false }).limit(100);
  if (query.error) throw new OrderServiceError("Unable to load checkout details.", query.error);
  return (query.data ?? []).map(row => reviewSummaryFromRow(row as unknown as ReviewRow));
}

async function loadFullRequestsForLegacyRecovery(): Promise<ReviewRequest[]> {
  const userId = await verifiedUserId();
  const query = await getSupabaseClient().from("review_requests").select(REVIEW_DETAIL_COLUMNS)
    .eq("user_id", userId).order("updated_at", { ascending: false }).limit(100);
  if (query.error) throw new OrderServiceError("Unable to recover an existing creation preview.", query.error);
  return (query.data ?? []).map(row => reviewFromRow(row as unknown as ReviewRow));
}

async function rpcReview(name: "submit_review_request" | "customer_transition_review_request", args: Record<string, unknown>): Promise<ServiceResult<ReviewRequest>> {
  const response = name === "submit_review_request"
    ? await getSupabaseClient().rpc(name, args as { target_request_id: string })
    : await getSupabaseClient().rpc(name, args as { target_request_id: string; next_status: string; activity_label?: string });
  if (response.error || !response.data) return { ok: false, error: response.error?.message ?? "The request could not be updated." };
  emitChange();
  return { ok: true, data: reviewFromRow(response.data) };
}

export const orderService = {
  ensureDemoData() { return import.meta.env.DEV ? DEMO_REQUEST_ID : undefined; },
  getRequests(includeDemo = false) { return loadRequests(includeDemo); },

  async getNotificationFeed(userId: string): Promise<CustomerNotification[]> {
    if (!isSupabaseConfigured || !userId) return [];
    return withTtlCache(`notifications:${userId}`, 20_000, async () => {
      const response = await (getSupabaseClient() as any).from("notifications")
        .select("id,request_id,kind,title,detail,created_at,read_at")
        .eq("recipient_id", userId).order("created_at", { ascending: false }).limit(20);
      if (response.error) throw new OrderServiceError("Unable to load notifications.", response.error);
      return (response.data ?? []).map((row: any) => ({ id: row.id, requestId: row.request_id, kind: row.kind, title: row.title, detail: row.detail, createdAt: row.created_at, readAt: row.read_at }));
    });
  },

  async markNotificationsRead(requestId?: string): Promise<void> {
    const response = await (getSupabaseClient() as any).rpc("mark_notifications_read", { target_request_id: requestId ?? null });
    if (response.error) throw new OrderServiceError("Unable to mark notifications as read.", response.error);
    invalidateTtlCache("notifications:");
  },

  async loadOlderMessages(requestId: string, before: string): Promise<{ messages: RequestMessage[]; hasMore: boolean }> {
    await verifiedUserId();
    const response = await getSupabaseClient().from("request_messages")
      .select("id,request_id,user_id,sender_role,sender_name,message,attachment_url,created_at,read_at")
      .eq("request_id", requestId).lt("created_at", before)
      .order("created_at", { ascending: false }).limit(30);
    if (response.error) throw new OrderServiceError("Unable to load older messages.", response.error);
    const rows = response.data ?? [];
    const messages = await Promise.all(rows.slice().reverse().map(async row => ({ ...messageFromRow(row), attachmentUrl: await signedChatAttachment(row.attachment_url) })));
    return { messages, hasMore: rows.length === 30 };
  },

  async getDetail(requestId: string): Promise<OrderDetailSnapshot | null> {
    if (requestId === DEMO_REQUEST_ID && import.meta.env.DEV) return { request: clone(demoRequest), messages: clone(demoMessages), activity: clone(demoActivity), order: null };
    const userId = await verifiedUserId();
    const cacheKey = `${userId}:${requestId}`;
    const cachedRequest = detailRequestCache.get(cacheKey);
    const requestResult = cachedRequest
      ? await getSupabaseClient().from("review_requests").select(REVIEW_LIST_COLUMNS).eq("id", requestId).eq("user_id", userId).maybeSingle()
      : await getSupabaseClient().from("review_requests").select(REVIEW_DETAIL_COLUMNS).eq("id", requestId).eq("user_id", userId).maybeSingle();
    if (requestResult.error) throw new OrderServiceError("Unable to open this request.", requestResult.error);
    if (!requestResult.data) return null;
    const [messages, activity, item] = await Promise.all([
      getSupabaseClient().from("request_messages").select("id,request_id,user_id,sender_role,sender_name,message,attachment_url,created_at,read_at").eq("request_id", requestId).order("created_at", { ascending: false }).limit(30),
      getSupabaseClient().from("request_activity").select(ACTIVITY_COLUMNS).eq("request_id", requestId).order("created_at", { ascending: false }).limit(50),
      getSupabaseClient().from("order_items").select(ORDER_ITEM_COLUMNS).eq("review_request_id", requestId).maybeSingle()
    ]);
    if (messages.error || activity.error || item.error) throw new OrderServiceError("Unable to load all order details.", messages.error ?? activity.error ?? item.error);
    let order: Order | null = null;
    if (item.data) {
      const [header, items] = await Promise.all([
        getSupabaseClient().from("customer_orders").select(ORDER_COLUMNS).eq("id", item.data.order_id).single(),
        getSupabaseClient().from("order_items").select(ORDER_ITEM_COLUMNS).eq("order_id", item.data.order_id).order("created_at")
      ]);
      if (header.error || items.error) throw new OrderServiceError("Unable to load this order.", header.error ?? items.error);
      order = orderFromRows(header.data, items.data ?? []);
    }
    const request = cachedRequest
      ? { ...cachedRequest, ...reviewSummaryFromRow(requestResult.data as unknown as ReviewRow), previewSnapshot: cachedRequest.previewSnapshot, submissionSnapshot: cachedRequest.submissionSnapshot, storyCardData: cachedRequest.storyCardData, packageSnapshot: cachedRequest.packageSnapshot, artisanReview: cachedRequest.artisanReview }
      : reviewFromRow(requestResult.data as unknown as ReviewRow);
    cacheDetailRequest(cacheKey, request);
    if (order?.paymentStatus === "paid" && request.status === "PAYMENT_PENDING") {
      request.status = "PAID";
      request.paidAt = request.paidAt ?? new Date().toISOString();
    }
    if (order?.productionStatus === "in_production" && ["PAYMENT_PENDING", "PAID"].includes(request.status)) request.status = "IN_PRODUCTION";
    const resolvedMessages=await Promise.all((messages.data??[]).slice().reverse().map(async row=>({...messageFromRow(row),attachmentUrl:await signedChatAttachment(row.attachment_url)})));
    return { request, messages: resolvedMessages, activity: (activity.data ?? []).slice().reverse().map(activityFromRow), order, hasOlderMessages: (messages.data?.length ?? 0) === 30 };
  },

  async createDescribedCreationPreview(input: BespokeSubmissionInput, sourceDraftId: string, existingPreviewId?: string): Promise<ReviewRequest> {
    await verifiedUserId();
    const stamp = new Date().toISOString();
    const snapshot = createDescribedCreationSnapshot(input, stamp, sourceDraftId ?? null);
    const provisional: ReviewRequest = {
      id: existingPreviewId ?? `bespoke-${globalThis.crypto.randomUUID()}`, userId: "", creationId: `creation-${globalThis.crypto.randomUUID()}`,
      assignedReviewerId: null, assignedAt: null,
      requestNumber: "Preview only", status: "DRAFT_PREVIEW", creationMode: "described", previewSnapshot: snapshot,
      submissionId: null, submissionSnapshot: null, perfumeName: snapshot.perfumeName, concentration: snapshot.concentration,
      bottleSize: "To be confirmed", fragranceDirection: snapshot.preferredNotes, topNotes: [], heartNotes: [], baseNotes: [],
      fragranceBrief: snapshot.writtenStory, storyCardData: { title: snapshot.title, subtitle: "A personal story awaiting artisan interpretation.", imageUrl: "/assets/images/my-artisan-id-conservatory.webp" },
      customerNotes: snapshot.notesToAvoid.length ? `Please avoid: ${snapshot.notesToAvoid.join(", ")}.` : "",
      countryCode: "ID", pricingRegion: "Indonesia", currency: "IDR", estimatedPriceMin: 699000, estimatedPriceMax: 1499000,
      finalPrice: null, artisanReview: null, recommendedAdjustments: [], includedItems: [], estimatedProduction: null, revisionsIncluded: null,
      selectedPackageId: null, packageSnapshot: null, submittedAt: null, reviewedAt: null, approvedAt: null,
      consultationStartedAt: null, consultationCompletedAt: null, readyForPaymentAt: null,
      paidAt: null, shippedAt: null, completedAt: null, lastUpdatedAt: stamp
    };
    const response = await getSupabaseClient().rpc("create_review_preview", { request_payload: previewPayload(provisional) });
    if (response.error || !response.data) {
      const detail = response.error?.message?.trim();
      const alreadyLinked = response.error?.code === "23505" || detail?.toLowerCase().includes("already has a project");
      if (alreadyLinked) {
        const existing = (await loadFullRequestsForLegacyRecovery()).find(request => request.previewSnapshot?.sourceDraftId === sourceDraftId);
        if (existing) return existing;
      }
      throw new OrderServiceError(detail || "Unable to create your Describe Your Creation preview.", response.error);
    }
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
      assignedReviewerId: null, assignedAt: null,
      requestNumber: "Preview only", status: "DRAFT_PREVIEW", creationMode: "artisan_bench", previewSnapshot: snapshot,
      submissionId: null, submissionSnapshot: null, perfumeName: snapshot.perfumeName, concentration: state.fragranceBrief?.concentration || state.concentration.toUpperCase(),
      bottleSize: "To be confirmed", fragranceDirection: snapshot.moodOrDirection, topNotes: notesFor("top"), heartNotes: notesFor("heart"), baseNotes: notesFor("base"),
      fragranceBrief: state.fragranceBrief?.concept || "Artisan Bench formula preview awaiting completion.",
      storyCardData: {
        title: state.storyCard?.perfumeName || snapshot.perfumeName,
        subtitle: state.storyCard?.conceptLine || "A fragrance composed at the Artisan Bench.",
        imageUrl: "/assets/images/my-artisan-id-conservatory.webp"
      },
      customerNotes: state.perfumerNotes?.trim() || state.fragranceBrief?.internalBrief || "",
      countryCode: "ID", pricingRegion: "Indonesia", currency: "IDR", estimatedPriceMin: 699000, estimatedPriceMax: 1499000,
      finalPrice: null, artisanReview: null, recommendedAdjustments: [], includedItems: [], estimatedProduction: null, revisionsIncluded: null,
      selectedPackageId: null, packageSnapshot: null, submittedAt: null, reviewedAt: null, approvedAt: null,
      consultationStartedAt: null, consultationCompletedAt: null, readyForPaymentAt: null,
      paidAt: null, shippedAt: null, completedAt: null, lastUpdatedAt: stamp
    };
    const response = await getSupabaseClient().rpc("create_review_preview", { request_payload: previewPayload(provisional) });
    if (response.error || !response.data) throw new OrderServiceError("Unable to prepare your Artisan Bench creation review.", response.error);
    emitChange();
    return reviewFromRow(response.data);
  },

  async submitForReview(requestId: string) { await verifiedUserId(); return rpcReview("submit_review_request", { target_request_id: requestId }); },

  async getCommissionPackages(): Promise<CommissionPackage[]> {
    return withTtlCache("commission-packages:active", 10 * 60 * 1000, async () => {
      const response = await getSupabaseClient().from("commission_packages").select("id,slug,name,tagline,description,amount,currency,estimated_production,revisions_included,included_items,is_featured,is_active,display_order,created_at,updated_at").eq("is_active", true).order("display_order");
      if (response.error) throw new OrderServiceError("Commission packages could not be loaded.", response.error);
      return (response.data ?? []).map(packageFromRow);
    });
  },

  async selectCommissionPackage(requestId: string, packageId: string): Promise<ServiceResult<ReviewRequest>> {
    await verifiedUserId();
    const response = await getSupabaseClient().rpc("select_review_package", { target_request_id: requestId, target_package_id: packageId });
    if (response.error || !response.data) return { ok: false, error: response.error?.message ?? "The package could not be selected." };
    emitChange();
    return { ok: true, data: reviewFromRow(response.data) };
  },

  async updateStatus(requestId: string, status: WorkflowStatus, actor: WorkflowActor, label?: string): Promise<ServiceResult<ReviewRequest>> {
    await verifiedUserId();
    if (actor !== "customer") return { ok: false, error: "Staff workflow changes require the upcoming administrative backend." };
    const detail = await this.getDetail(requestId);
    if (!detail) return { ok: false, error: "Request not found." };
    if (!canTransition(detail.request.status, status, actor)) return { ok: false, error: `Customer cannot move ${detail.request.status} to ${status}.` };
    return rpcReview("customer_transition_review_request", { target_request_id: requestId, next_status: status, activity_label: label });
  },

  async setFinalPrice(): Promise<ServiceResult> { return { ok: false, error: "Final pricing requires the upcoming administrative backend." }; },

  async sendMessage(requestId: string, message: string, senderRole: "customer" | "artisan" = "customer", attachment?: File): Promise<ServiceResult> {
    await verifiedUserId();
    if (senderRole !== "customer") return { ok: false, error: "Artisan messages require the upcoming staff workspace." };
    const detail = await this.getDetail(requestId);
    if (!detail) return { ok: false, error: "Request not found." };
    if (!isChatAvailable(detail.request.status)) return { ok: false, error: "Chat is not available for this status." };
    if(!message.trim()&&!attachment)return {ok:false,error:"Add a message or an image."};
    let attachmentPath:string|null=null;
    try{attachmentPath=attachment?await uploadCustomerChatImage(requestId,attachment):null}catch(cause){return {ok:false,error:cause instanceof Error?cause.message:"The image could not be uploaded."}}
    const response = await (getSupabaseClient() as any).rpc("send_customer_request_message_with_attachment", { target_request_id: requestId, message_body: message.trim(), attachment_path:attachmentPath });
    if (response.error) return { ok: false, error: response.error.message };
    emitChange();
    return { ok: true };
  },

  getCheckoutSelection() { return readLocal<string[]>(ORDER_STORAGE_KEYS.checkout, []); },
  setCheckoutSelection(requestIds: string[]) { localStorage.setItem(ORDER_STORAGE_KEYS.checkout, JSON.stringify([...new Set(requestIds)])); },
  async getCheckoutEligibleRequests() {
    return (await loadCheckoutRequests()).filter(item => isCheckoutAvailable(item.status) && item.finalPrice !== null && item.finalPrice > 0 && validCurrency(item.currency) && Boolean(item.selectedPackageId && item.submissionId));
  },

  async createCheckout(requestIds: string[], details: CheckoutDetails): Promise<ServiceResult<Order>> {
    await verifiedUserId();
    const selected = (await loadCheckoutRequests()).filter(item => requestIds.includes(item.id));
    const validationError = validateCheckoutCandidates(selected.map(item => ({ ...item, hasSubmissionSnapshot: true })));
    if (validationError) return { ok: false, error: validationError };
    const response = await getSupabaseClient().rpc("create_order_checkout", { request_ids: [...new Set(requestIds)], checkout_payload: clone(details) as unknown as Json });
    if (response.error || !response.data) return { ok: false, error: response.error?.message ?? "Checkout could not be created." };
    const items = await getSupabaseClient().from("order_items").select(ORDER_ITEM_COLUMNS).eq("order_id", response.data.id).order("created_at");
    if (items.error) return { ok: false, error: items.error.message };
    this.setCheckoutSelection([]); emitChange();
    return { ok: true, data: orderFromRows(response.data, items.data ?? []) };
  },

  async simulatePaymentConfirmation(): Promise<ServiceResult> {
    return { ok: false, error: "Payment confirmation must be performed by a trusted server webhook." };
  }
};
