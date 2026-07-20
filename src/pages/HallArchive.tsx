import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import GlobalHeader from "../components/GlobalHeader";
import { archiveRecords, type ArchiveRecord } from "../data/archiveRecords";
import "../styles/hallArchive.css";

type ArchiveScope = "public" | "mine";
type SortOrder = "latest" | "oldest" | "title" | "creator";
type ViewMode = "grid" | "list";

const myArchiveNumbers = new Set(["HOA-0127"]);

export default function HallArchive() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<ArchiveScope>("public");
  const [sortOrder, setSortOrder] = useState<SortOrder>("latest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeRecord, setActiveRecord] = useState<ArchiveRecord | null>(null);

  useEffect(() => {
    document.title = "Hall Archive | The Hall of Artisans";
    document.body.classList.add("hall-archive-body");
    const brightPanels = document.createElement("link");
    brightPanels.rel = "stylesheet";
    brightPanels.href = "/assets/css/ornate-panel-bright.css?v=1";
    document.head.appendChild(brightPanels);
    return () => {
      document.body.classList.remove("hall-archive-body");
      brightPanels.remove();
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("archive-modal-open", Boolean(activeRecord));
    const close = (event: KeyboardEvent) => event.key === "Escape" && setActiveRecord(null);
    document.addEventListener("keydown", close);
    return () => {
      document.body.classList.remove("archive-modal-open");
      document.removeEventListener("keydown", close);
    };
  }, [activeRecord]);

  const visibleRecords = useMemo(() => {
    const term = query.trim().toLowerCase();
    const records = archiveRecords.filter((record) => {
      if (scope === "mine" && !myArchiveNumbers.has(record.archiveNumber)) return false;
      if (!term) return true;
      return [record.archiveNumber, record.title, record.creator, ...record.mood]
        .some((value) => value.toLowerCase().includes(term));
    });

    return [...records].sort((a, b) => {
      if (sortOrder === "oldest") return a.archiveNumber.localeCompare(b.archiveNumber);
      if (sortOrder === "title") return a.title.localeCompare(b.title);
      if (sortOrder === "creator") return a.creator.localeCompare(b.creator);
      return b.archiveNumber.localeCompare(a.archiveNumber);
    });
  }, [query, scope, sortOrder]);

  const changeScope = (nextScope: ArchiveScope) => {
    setScope(nextScope);
    setQuery("");
  };

  return <>
    <GlobalHeader activeLabel="Hall Archive" variant="light" />
    <main className="hall-archive-shell">
      <section className="archive-hero" aria-labelledby="archiveTitle">
        <div className="archive-crest" aria-hidden="true"><img src="/assets/images/hall-artisans-header-logo.webp" alt="" /></div>
        <div className="archive-title-row"><span /><h1 id="archiveTitle">Hall Archive</h1><span /></div>
        <p className="archive-subtitle">Archived Creations of The Hall</p>
        <p className="archive-intro">A living record of completed bespoke fragrances born inside The Hall of Artisans.</p>
      </section>

      <section className="archive-toolbar" aria-label="Archive controls">
        <div className="archive-primary-tools">
          <div className="archive-tabs" role="tablist" aria-label="Archive collection">
            <button type="button" role="tab" aria-selected={scope === "public"} className={`inner-panel archive-tool-panel${scope === "public" ? " active" : ""}`} onClick={() => changeScope("public")}><span aria-hidden="true">✥</span> Public Archive</button>
            <button type="button" role="tab" aria-selected={scope === "mine"} className={`inner-panel archive-tool-panel${scope === "mine" ? " active" : ""}`} onClick={() => changeScope("mine")}><span aria-hidden="true">♙</span> My Archive</button>
          </div>
          <label className="archive-search inner-panel archive-tool-panel"><span className="archive-search-icon" aria-hidden="true">⌕</span><span className="sr-only">Search archive</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, creator, mood, or archive number..." /></label>
          <button className="archive-create inner-panel" type="button" onClick={() => navigate("/chamber-of-creation")}><span aria-hidden="true">♙</span> Create Your Perfume <b aria-hidden="true">›</b></button>
        </div>
        <div className="archive-secondary-tools">
          <p><strong>{scope === "public" && !query ? "142" : visibleRecords.length}</strong> {scope === "mine" ? "creations in my archive" : "official archived creations"}</p>
          <div className="archive-view-tools">
            <label className="inner-panel archive-tool-panel archive-sort-panel"><span className="sr-only">Sort archive</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)}><option value="latest">Latest archived</option><option value="oldest">Oldest archived</option><option value="title">Title A–Z</option><option value="creator">Creator A–Z</option></select></label>
            <button type="button" className={`inner-panel archive-tool-panel${viewMode === "grid" ? " active" : ""}`} aria-label="Grid view" aria-pressed={viewMode === "grid"} onClick={() => setViewMode("grid")}>⊞</button>
            <button type="button" className={`inner-panel archive-tool-panel${viewMode === "list" ? " active" : ""}`} aria-label="List view" aria-pressed={viewMode === "list"} onClick={() => setViewMode("list")}>☷</button>
          </div>
        </div>
      </section>

      {visibleRecords.length ? <section className={`archive-grid archive-grid--${viewMode}`} aria-label="Official archived perfume creations">
        {visibleRecords.map((record) => <button className="archive-card inner-panel" type="button" key={record.archiveNumber} onClick={() => setActiveRecord(record)} aria-label={`Open ${record.title} archive record`}>
          <span className="archive-card-number">{record.archiveNumber}</span>
          <span className="archive-bottle-stage"><img src={record.image} alt={`${record.title} perfume bottle`} /></span>
          <span className="archive-card-title">{record.title}</span>
          <span className="archive-card-divider" aria-hidden="true">◆</span>
          <span className="archive-card-creator"><small>Created by</small>{record.creator}</span>
        </button>)}
      </section> : <section className="archive-empty"><span aria-hidden="true">HA</span><h2>No archive records found</h2><p>Try another title, creator, mood, or archive number.</p><button type="button" onClick={() => setQuery("")}>Clear Search</button></section>}

      <footer className="archive-footer"><span />The Hall preserves. Time remembers.<span /></footer>
    </main>

    {activeRecord && <div className="archive-modal" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setActiveRecord(null)}>
      <article className="archive-modal-panel" role="dialog" aria-modal="true" aria-labelledby="archiveModalTitle">
        <button className="archive-modal-close" type="button" onClick={() => setActiveRecord(null)} aria-label="Close archive record">×</button>
        <div className="archive-modal-bottle"><img src={activeRecord.image} alt={`${activeRecord.title} perfume bottle`} /></div>
        <div className="archive-modal-copy"><p className="archive-modal-number">{activeRecord.archiveNumber} · Official Public Record</p><h2 id="archiveModalTitle">{activeRecord.title}</h2><p className="archive-modal-byline">Created by <strong>{activeRecord.creator}</strong></p><div className="archive-modal-tags">{activeRecord.mood.map((tag) => <span key={tag}>{tag}</span>)}</div><p className="archive-modal-story">{activeRecord.story}</p><p className="archive-privacy-note">This public ledger preserves the story of the creation. Formula, percentages, revisions, and internal perfumer notes remain private.</p></div>
      </article>
    </div>}
  </>;
}
