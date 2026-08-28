import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DraftRepositoryError, draftRepository, type DraftStorageSource } from "../services/draftRepository";
import { useAuth } from "./AuthContext";
import type {
  CreationDraft,
  DraftSummary,
  DescribedCreationDraft,
  NewDescribedDraftData,
  NewDraftData,
  PerfumeDraft
} from "../types/perfumeDraft";

interface DraftContextValue {
  drafts: DraftSummary[];
  activeDraft: CreationDraft | null;
  loading: boolean;
  error: string;
  source: DraftStorageSource;
  refresh(): Promise<void>;
  createDraft(data: NewDraftData): Promise<PerfumeDraft>;
  createDescribedDraft(data: NewDescribedDraftData): Promise<DescribedCreationDraft>;
  saveDraft(id: string, changes: Partial<CreationDraft>): Promise<CreationDraft | undefined>;
  loadDraft(id: string): Promise<CreationDraft | undefined>;
  deleteDraft(id: string): Promise<void>;
  duplicateDraft(id: string): Promise<CreationDraft | undefined>;
  clearActiveDraft(): void;
  clearDrafts(): Promise<void>;
}

const DraftContext = createContext<DraftContextValue | null>(null);
const errorMessage = (error: unknown) => error instanceof DraftRepositoryError ? error.message : "The draft request could not be completed.";

export function DraftProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [activeDraft, setActiveDraft] = useState<CreationDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState<DraftStorageSource>("local");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await draftRepository.list();
      setDrafts(result.drafts);
      setSource(result.source);
      setActiveDraft((current) => current && result.drafts.some(draft => draft.id === current.id) ? current : null);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear in-memory data on account changes without downloading every draft.
  useEffect(() => {
    setDrafts([]);
    setActiveDraft(null);
    setError("");
    setSource("local");
  }, [user?.id]);

  const createDraft = useCallback(async (data: NewDraftData) => {
    setError("");
    try {
      const result = await draftRepository.createArtisan(data);
      if (result.mode !== "artisan_bench") throw new DraftRepositoryError("The saved draft has an unexpected creation mode.");
      setActiveDraft(result);
      await refresh();
      return result;
    } catch (requestError) {
      setError(errorMessage(requestError));
      throw requestError;
    }
  }, [refresh]);

  const createDescribedDraft = useCallback(async (data: NewDescribedDraftData) => {
    setError("");
    try {
      const result = await draftRepository.createDescribed(data);
      if (result.mode !== "described") throw new DraftRepositoryError("The saved draft has an unexpected creation mode.");
      setActiveDraft(result);
      await refresh();
      return result;
    } catch (requestError) {
      setError(errorMessage(requestError));
      throw requestError;
    }
  }, [refresh]);

  const saveDraft = useCallback(async (id: string, changes: Partial<CreationDraft>) => {
    const existing = activeDraft?.id === id ? activeDraft : await draftRepository.get(id) ?? undefined;
    if (!existing) return undefined;
    setError("");
    try {
      const updated = {
        ...existing,
        ...changes,
        id: existing.id,
        mode: existing.mode,
        schemaVersion: existing.schemaVersion,
        createdAt: existing.createdAt
      } as CreationDraft;
      const result = await draftRepository.save(updated);
      setActiveDraft(result);
      await refresh();
      return result;
    } catch (requestError) {
      setError(errorMessage(requestError));
      throw requestError;
    }
  }, [activeDraft, drafts, refresh]);

  const loadDraft = useCallback(async (id: string) => {
    const result = await draftRepository.get(id) ?? undefined;
    if (result) setActiveDraft(result);
    return result;
  }, []);

  const deleteDraft = useCallback(async (id: string) => {
    setError("");
    try {
      await draftRepository.remove(id);
      setActiveDraft((current) => current?.id === id ? null : current);
      await refresh();
    } catch (requestError) {
      setError(errorMessage(requestError));
      throw requestError;
    }
  }, [refresh]);

  const duplicateDraft = useCallback(async (id: string) => {
    const sourceDraft = await draftRepository.get(id) ?? undefined;
    if (!sourceDraft) return undefined;
    setError("");
    try {
      const result = await draftRepository.duplicate(sourceDraft);
      await refresh();
      return result;
    } catch (requestError) {
      setError(errorMessage(requestError));
      throw requestError;
    }
  }, [drafts, refresh]);

  const clearDrafts = useCallback(async () => {
    await Promise.all(drafts.map((draft) => draftRepository.remove(draft.id)));
    setActiveDraft(null);
    await refresh();
  }, [drafts, refresh]);

  const value = useMemo<DraftContextValue>(() => ({
    drafts, activeDraft, loading, error, source, refresh, createDraft, createDescribedDraft,
    saveDraft, loadDraft, deleteDraft, duplicateDraft,
    clearActiveDraft: () => setActiveDraft(null), clearDrafts
  }), [activeDraft, clearDrafts, createDescribedDraft, createDraft, deleteDraft, drafts, duplicateDraft, error, loadDraft, loading, refresh, saveDraft, source]);

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useDrafts() {
  const context = useContext(DraftContext);
  if (!context) throw new Error("useDrafts must be used within DraftProvider");
  return context;
}
