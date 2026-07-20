import { useLayoutEffect } from "react";
import { useNavigate } from "react-router";
import GlobalHeader from "../components/GlobalHeader";
import { useDrafts } from "../contexts/DraftContext";

export default function MyDraftsPage() {
  const { drafts, loadDraft, saveDraft, duplicateDraft, deleteDraft } = useDrafts();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const previousTitle = document.title;
    document.title = "My Drafts | The Hall of Artisans";
    document.body.classList.add("my-drafts-page");
    return () => { document.title = previousTitle; document.body.classList.remove("my-drafts-page"); };
  }, []);

  return (
    <>
      <GlobalHeader activeLabel="My Drafts" />
      <main className="drafts-shell">
        <section className="drafts-panel">
          <p className="drafts-kicker">Hall Archive</p>
          <h1>My Drafts</h1>
          <p className="drafts-intro">Perfume compositions saved on this device.</p>
          {!drafts.length ? <p className="drafts-empty">No local drafts have been saved yet.</p> : (
            <div className="drafts-list">
              {drafts.map((draft) => (
                <article className="draft-card" key={draft.id}>
                  <div><h2>{draft.draftName}</h2><p>{draft.perfumeName || "Untitled creation"}</p><small>Updated {new Date(draft.updatedAt).toLocaleString()}</small></div>
                  <div className="draft-actions">
                    <button onClick={() => { loadDraft(draft.id); navigate("/artisan-bench"); }}>Open</button>
                    <button onClick={() => { const name = window.prompt("Rename draft:", draft.draftName)?.trim(); if (name) saveDraft(draft.id, { draftName: name }); }}>Rename</button>
                    <button onClick={() => duplicateDraft(draft.id)}>Duplicate</button>
                    <button onClick={() => { if (window.confirm(`Delete “${draft.draftName}”?`)) deleteDraft(draft.id); }}>Delete</button>
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
