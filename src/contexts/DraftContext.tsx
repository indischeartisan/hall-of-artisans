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
  loadingMore: boolean;
  hasMore: boolean;
  error: string;
  source: DraftStorageSource;
  refresh(): Promise<void>;
  loadMore(): Promise<void>;
  createDraft(data: NewDraftData): Promise<PerfumeDraft>;
  createDescribedDraft(data: NewDescribedDraftData): Promise<DescribedCreationDraft>;
  saveDraft(id: string, changes: Partial<CreationDraft>): Promise<CreationDraft | undefined>;
  renameDraft(id: string, draftName: string): Promise<void>;
  loadDraft(id: string): Promise<CreationDraft | undefined>;
  deleteDraft(id: string): Promise<void>;
  duplicateDraft(id: string): Promise<CreationDraft | undefined>;
  clearActiveDraft(): void;
  clearDrafts(): Promise<void>;
}

const DraftContext = createContext<DraftContextValue | null>(null);
const DRAFT_LIST_PAGE_SIZE = 20;
const DRAFT_LIST_CACHE_TTL_MS = 60_000;
type DraftListCache = {
  key: string;
  drafts: DraftSummary[];
  source: DraftStorageSource;
  hasMore: boolean;
  cachedAt: number;
};
let draftListCache: DraftListCache | null = null;
let draftListFetch: { key: string; promise: ReturnType<typeof draftRepository.list> } | null = null;
const errorMessage = (error: unknown) => error instanceof DraftRepositoryError ? error.message : "The draft request could not be completed.";
const summarize = (draft: CreationDraft): DraftSummary => ({
  id: draft.id,
  schemaVersion: draft.schemaVersion,
  mode: draft.mode,
  draftName: draft.draftName,
  perfumeName: draft.perfumeName,
  status: draft.status,
  createdAt: draft.createdAt,
  updatedAt: draft.updatedAt
});

export function DraftProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [activeDraft, setActiveDraft] = useState<CreationDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState<DraftStorageSource>("local");

  const cacheKey = user?.id ?? "local";
  const patchCachedDrafts = useCallback((update: (current: DraftSummary[]) => DraftSummary[]) => {
    setDrafts((current) => {
      const next = update(current);
      draftListCache = {
        key: cacheKey,
        drafts: next,
        source: user ? "supabase" : "local",
        hasMore,
        cachedAt: Date.now()
      };
      return next;
    });
  }, [cacheKey, hasMore, user]);

  const refresh = useCallback(async () => {
    const cached = draftListCache;
    if (cached?.key === cacheKey && Date.now() - cached.cachedAt <= DRAFT_LIST_CACHE_TTL_MS) {
      setDrafts(cached.drafts);
      setSource(cached.source);
      setHasMore(cached.hasMore);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const request = draftListFetch?.key === cacheKey
        ? draftListFetch.promise
        : draftRepository.list(user?.id ?? null, 0, DRAFT_LIST_PAGE_SIZE);
      draftListFetch = { key: cacheKey, promise: request };
      const result = await request;
      setDrafts(result.drafts);
      setSource(result.source);
      setHasMore(result.hasMore);
      draftListCache = { key: cacheKey, ...result, cachedAt: Date.now() };
      setActiveDraft((current) => current && result.drafts.some(draft => draft.id === current.id) ? current : null);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      if (draftListFetch?.key === cacheKey) draftListFetch = null;
      setLoading(false);
    }
  }, [cacheKey, user?.id]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setError("");
    try {
      const result = await draftRepository.list(user?.id ?? null, drafts.length, DRAFT_LIST_PAGE_SIZE);
      const knownIds = new Set(drafts.map((draft) => draft.id));
      const next = [...drafts, ...result.drafts.filter((draft) => !knownIds.has(draft.id))];
      setDrafts(next);
      setSource(result.source);
      setHasMore(result.hasMore);
      draftListCache = { key: cacheKey, drafts: next, source: result.source, hasMore: result.hasMore, cachedAt: Date.now() };
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoadingMore(false);
    }
  }, [cacheKey, drafts, hasMore, loadingMore, user?.id]);

  // Clear in-memory data on account changes without downloading every draft.
  useEffect(() => {
    setDrafts([]);
    setActiveDraft(null);
    setError("");
    setSource("local");
    setHasMore(false);
  }, [user?.id]);

  const createDraft = useCallback(async (data: NewDraftData) => {
    setError("");
    try {
      const result = await draftRepository.createArtisan(data, user?.id ?? null);
      if (result.mode !== "artisan_bench") throw new DraftRepositoryError("The saved draft has an unexpected creation mode.");
      setActiveDraft(result);
      patchCachedDrafts((current) => [summarize(result), ...current.filter((draft) => draft.id !== result.id)]);
      return result;
    } catch (requestError) {
      setError(errorMessage(requestError));
      throw requestError;
    }
  }, [patchCachedDrafts, user?.id]);

  const createDescribedDraft = useCallback(async (data: NewDescribedDraftData) => {
    setError("");
    try {
      const result = await draftRepository.createDescribed(data, user?.id ?? null);
      if (result.mode !== "described") throw new DraftRepositoryError("The saved draft has an unexpected creation mode.");
      setActiveDraft(result);
      patchCachedDrafts((current) => [summarize(result), ...current.filter((draft) => draft.id !== result.id)]);
      return result;
    } catch (requestError) {
      setError(errorMessage(requestError));
      throw requestError;
    }
  }, [patchCachedDrafts, user?.id]);

  const saveDraft = useCallback(async (id: string, changes: Partial<CreationDraft>) => {
    const existing = activeDraft?.id === id ? activeDraft : await draftRepository.get(id, user?.id ?? null) ?? undefined;
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
      const result = await draftRepository.save(updated, user?.id ?? null);
      setActiveDraft(result);
      patchCachedDrafts((current) => {
        const metadata = summarize(result);
        return [metadata, ...current.filter((draft) => draft.id !== result.id)];
      });
      return result;
    } catch (requestError) {
      setError(errorMessage(requestError));
      throw requestError;
    }
  }, [activeDraft, patchCachedDrafts, user?.id]);

  const loadDraft = useCallback(async (id: string) => {
    const result = await draftRepository.get(id, user?.id ?? null) ?? undefined;
    if (result) setActiveDraft(result);
    return result;
  }, [user?.id]);

  const renameDraft = useCallback(async (id: string, draftName: string) => {
    const summary = drafts.find((draft) => draft.id === id);
    if (!summary) return;
    setError("");
    try {
      const metadata = await draftRepository.rename(id, draftName, user?.id ?? null);
      patchCachedDrafts((current) => {
        const existing = current.find((draft) => draft.id === id);
        if (!existing) return current;
        const updated = { ...existing, draftName: metadata.draft_name, updatedAt: metadata.updated_at };
        return [updated, ...current.filter((draft) => draft.id !== id)];
      });
      setActiveDraft((current) => current?.id === id
        ? { ...current, draftName: metadata.draft_name, updatedAt: metadata.updated_at } as CreationDraft
        : current);
    } catch (requestError) {
      setError(errorMessage(requestError));
      throw requestError;
    }
  }, [drafts, patchCachedDrafts, user?.id]);

  const deleteDraft = useCallback(async (id: string) => {
    setError("");
    try {
      await draftRepository.remove(id, user?.id ?? null);
      setActiveDraft((current) => current?.id === id ? null : current);
      patchCachedDrafts((current) => current.filter((draft) => draft.id !== id));
    } catch (requestError) {
      setError(errorMessage(requestError));
      throw requestError;
    }
  }, [patchCachedDrafts, user?.id]);

  const duplicateDraft = useCallback(async (id: string) => {
    const sourceDraft = await draftRepository.get(id, user?.id ?? null) ?? undefined;
    if (!sourceDraft) return undefined;
    setError("");
    try {
      const result = await draftRepository.duplicate(sourceDraft, user?.id ?? null);
      patchCachedDrafts((current) => [summarize(result), ...current.filter((draft) => draft.id !== result.id)]);
      return result;
    } catch (requestError) {
      setError(errorMessage(requestError));
      throw requestError;
    }
  }, [patchCachedDrafts, user?.id]);

  const clearDrafts = useCallback(async () => {
    setError("");
    try {
      await draftRepository.clearAll(user?.id ?? null);
      setDrafts([]);
      setHasMore(false);
      draftListCache = { key: cacheKey, drafts: [], source: user ? "supabase" : "local", hasMore: false, cachedAt: Date.now() };
      setActiveDraft(null);
    } catch (requestError) {
      setError(errorMessage(requestError));
      throw requestError;
    }
  }, [cacheKey, user, user?.id]);

  const value = useMemo<DraftContextValue>(() => ({
    drafts, activeDraft, loading, loadingMore, hasMore, error, source, refresh, loadMore, createDraft, createDescribedDraft,
    saveDraft, renameDraft, loadDraft, deleteDraft, duplicateDraft,
    clearActiveDraft: () => setActiveDraft(null), clearDrafts
  }), [activeDraft, clearDrafts, createDescribedDraft, createDraft, deleteDraft, drafts, duplicateDraft, error, hasMore, loadDraft, loading, loadingMore, loadMore, refresh, renameDraft, saveDraft, source]);

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useDrafts() {
  const context = useContext(DraftContext);
  if (!context) throw new Error("useDrafts must be used within DraftProvider");
  return context;
}
