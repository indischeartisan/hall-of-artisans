import { useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router";
import GlobalHeader from "../components/GlobalHeader";
import { useDrafts } from "../contexts/DraftContext";

export default function MyDraftsPage() {
  const { drafts, loading, error, source, loadDraft, saveDraft, duplicateDraft, deleteDraft } = useDrafts();
  const [busyId, setBusyId] = useState<string | null>(null);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const previousTitle = document.title;
    document.title = "My Drafts | The Hall of Artisans";
    document.body.classList.add("my-drafts-page");
    return () => { document.title = previousTitle; document.body.classList.remove("my-drafts-page"); };
  }, []);

  const open = async (id: string) => {
    setBusyId(id);
    try {
      const draft = await loadDraft(id);
      if (draft) navigate(draft.mode === "artisan_bench" ? "/artisan-bench" : "/describe-your-creation");
    } catch { /* The shared draft error banner reports the request failure. */ } finally { setBusyId(null); }
  };

  const rename = async (id: string, currentName: string) => {
    const name = window.prompt("Rename draft:", currentName)?.trim();
    if (!name) return;
    setBusyId(id);
    try { await saveDraft(id, { draftName: name }); } catch { /* Reported by DraftContext. */ } finally { setBusyId(null); }
  };

  const duplicate = async (id: string) => {
    setBusyId(id);
    try { await duplicateDraft(id); } catch { /* Reported by DraftContext. */ } finally { setBusyId(null); }
  };

  const remove = async (id: string, name: string) => {
    if (!window.confirm(`Delete “${name}”?`)) return;
    setBusyId(id);
    try { await deleteDraft(id); } catch { /* Reported by DraftContext. */ } finally { setBusyId(null); }
  };

  return (
    <>
      <GlobalHeader activeLabel="My Drafts" />
      <main className="drafts-shell">
        <section className="drafts-panel">
          <p className="drafts-kicker">Personal Record Chamber</p>
          <h1>My Drafts</h1>
          <p className="drafts-intro">{source === "supabase" ? "Private creations saved to your Artisan account." : "Private creations saved on this device."}</p>
          {error && <p className="drafts-empty" role="alert">{error}</p>}
          {loading ? <p className="drafts-empty">Opening your personal records...</p> : !drafts.length ? <p className="drafts-empty">No drafts have been recorded yet.</p> : (
            <div className="drafts-list">
              {drafts.map((draft) => (
                <article className="draft-card" key={draft.id}>
                  <div>
                    <p className="draft-card-mode">{draft.mode === "artisan_bench" ? "Artisan Bench" : "Describe Your Creation"}</p>
                    <h2>{draft.draftName}</h2>
                    <p>{draft.perfumeName || "Untitled creation"}</p>
                    <small>{draft.status === "ready" ? "Ready" : "Draft"} · Updated {new Date(draft.updatedAt).toLocaleString()}</small>
                  </div>
                  <div className="draft-actions">
                    <button disabled={busyId === draft.id} onClick={() => { void open(draft.id); }}>Open</button>
                    <button disabled={busyId === draft.id} onClick={() => { void rename(draft.id, draft.draftName); }}>Rename</button>
                    <button disabled={busyId === draft.id} onClick={() => { void duplicate(draft.id); }}>Duplicate</button>
                    <button disabled={busyId === draft.id} onClick={() => { void remove(draft.id, draft.draftName); }}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
