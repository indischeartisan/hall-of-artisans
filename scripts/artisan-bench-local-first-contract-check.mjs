import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../src/pages/ArtisanBenchPage.tsx", import.meta.url), "utf8");
const storage = readFileSync(new URL("../src/services/artisanBenchWorkingSession.ts", import.meta.url), "utf8");

const stateHandler = page.slice(page.indexOf("const onState ="), page.indexOf("const restore ="));
if (!stateHandler.includes("saveArtisanBenchWorkingSession")) throw new Error("Artisan Bench changes must schedule a local working-session save.");
if (!page.includes("WORKING_SESSION_DEBOUNCE_MS = 1_000")) throw new Error("Working-session autosave must remain debounced at about one second.");
if (/draftRepository|getSupabaseClient|createDraft\(|saveDraft\(/.test(stateHandler)) throw new Error("Editing Artisan Bench must not trigger a Supabase write.");
if (/supabase|draftRepository|getSupabaseClient/i.test(storage)) throw new Error("Working-session storage must remain independent from Supabase.");
if (!storage.includes("indexedDB.open")) throw new Error("Working sessions must prefer IndexedDB.");
if (!page.includes("We found an unsaved Artisan Bench session. Restore it?")) throw new Error("Unsaved working sessions must offer recovery.");

console.log("Artisan Bench local-first contract passed: edit events perform zero Supabase writes.");
