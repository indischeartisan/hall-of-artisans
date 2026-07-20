import { DRAFT_SCHEMA_VERSION, type NewDraftData, type PerfumeDraft } from "../types/perfumeDraft";

export const DRAFT_STORAGE_KEY = "hallOfArtisans.perfumeDrafts.v1";

const storageAvailable = () => typeof window !== "undefined" && Boolean(window.localStorage);
const now = () => new Date().toISOString();
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `draft-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

function isDraft(value: unknown): value is PerfumeDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<PerfumeDraft>;
  return draft.schemaVersion === DRAFT_SCHEMA_VERSION && typeof draft.id === "string" &&
    typeof draft.draftName === "string" && typeof draft.createdAt === "string" &&
    typeof draft.updatedAt === "string" && Array.isArray(draft.formula) &&
    Boolean(draft.benchState && Array.isArray(draft.benchState.formula));
}

function readEntries(): unknown[] {
  if (!storageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getDrafts(): PerfumeDraft[] {
  return readEntries().filter(isDraft).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function persist(drafts: unknown[]) {
  if (!storageAvailable()) return;
  window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
}

export const getDraftById = (id: string) => getDrafts().find((draft) => draft.id === id);

export function createDraft(data: NewDraftData): PerfumeDraft {
  const timestamp = now();
  const draft: PerfumeDraft = { ...data, id: makeId(), schemaVersion: DRAFT_SCHEMA_VERSION, createdAt: timestamp, updatedAt: timestamp };
  persist([draft, ...readEntries()]);
  return draft;
}

export function updateDraft(id: string, changes: Partial<NewDraftData>): PerfumeDraft | undefined {
  let updated: PerfumeDraft | undefined;
  const drafts = readEntries().map((entry) => {
    if (!isDraft(entry) || entry.id !== id) return entry;
    const draft = entry;
    updated = { ...draft, ...changes, id: draft.id, schemaVersion: draft.schemaVersion, createdAt: draft.createdAt, updatedAt: now() };
    return updated;
  });
  if (updated) persist(drafts);
  return updated;
}

export function deleteDraft(id: string) { persist(readEntries().filter((entry) => !isDraft(entry) || entry.id !== id)); }

export function duplicateDraft(id: string): PerfumeDraft | undefined {
  const source = getDraftById(id);
  if (!source) return undefined;
  const { id: _id, schemaVersion: _version, createdAt: _created, updatedAt: _updated, ...data } = source;
  return createDraft({ ...data, draftName: `${source.draftName} Copy` });
}

export function clearDrafts() { persist([]); }
