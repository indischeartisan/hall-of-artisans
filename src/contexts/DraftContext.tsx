import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import * as storage from "../services/draftStorage";
import type { NewDraftData, PerfumeDraft } from "../types/perfumeDraft";

interface DraftContextValue {
  drafts: PerfumeDraft[];
  activeDraft: PerfumeDraft | null;
  createDraft(data: NewDraftData): PerfumeDraft;
  saveDraft(id: string, changes: Partial<NewDraftData>): PerfumeDraft | undefined;
  loadDraft(id: string): PerfumeDraft | undefined;
  deleteDraft(id: string): void;
  duplicateDraft(id: string): PerfumeDraft | undefined;
  clearActiveDraft(): void;
  clearDrafts(): void;
}

const DraftContext = createContext<DraftContextValue | null>(null);

export function DraftProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useState(storage.getDrafts);
  const [activeDraft, setActiveDraft] = useState<PerfumeDraft | null>(null);
  const refresh = useCallback(() => setDrafts(storage.getDrafts()), []);

  const value = useMemo<DraftContextValue>(() => ({
    drafts,
    activeDraft,
    createDraft(data) { const result = storage.createDraft(data); setActiveDraft(result); refresh(); return result; },
    saveDraft(id, changes) { const result = storage.updateDraft(id, changes); if (result) setActiveDraft(result); refresh(); return result; },
    loadDraft(id) { const result = storage.getDraftById(id); if (result) setActiveDraft(result); return result; },
    deleteDraft(id) { storage.deleteDraft(id); if (activeDraft?.id === id) setActiveDraft(null); refresh(); },
    duplicateDraft(id) { const result = storage.duplicateDraft(id); refresh(); return result; },
    clearActiveDraft() { setActiveDraft(null); },
    clearDrafts() { storage.clearDrafts(); setActiveDraft(null); refresh(); }
  }), [activeDraft, drafts, refresh]);

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useDrafts() {
  const context = useContext(DraftContext);
  if (!context) throw new Error("useDrafts must be used within DraftProvider");
  return context;
}
