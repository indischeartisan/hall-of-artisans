import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabase";
import type { Json, Tables, TablesInsert, TablesUpdate } from "../types/database.types";
import {
  DRAFT_SCHEMA_VERSION,
  type CreationDraft,
  type DescribedCreationDraft,
  type NewDescribedDraftData,
  type NewDraftData,
  type PerfumeDraft
} from "../types/perfumeDraft";
import * as localStorageRepository from "./draftStorage";

type DraftRow = Tables<"creation_drafts">;
type DraftInsert = TablesInsert<"creation_drafts">;
type DraftUpdate = TablesUpdate<"creation_drafts">;
export type DraftStorageSource = "local" | "supabase";

export class DraftRepositoryError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "DraftRepositoryError";
  }
}

const now = () => new Date().toISOString();
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `draft-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

async function authenticatedUserId(): Promise<string | null> {
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
  if (draft.mode === "described") return { letter: clone(draft.letter) } as Json;
  return {
    formula: clone(draft.formula),
    formulaMetadata: clone(draft.formulaMetadata),
    fragranceBrief: draft.fragranceBrief ? clone(draft.fragranceBrief) : null,
    storyCard: draft.storyCard ? clone(draft.storyCard) : null,
    benchState: clone(draft.benchState)
  } as Json;
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
  const benchState = payload.benchState as PerfumeDraft["benchState"] | undefined;
  const formula = payload.formula as PerfumeDraft["formula"] | undefined;
  const formulaMetadata = payload.formulaMetadata as PerfumeDraft["formulaMetadata"] | undefined;
  if (!benchState || !Array.isArray(benchState.formula) || !Array.isArray(formula) || !formulaMetadata) return null;
  return {
    id: row.id,
    schemaVersion: row.schema_version,
    mode: "artisan_bench",
    draftName: row.draft_name,
    perfumeName: row.perfume_name ?? undefined,
    formula: clone(formula),
    formulaMetadata: clone(formulaMetadata),
    fragranceBrief: (payload.fragranceBrief as PerfumeDraft["fragranceBrief"] | null) ?? undefined,
    storyCard: (payload.storyCard as PerfumeDraft["storyCard"] | null) ?? undefined,
    benchState: clone(benchState),
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

async function list(): Promise<{ drafts: CreationDraft[]; source: DraftStorageSource }> {
  const userId = await authenticatedUserId();
  if (!userId) return { drafts: localStorageRepository.getDrafts(), source: "local" };
  const { data, error } = await getSupabaseClient().from("creation_drafts")
    .select("*").eq("user_id", userId).order("updated_at", { ascending: false });
  if (error) throw new DraftRepositoryError("Unable to load your saved drafts.", error);
  return { drafts: (data ?? []).map(rowToDraft).filter((draft): draft is CreationDraft => Boolean(draft)), source: "supabase" };
}

async function insert(draft: CreationDraft): Promise<CreationDraft> {
  const userId = await authenticatedUserId();
  if (!userId) return localStorageRepository.saveDraft(draft);
  const { data, error } = await getSupabaseClient().from("creation_drafts")
    .insert(insertFor(draft, userId)).select("*").single();
  const result = data ? rowToDraft(data) : null;
  if (error || !result) throw new DraftRepositoryError("Unable to save this draft to your account.", error);
  return result;
}

async function save(draft: CreationDraft): Promise<CreationDraft> {
  const updated = { ...draft, updatedAt: now() } as CreationDraft;
  const userId = await authenticatedUserId();
  if (!userId) return localStorageRepository.saveDraft(updated);
  const { data, error } = await getSupabaseClient().from("creation_drafts")
    .update(updateFor(updated)).eq("id", updated.id).eq("user_id", userId).select("*").single();
  const result = data ? rowToDraft(data) : null;
  if (error || !result) throw new DraftRepositoryError("Unable to update this draft.", error);
  return result;
}

async function remove(id: string): Promise<void> {
  const userId = await authenticatedUserId();
  if (!userId) return localStorageRepository.deleteDraft(id);
  const { error } = await getSupabaseClient().from("creation_drafts").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new DraftRepositoryError("Unable to delete this draft.", error);
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
  list,
  createArtisan(data: NewDraftData) { return insert(buildArtisanDraft(data)); },
  createDescribed(data: NewDescribedDraftData) { return insert(buildDescribedDraft(data)); },
  save,
  remove,
  async duplicate(draft: CreationDraft) {
    if (draft.mode === "described") {
      return insert(buildDescribedDraft({ draftName: `${draft.draftName} Copy`, perfumeName: draft.perfumeName, letter: draft.letter, status: "draft" }));
    }
    const { id: _id, schemaVersion: _schemaVersion, mode: _mode, createdAt: _createdAt, updatedAt: _updatedAt, ...data } = draft;
    return insert(buildArtisanDraft({ ...data, draftName: `${draft.draftName} Copy`, status: "draft" }));
  }
};
