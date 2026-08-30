import type { ArtisanBenchState } from "../types/perfumeDraft";

const DATABASE_NAME = "hall-of-artisans";
const DATABASE_VERSION = 1;
const STORE_NAME = "artisan-bench-working-sessions";
const FALLBACK_PREFIX = "hallOfArtisans.artisanBenchWorkingSession.v1:";

export type ArtisanBenchWorkingSession = {
  key: string;
  state: ArtisanBenchState;
  baseDraftId: string | null;
  savedAt: string;
};

const validSession = (value: unknown): value is ArtisanBenchWorkingSession => {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<ArtisanBenchWorkingSession>;
  return typeof session.key === "string" && typeof session.savedAt === "string" &&
    Boolean(session.state && Array.isArray(session.state.formula) && session.state.formulaMetadata);
};

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME, { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
}

function fallbackRead(key: string): ArtisanBenchWorkingSession | null {
  try {
    const value = JSON.parse(localStorage.getItem(`${FALLBACK_PREFIX}${key}`) || "null") as unknown;
    return validSession(value) ? value : null;
  } catch {
    return null;
  }
}

function fallbackWrite(session: ArtisanBenchWorkingSession) {
  try { localStorage.setItem(`${FALLBACK_PREFIX}${session.key}`, JSON.stringify(session)); } catch { /* Storage can be unavailable or full. */ }
}

function fallbackClear(key: string) {
  try { localStorage.removeItem(`${FALLBACK_PREFIX}${key}`); } catch { /* Storage can be unavailable. */ }
}

export async function readArtisanBenchWorkingSession(key: string): Promise<ArtisanBenchWorkingSession | null> {
  const database = await openDatabase();
  if (!database) return fallbackRead(key);
  return new Promise((resolve) => {
    const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(key);
    request.onsuccess = () => { database.close(); resolve(validSession(request.result) ? request.result : fallbackRead(key)); };
    request.onerror = () => { database.close(); resolve(fallbackRead(key)); };
  });
}

export async function saveArtisanBenchWorkingSession(key: string, state: ArtisanBenchState, baseDraftId: string | null): Promise<void> {
  const session: ArtisanBenchWorkingSession = { key, state, baseDraftId, savedAt: new Date().toISOString() };
  const database = await openDatabase();
  if (!database) return fallbackWrite(session);
  await new Promise<void>((resolve) => {
    const request = database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(session);
    request.onsuccess = () => { database.close(); fallbackClear(key); resolve(); };
    request.onerror = () => { database.close(); fallbackWrite(session); resolve(); };
  });
}

export async function clearArtisanBenchWorkingSession(key: string): Promise<void> {
  fallbackClear(key);
  const database = await openDatabase();
  if (!database) return;
  await new Promise<void>((resolve) => {
    const request = database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(key);
    request.onsuccess = () => { database.close(); resolve(); };
    request.onerror = () => { database.close(); resolve(); };
  });
}
