import {
  DRAFT_SCHEMA_VERSION,
  type CreationDraft,
  type DescribedCreationDraft,
  type PerfumeDraft
} from "../types/perfumeDraft";

export const DRAFT_STORAGE_KEY = "hallOfArtisans.perfumeDrafts.v1";

const storageAvailable = () => typeof window !== "undefined" && Boolean(window.localStorage);

function isArtisanBenchDraft(value: unknown): value is Omit<PerfumeDraft, "mode"> & { mode?: "artisan_bench" } {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<PerfumeDraft>;
  return draft.schemaVersion === DRAFT_SCHEMA_VERSION && typeof draft.id === "string" &&
    typeof draft.draftName === "string" && typeof draft.createdAt === "string" &&
    typeof draft.updatedAt === "string" && Array.isArray(draft.formula) &&
    Boolean(draft.benchState && Array.isArray(draft.benchState.formula));
}

function isDescribedDraft(value: unknown): value is DescribedCreationDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<DescribedCreationDraft>;
  return draft.mode === "described" && draft.schemaVersion === DRAFT_SCHEMA_VERSION &&
    typeof draft.id === "string" && typeof draft.draftName === "string" &&
    typeof draft.createdAt === "string" && typeof draft.updatedAt === "string" &&
    Boolean(draft.letter && typeof draft.letter.creationTitle === "string" && typeof draft.letter.story === "string" &&
      Array.isArray(draft.letter.preferredNotes) && Array.isArray(draft.letter.notesToAvoid));
}

function normalizeDraft(value: unknown): CreationDraft | null {
  if (isDescribedDraft(value)) return value;
  if (isArtisanBenchDraft(value)) return { ...value, mode: "artisan_bench" };
  return null;
}

function readEntries(): unknown[] {
  if (!storageAvailable()) return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(DRAFT_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(drafts: CreationDraft[]) {
  if (storageAvailable()) window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
}

export function getDrafts(): CreationDraft[] {
  return readEntries().map(normalizeDraft).filter((draft): draft is CreationDraft => Boolean(draft))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export const getDraftById = (id: string) => getDrafts().find((draft) => draft.id === id);

export function saveDraft(draft: CreationDraft): CreationDraft {
  const drafts = getDrafts();
  const index = drafts.findIndex((item) => item.id === draft.id);
  if (index >= 0) drafts[index] = draft;
  else drafts.unshift(draft);
  persist(drafts);
  return draft;
}

export function deleteDraft(id: string) {
  persist(getDrafts().filter((draft) => draft.id !== id));
}

export function clearDrafts() {
  persist([]);
}
