import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useDrafts } from "../contexts/DraftContext";
import { orderService } from "../features/orders/orderService";
import type { CreationDraft, DraftMode } from "../types/perfumeDraft";

type DraftsModalProps = {
  open: boolean;
  onClose: () => void;
  initialMode?: DraftMode;
};

const modeLabel: Record<DraftMode, string> = {
  artisan_bench: "Artisan Bench",
  described: "Describe Your Creation"
};

const destination: Record<DraftMode, string> = {
  artisan_bench: "/artisan-bench",
  described: "/describe-your-creation"
};

function draftDetails(draft: CreationDraft) {
  if (draft.mode === "artisan_bench") {
    return [
      ["Concentration", draft.benchState.concentration.toUpperCase()],
      ["Materials", `${draft.formula.length} selected`],
      ["Formula", `${draft.formulaMetadata.total}% complete`]
    ];
  }
  return [
    ["Story", `${draft.letter.story.length} characters`],
    ["Preferred notes", draft.letter.preferredNotes.join(", ") || "None recorded"],
    ["Notes to avoid", draft.letter.notesToAvoid.join(", ") || "None recorded"]
  ];
}

export default function DraftsModal({ open, onClose, initialMode }: DraftsModalProps) {
  const navigate = useNavigate();
  const { drafts, loading, error, source, refresh, loadDraft, saveDraft, duplicateDraft, deleteDraft } = useDrafts();
  const [mode, setMode] = useState<DraftMode>(initialMode ?? "artisan_bench");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [submittedDraftIds, setSubmittedDraftIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setActionError("");
    void refresh();
    void orderService.getRequests(false).then((requests) => {
      setSubmittedDraftIds(new Set(requests
        .filter((request) => Boolean(request.submissionId))
        .map((request) => request.previewSnapshot?.sourceDraftId)
        .filter((id): id is string => Boolean(id))));
    }).catch(() => setSubmittedDraftIds(new Set()));
  }, [open, refresh]);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("modal-open");
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose, open]);

  const grouped = useMemo(() => ({
    artisan_bench: drafts.filter((draft) => draft.mode === "artisan_bench"),
    described: drafts.filter((draft) => draft.mode === "described")
  }), [drafts]);

  useEffect(() => {
    if (!open || initialMode || grouped[mode].length) return;
    const alternate: DraftMode = mode === "artisan_bench" ? "described" : "artisan_bench";
    if (grouped[alternate].length) setMode(alternate);
  }, [grouped, initialMode, mode, open]);

  if (!open) return null;

  const edit = async (draft: CreationDraft) => {
    setBusyId(draft.id);
    setActionError("");
    try {
      const loaded = await loadDraft(draft.id);
      if (!loaded) throw new Error("This draft could not be found.");
      onClose();
      navigate(destination[loaded.mode]);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "This draft could not be opened.");
    } finally { setBusyId(null); }
  };

  const rename = async (draft: CreationDraft) => {
    const name = window.prompt("Rename draft:", draft.draftName)?.trim();
    if (!name) return;
    setBusyId(draft.id);
    setActionError("");
    try { await saveDraft(draft.id, { draftName: name }); }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : "This draft could not be renamed."); }
    finally { setBusyId(null); }
  };

  const duplicate = async (draft: CreationDraft) => {
    setBusyId(draft.id);
    setActionError("");
    try { await duplicateDraft(draft.id); }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : "This draft could not be duplicated."); }
    finally { setBusyId(null); }
  };

  const remove = async (draft: CreationDraft) => {
    if (submittedDraftIds.has(draft.id)) return;
    if (!window.confirm(`Delete “${draft.draftName}”? Its unsubmitted My Orders preview will also be removed.`)) return;
    setBusyId(draft.id);
    setActionError("");
    try { await deleteDraft(draft.id); }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : "This draft could not be deleted."); }
    finally { setBusyId(null); }
  };

  const visibleDrafts = grouped[mode];
  return <div className="artisan-modal drafts-modal">
    <div className="artisan-modal__backdrop" onClick={onClose} />
    <section className="artisan-modal__dialog inner-panel drafts-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="drafts-modal-title">
      <button className="artisan-modal__close" type="button" aria-label="Close My Drafts" onClick={onClose}>×</button>
      <header className="artisan-modal__header">
        <p className="section-kicker">Personal Record Chamber</p>
        <h2 id="drafts-modal-title">My Drafts</h2>
        <p>{source === "supabase" ? "Private creations saved to your Artisan account." : "Private creations saved on this device."}</p>
      </header>
      <nav className="drafts-modal__tabs" aria-label="Draft categories">
        {(Object.keys(modeLabel) as DraftMode[]).map((draftMode) => <button type="button" className={mode === draftMode ? "is-active" : ""} aria-pressed={mode === draftMode} onClick={() => { setMode(draftMode); setExpandedId(null); }} key={draftMode}><span>{modeLabel[draftMode]}</span><b>{grouped[draftMode].length}</b></button>)}
      </nav>
      {(error || actionError) && <p className="drafts-modal__error" role="alert">{actionError || error}</p>}
      {loading ? <p className="modal-empty inner-panel">Opening your personal records...</p> : !visibleDrafts.length ? <p className="modal-empty inner-panel">No {modeLabel[mode]} drafts have been recorded yet.</p> : <div className="drafts-modal__list">
        {visibleDrafts.map((draft) => {
          const submitted = submittedDraftIds.has(draft.id);
          const expanded = expandedId === draft.id;
          return <article className="drafts-modal__card inner-panel" key={draft.id}>
            <div className="drafts-modal__summary">
              <div><p className="drafts-modal__mode">{modeLabel[draft.mode]}</p><h3>{draft.draftName}</h3><p>{draft.perfumeName || "Untitled creation"}</p><small>Updated {new Date(draft.updatedAt).toLocaleString()}</small></div>
              <span className={`status-badge${submitted ? " status-submitted" : ""}`}>{submitted ? "Submitted" : draft.status === "ready" ? "Ready" : "Draft"}</span>
            </div>
            {expanded && <dl className="drafts-modal__details">{draftDetails(draft).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
            <div className="drafts-modal__actions">
              <button className="drafts-modal__edit" type="button" disabled={busyId === draft.id} onClick={() => void edit(draft)}>Edit Draft</button>
              <button type="button" onClick={() => setExpandedId(expanded ? null : draft.id)}>{expanded ? "Hide Details" : "View Details"}</button>
              <button type="button" disabled={busyId === draft.id} onClick={() => void rename(draft)}>Rename</button>
              <button type="button" disabled={busyId === draft.id} onClick={() => void duplicate(draft)}>Duplicate</button>
              <button className="danger" type="button" disabled={busyId === draft.id || submitted} title={submitted ? "Submitted drafts are retained as part of the order record." : "Delete draft"} onClick={() => void remove(draft)}>Delete</button>
            </div>
            {submitted && <p className="drafts-modal__notice">This draft has been submitted and is retained with its My Orders project.</p>}
          </article>;
        })}
      </div>}
    </section>
  </div>;
}
