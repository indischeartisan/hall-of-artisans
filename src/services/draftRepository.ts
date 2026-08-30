import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabase";
import type { Json, Tables, TablesInsert, TablesUpdate } from "../types/database.types";
import {
  DRAFT_SCHEMA_VERSION,
  type CreationDraft,
  type DraftSummary,
  type DescribedCreationDraft,
  type NewDescribedDraftData,
  type NewDraftData,
  type PerfumeDraft
} from "../types/perfumeDraft";
import * as localStorageRepository from "./draftStorage";
import { normalizeArtisanDraftContent } from "./draftNormalization";

type DraftRow = Tables<"creation_drafts">;
type DraftInsert = TablesInsert<"creation_drafts">;
type DraftUpdate = TablesUpdate<"creation_drafts">;
export type DraftStorageSource = "local" | "supabase";
export type DraftRenameResult = Pick<DraftRow, "id" | "draft_name" | "updated_at">;
export type DraftListPage = { drafts: DraftSummary[]; source: DraftStorageSource; hasMore: boolean };

const DRAFT_LIST_COLUMNS = "id,draft_name,mode,perfume_name,status,created_at,updated_at";
const DRAFT_WRITE_COLUMNS = "id,draft_name,mode,status,updated_at";
const DRAFT_RENAME_COLUMNS = "id,draft_name,updated_at";
const ARTISAN_DRAFT_PAYLOAD_VERSION = 2;

export class DraftRepositoryError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "DraftRepositoryError";
  }
}

const now = () => new Date().toISOString();
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `draft-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

async function authenticatedUserId(knownUserId?: string | null): Promise<string | null> {
  if (knownUserId !== undefined) return knownUserId;
  if (!isSupabaseConfigured) return null;
  const client = getSupabaseClient();
  const sessionResult = await client.auth.getSession();
  if (sessionResult.error) throw new DraftRepositoryError("Unable to read the current sign-in session.", sessionResult.error);
  if (!sessionResult.data.session) return null;
  const userResult = await client.auth.getUser();
  if (userResult.error || !userResult.data.user) {
    throw new DraftRepositoryError("Your sign-in session could not be verified. Please sign in again.", userResult.error);
  }
  return userResult.data.user.id;
}

function payloadFor(draft: CreationDraft): Json {
  if (draft.mode === "described") return { letter: clone(draft.letter) } as unknown as Json;
  return {
    formatVersion: ARTISAN_DRAFT_PAYLOAD_VERSION,
    formula: clone(draft.formula),
    formulaMetadata: clone(draft.formulaMetadata),
    fragranceBrief: draft.fragranceBrief ? clone(draft.fragranceBrief) : null,
    storyCard: draft.storyCard ? clone(draft.storyCard) : null,
    benchState: clone(draft.benchState)
  } as unknown as Json;
}

function rowToDraft(row: DraftRow): CreationDraft | null {
  if (!row.payload || typeof row.payload !== "object" || Array.isArray(row.payload)) return null;
  const payload = row.payload as Record<string, unknown>;
  if (row.mode === "described") {
    const letter = payload.letter as DescribedCreationDraft["letter"] | undefined;
    if (!letter || typeof letter.creationTitle !== "string" || typeof letter.story !== "string" ||
      !Array.isArray(letter.preferredNotes) || !Array.isArray(letter.notesToAvoid)) return null;
    return {
      id: row.id,
      schemaVersion: row.schema_version,
      mode: "described",
      draftName: row.draft_name,
      perfumeName: row.perfume_name ?? undefined,
      letter: clone(letter),
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  const normalized = normalizeArtisanDraftContent(payload);
  if (!normalized) return null;
  return {
    id: row.id,
    schemaVersion: row.schema_version,
    mode: "artisan_bench",
    draftName: row.draft_name,
    perfumeName: row.perfume_name ?? undefined,
    formula: clone(normalized.formula),
    formulaMetadata: clone(normalized.formulaMetadata),
    fragranceBrief: normalized.fragranceBrief ? clone(normalized.fragranceBrief) : undefined,
    storyCard: normalized.storyCard ? clone(normalized.storyCard) : undefined,
    benchState: clone(normalized.benchState),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function insertFor(draft: CreationDraft, userId: string): DraftInsert {
  return {
    id: draft.id,
    user_id: userId,
    mode: draft.mode,
    schema_version: draft.schemaVersion,
    draft_name: draft.draftName,
    perfume_name: draft.perfumeName ?? null,
    status: draft.status,
    payload: payloadFor(draft)
  };
}

function updateFor(draft: CreationDraft): DraftUpdate {
  return {
    schema_version: draft.schemaVersion,
    draft_name: draft.draftName,
    perfume_name: draft.perfumeName ?? null,
    status: draft.status,
    payload: payloadFor(draft)
  };
}

async function list(knownUserId?: string | null, offset = 0, limit = 20): Promise<DraftListPage> {
  const userId = await authenticatedUserId(knownUserId);
  if (!userId) {
    const allDrafts = localStorageRepository.getDrafts();
    return { drafts: allDrafts.slice(offset, offset + limit), source: "local", hasMore: offset + limit < allDrafts.length };
  }
  const { data, error } = await getSupabaseClient().from("creation_drafts")
    .select(DRAFT_LIST_COLUMNS)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new DraftRepositoryError("Unable to load your saved drafts.", error);
  const drafts: DraftSummary[] = (data ?? []).map(row => ({
    id: row.id, mode: row.mode, schemaVersion: DRAFT_SCHEMA_VERSION, draftName: row.draft_name,
    perfumeName: row.perfume_name ?? undefined, status: row.status,
    createdAt: row.created_at, updatedAt: row.updated_at
  }));
  return { drafts, source: "supabase", hasMore: drafts.length === limit };
}

async function get(id: string, knownUserId?: string | null): Promise<CreationDraft | null> {
  const userId = await authenticatedUserId(knownUserId);
  if (!userId) return localStorageRepository.getDrafts().find(draft => draft.id === id) ?? null;
  const { data, error } = await getSupabaseClient().from("creation_drafts")
    .select("id,user_id,mode,schema_version,draft_name,perfume_name,status,payload,created_at,updated_at")
    .eq("id", id).eq("user_id", userId).maybeSingle();
  if (error) throw new DraftRepositoryError("Unable to open this saved draft.", error);
  return data ? rowToDraft(data) : null;
}

async function insert(draft: CreationDraft, knownUserId?: string | null): Promise<CreationDraft> {
  const userId = await authenticatedUserId(knownUserId);
  if (!userId) return localStorageRepository.saveDraft(draft);
  const { data, error } = await getSupabaseClient().from("creation_drafts")
    .insert(insertFor(draft, userId)).select(DRAFT_WRITE_COLUMNS).single();
  if (error || !data) throw new DraftRepositoryError("Unable to save this draft to your account.", error);
  return {
    ...draft,
    id: data.id,
    draftName: data.draft_name,
    mode: data.mode,
    status: data.status,
    updatedAt: data.updated_at
  } as CreationDraft;
}

async function save(draft: CreationDraft, knownUserId?: string | null): Promise<CreationDraft> {
  const updated = { ...draft, updatedAt: now() } as CreationDraft;
  const userId = await authenticatedUserId(knownUserId);
  if (!userId) return localStorageRepository.saveDraft(updated);
  const { data, error } = await getSupabaseClient().from("creation_drafts")
    .update(updateFor(updated)).eq("id", updated.id).eq("user_id", userId).select(DRAFT_WRITE_COLUMNS).single();
  if (error || !data) throw new DraftRepositoryError("Unable to update this draft.", error);
  return {
    ...updated,
    id: data.id,
    draftName: data.draft_name,
    mode: data.mode,
    status: data.status,
    updatedAt: data.updated_at
  } as CreationDraft;
}

async function rename(id: string, draftName: string, knownUserId?: string | null): Promise<DraftRenameResult> {
  const userId = await authenticatedUserId(knownUserId);
  if (!userId) {
    const draft = localStorageRepository.getDraftById(id);
    if (!draft) throw new DraftRepositoryError("This draft could not be found.");
    const updated = localStorageRepository.saveDraft({ ...draft, draftName, updatedAt: now() } as CreationDraft);
    return { id: updated.id, draft_name: updated.draftName, updated_at: updated.updatedAt };
  }
  const { data, error } = await getSupabaseClient().from("creation_drafts")
    .update({ draft_name: draftName }).eq("id", id).eq("user_id", userId)
    .select(DRAFT_RENAME_COLUMNS).single();
  if (error || !data) throw new DraftRepositoryError("Unable to rename this draft.", error);
  return data;
}

async function remove(id: string, knownUserId?: string | null): Promise<void> {
  const userId = await authenticatedUserId(knownUserId);
  if (!userId) return localStorageRepository.deleteDraft(id);
  const { error } = await getSupabaseClient().from("creation_drafts").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new DraftRepositoryError("Unable to delete this draft.", error);
}

async function clearAll(knownUserId?: string | null): Promise<void> {
  const userId = await authenticatedUserId(knownUserId);
  if (!userId) return localStorageRepository.clearDrafts();
  const { error } = await getSupabaseClient().from("creation_drafts").delete().eq("user_id", userId);
  if (error) throw new DraftRepositoryError("Unable to clear your saved drafts.", error);
}

function buildArtisanDraft(data: NewDraftData): PerfumeDraft {
  const timestamp = now();
  return { ...clone(data), id: makeId(), schemaVersion: DRAFT_SCHEMA_VERSION, mode: "artisan_bench", createdAt: timestamp, updatedAt: timestamp };
}

function buildDescribedDraft(data: NewDescribedDraftData): DescribedCreationDraft {
  const timestamp = now();
  return { ...clone(data), id: makeId(), schemaVersion: DRAFT_SCHEMA_VERSION, mode: "described", createdAt: timestamp, updatedAt: timestamp };
}

export const draftRepository = {
  list, get, rename, save, remove, clearAll,
  createArtisan(data: NewDraftData, userId?: string | null) { return insert(buildArtisanDraft(data), userId); },
  createDescribed(data: NewDescribedDraftData, userId?: string | null) { return insert(buildDescribedDraft(data), userId); },
  async duplicate(draft: CreationDraft, userId?: string | null) {
    if (draft.mode === "described") {
      return insert(buildDescribedDraft({ draftName: `${draft.draftName} Copy`, perfumeName: draft.perfumeName, letter: draft.letter, status: "draft" }), userId);
    }
    const { id: _id, schemaVersion: _schemaVersion, mode: _mode, createdAt: _createdAt, updatedAt: _updatedAt, ...data } = draft;
    return insert(buildArtisanDraft({ ...data, draftName: `${draft.draftName} Copy`, status: "draft" }), userId);
  }
};
