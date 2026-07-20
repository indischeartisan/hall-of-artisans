import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import GlobalHeader from "../components/GlobalHeader";
import { useDrafts } from "../contexts/DraftContext";
import type { ArtisanBenchState, NewDraftData } from "../types/perfumeDraft";

type Theme = "dark" | "bright";

const stylesheets = [
  "/assets/css/expert-lab.css?v=4",
  "/assets/css/expert-panel-system.css?v=8",
  "/assets/css/expert-lab-refinements.css?v=24",
  "/assets/css/expert-lab-theme.css?v=2"
];

const scripts = [
  "/assets/js/fragrance-data.js?v=4",
  "/assets/js/formula-engine.js?v=5",
  "/assets/js/story-card-generator.js?v=1",
  "/assets/js/expert-lab-app.js?v=11"
];

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.dataset.artisanBench = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Unable to load ${src}`));
    document.body.appendChild(script);
  });
}

function hasArtisanIdentity() {
  try {
    const stored = window.localStorage.getItem("hallArtisanProfile") || window.localStorage.getItem("hallOfArtisans.perfumerId") || window.localStorage.getItem("hallOfArtisans.artisanId");
    if (!stored) return false;
    const identity = JSON.parse(stored) as { artisanId?: string; perfumerId?: string };
    return Boolean(identity.artisanId || identity.perfumerId);
  } catch {
    return false;
  }
}

export default function ArtisanBenchPage() {
  const navigate = useNavigate();
  const { activeDraft, createDraft, saveDraft } = useDrafts();
  const [isDirty, setIsDirty] = useState(false);
  const savedSignature = useRef(activeDraft ? JSON.stringify(activeDraft.benchState) : "");
  const hasBaseline = useRef(Boolean(activeDraft));
  const pendingRestore = useRef(activeDraft?.benchState ?? null);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = window.localStorage.getItem("hoa-theme");
    return saved === "dark" || saved === "bright" ? saved : "bright";
  });
  const isDark = theme === "dark";

  useLayoutEffect(() => {
    const previousTitle = document.title;
    document.title = "Expert Lab | The Hall of Artisans";
    document.body.classList.add("expert-lab-page");
    document.body.classList.remove("entrance-body", "lobby-body", "perfume-mode-page", "page-leaving");
    document.body.dataset.theme = theme;

    const links = stylesheets.map((href) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.artisanBench = "true";
      document.head.appendChild(link);
      return link;
    });

    return () => {
      document.title = previousTitle;
      document.body.classList.remove("expert-lab-page", "page-leaving");
      delete document.body.dataset.theme;
      links.forEach((link) => link.remove());
    };
  }, []);

  useLayoutEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      try {
        for (const src of scripts) {
          if (cancelled) return;
          await loadScript(src);
        }
      } catch (error) {
        const target = document.getElementById("formulaMessages");
        if (target) target.innerHTML = `<div class="message warn">Expert Lab data could not load: ${(error as Error).message}</div>`;
      }
    };
    void initialize();
    return () => {
      cancelled = true;
      (window as typeof window & { __hoaArtisanBenchCleanup?: () => void }).__hoaArtisanBenchCleanup?.();
      document.querySelectorAll('script[data-artisan-bench="true"]').forEach((script) => script.remove());
    };
  }, []);

  const draftData = useCallback((snapshot: ArtisanBenchState, draftName: string): NewDraftData => ({
    draftName,
    perfumeName: snapshot.perfumeName || undefined,
    formula: snapshot.formula,
    formulaMetadata: snapshot.formulaMetadata,
    fragranceBrief: snapshot.fragranceBrief || undefined,
    storyCard: snapshot.storyCard || undefined,
    benchState: snapshot,
    status: snapshot.formulaMetadata.total === 100 ? "ready" : "draft"
  }), []);

  useEffect(() => {
    const onState = (event: Event) => {
      const snapshot = (event as CustomEvent<ArtisanBenchState>).detail;
      if (!snapshot || !Array.isArray(snapshot.formula) || !snapshot.formulaMetadata) return;
      if (!hasBaseline.current) {
        savedSignature.current = JSON.stringify(snapshot);
        hasBaseline.current = true;
        setIsDirty(false);
        return;
      }
      setIsDirty(Boolean(savedSignature.current) && JSON.stringify(snapshot) !== savedSignature.current);
    };
    const restore = () => {
      if (pendingRestore.current) {
        window.dispatchEvent(new CustomEvent("hoa:artisan-bench-load-state", { detail: pendingRestore.current }));
        pendingRestore.current = null;
      } else {
        window.dispatchEvent(new CustomEvent("hoa:artisan-bench-request-state"));
      }
    };
    const onSave = (event: Event) => {
      const snapshot = (event as CustomEvent<ArtisanBenchState>).detail;
      if (!snapshot?.formula?.length) {
        document.getElementById("formulaMessages")!.innerHTML = '<div class="message warn">Add at least one material before saving a draft.</div>';
        return;
      }
      let name = activeDraft?.draftName;
      if (!name) name = window.prompt("Name this draft:", snapshot.perfumeName || "Untitled Draft")?.trim();
      if (!name) return;
      const result = activeDraft ? saveDraft(activeDraft.id, draftData(snapshot, name)) : createDraft(draftData(snapshot, name));
      if (!result) return;
      savedSignature.current = JSON.stringify(snapshot);
      setIsDirty(false);
      document.getElementById("formulaMessages")!.innerHTML = `<div class="message good">Draft “${result.draftName}” saved locally.</div>`;
    };
    window.addEventListener("hoa:artisan-bench-state-change", onState);
    window.addEventListener("hoa:artisan-bench-ready", restore);
    window.addEventListener("hoa:artisan-bench-save-request", onSave);
    return () => {
      window.removeEventListener("hoa:artisan-bench-state-change", onState);
      window.removeEventListener("hoa:artisan-bench-ready", restore);
      window.removeEventListener("hoa:artisan-bench-save-request", onSave);
    };
  }, [activeDraft, createDraft, draftData, saveDraft]);

  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const warnBeforeLink = (event: MouseEvent) => {
      if (!isDirty) return;
      const link = (event.target as Element | null)?.closest("a[href]");
      if (link && !window.confirm("You have unsaved Artisan Bench changes. Leave without saving?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    document.addEventListener("click", warnBeforeLink, true);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload);
      document.removeEventListener("click", warnBeforeLink, true);
    };
  }, [isDirty]);

  const toggleTheme = () => {
    const nextTheme = isDark ? "bright" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("hoa-theme", nextTheme);
  };

  const openMakeItReal = () => {
    navigate(hasArtisanIdentity() ? "/bespoke-atelier" : "/artisan-register");
  };

  const themeToggle = (
    <button
      id="themeToggle"
      className="theme-toggle"
      type="button"
      aria-label={isDark ? "Switch to bright mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      onClick={toggleTheme}
    >
      <span className="theme-toggle-icon" aria-hidden="true">{isDark ? "☀" : "☾"}</span>
      <span className="theme-toggle-label">{isDark ? "Bright Mode" : "Dark Mode"}</span>
    </button>
  );

  return (
    <>
      <GlobalHeader action={themeToggle} activeLabel="Chamber of Creation" variant={isDark ? "default" : "light"} />
      <main>
        <section className="hero-lab" id="top">
          <img className="hero-image" src="/assets/images/expert-lab-background.webp?v=1" alt="" />
          <div className="hero-veil" />
          <div className="hero-copy">
            <p className="kicker">Chamber of Creation</p>
            <h1>Artisan Bench</h1>
            <p>Compose a bespoke fragrance brief from concentration, materials, note layers, balance, naming, and drydown.</p>
          </div>
        </section>

        <section className="expert-workshop" aria-label="Expert formula workspace">
          <aside className="material-library panel ornate-panel">
            <div className="panel-title"><p className="step">01 Material Library</p><h2>Materials</h2></div>
            <label className="search-label" htmlFor="materialSearch">Search materials</label>
            <input id="materialSearch" placeholder="Rose, tea, cedarwood..." />
            <div id="categoryList" className="category-list" />
            <div className="coming-soon inner-panel">
              <p className="step">Indische Materials</p><h3>Coming Soon</h3>
              <small>Rare Indische accords are being catalogued by the artisans.</small>
            </div>
          </aside>

          <section className="top-controls" aria-label="Formula setup">
            <section className="setup-block concentration-panel panel ornate-panel">
              <div className="concentration-heading">
                <p className="step">02 Concentration</p>
                <details className="concentration-help">
                  <summary aria-label="Open concentration guide">?</summary>
                  <div className="concentration-help-popover">
                    <h3>Concentration Guide</h3>
                    <p><strong>EDT</strong> Lighter and brighter. Best for fresh, airy, easy daily wear.</p>
                    <p><strong>EDP</strong> Balanced projection and longevity. Best for signature scents.</p>
                    <p><strong>Extrait</strong> Deeper, richer, and more intimate. Best for long-lasting personal compositions.</p>
                  </div>
                </details>
              </div>
              <div id="concentrationButtons" className="pill-row" />
              <p id="concentrationDescription" className="concentration-guidance" hidden />
            </section>
            <section className="setup-block formula-insights-panel panel ornate-panel">
              <p className="step">03 Formula Insights</p>
              <div id="formulaDirection" className="direction-grid" aria-live="polite" />
            </section>
            <section className="perfume-name panel ornate-panel">
              <div className="panel-title"><p className="step">04 Perfume Name</p><h2>Perfume Name</h2></div>
              <div className="name-lab">
                <label htmlFor="perfumeNameInput">Your creation name</label>
                <div className="name-row">
                  <input id="perfumeNameInput" type="text" autoComplete="off" />
                  <button id="suggestNames" className="panel-button" type="button">Suggest Names</button>
                  <button id="randomizeName" className="panel-button" type="button">Randomize Name</button>
                </div>
                <p className="name-help">This name will appear in the fragrance brief, archive, story card, and submission.</p>
                <div id="suggestedNames" className="suggested-names" aria-live="polite" />
              </div>
            </section>
          </section>

          <section className="build-review-row">
            <section className="formula-builder panel ornate-panel">
              <div className="panel-heading"><div><p className="step">05 Formula Builder</p><h2>Build Your Structure</h2></div></div>
              <div className="layer-grid inner-grid">
                <div className="layer-card inner-panel" data-layer="top">
                  <h3><span>Top Notes</span> <strong data-layer-total="top">0%</strong></h3>
                  <small>Opening | <span data-range="top">10-25%</span></small>
                  <div className="selected-list" id="topList" />
                  <button data-add="top" className="add-btn panel-button">+ Add Top Note</button>
                </div>
                <div className="layer-card inner-panel" data-layer="heart">
                  <h3><span>Heart Notes</span> <strong data-layer-total="heart">0%</strong></h3>
                  <small>Body | <span data-range="heart">30-50%</span></small>
                  <div className="selected-list" id="heartList" />
                  <button data-add="heart" className="add-btn panel-button">+ Add Heart Note</button>
                </div>
                <div className="layer-card inner-panel" data-layer="base">
                  <h3><span>Base Notes</span> <strong data-layer-total="base">0%</strong></h3>
                  <small>Drydown | <span data-range="base">30-50%</span></small>
                  <div className="selected-list" id="baseList" />
                  <button data-add="base" className="add-btn panel-button">+ Add Base Note</button>
                </div>
              </div>
              <div className="formula-summary-strip">
                <span>Total Formula <strong id="totalPercent">0%</strong></span>
                <span>Top <strong id="topTotal">0%</strong></span>
                <span>Heart <strong id="heartTotal">0%</strong></span>
                <span>Base <strong id="baseTotal">0%</strong></span>
              </div>
              <div className="actions inner-panel">
                <button id="autoBalance" className="panel-button">Auto Balance to 100%</button>
                <button id="clearFormula" className="quiet panel-button">Clear All</button>
                <button id="generateBrief" className="gold gold-button">Generate Fragrance Brief</button>
              </div>
            </section>

            <aside className="analysis panel ornate-panel">
              <div className="panel-title"><p className="step">06 Formula Analysis</p><h2>Formula Balance</h2></div>
              <div id="profileBars" />
            </aside>

            <section className="drydown panel ornate-panel">
              <div className="panel-title"><p className="step">07 Drydown Journey</p><h2>Drydown Journey</h2></div>
              <div id="drydownTimeline" className="timeline" />
            </section>
          </section>

          <section className="formula-check panel ornate-panel">
            <div className="panel-title"><p className="step">08 Formula Check</p><h2>Formula Check</h2></div>
            <button id="checkFormula" className="wide panel-button">Check Formula</button>
            <div id="formulaMessages" aria-live="polite" />
          </section>

          <section className="brief-story-row">
            <section className="brief panel ornate-panel">
              <div className="panel-title"><p className="step">09 Fragrance Brief</p><h2>Fragrance Brief</h2></div>
              <div id="briefOutput" className="brief-paper inner-panel">Generate a brief to see the result.</div>
            </section>
            <section id="story-card" className="story-card-section panel ornate-panel">
              <div className="panel-title"><p className="step">10 Story Card</p><h2>Fragrance Brief Story Card</h2></div>
              <div id="storyCardPreview" className="story-card-preview inner-panel" aria-live="polite" />
              <div className="story-card-actions">
                <button id="downloadStoryCard" className="panel-button">Download Story Card</button>
                <button className="locked panel-button" disabled>Share Story Card <span>Perfumer ID Required</span></button>
                <a id="createPerfumerId" className="panel-button story-unlock-link" href="/artisan-register">Create Perfumer ID to Unlock</a>
              </div>
              <p id="storyCardMessage" className="story-card-message" aria-live="polite">Temporary preview mode: download is unlocked for review.</p>
            </section>
          </section>

          <section className="next panel ornate-panel">
            <div className="panel-title"><p className="step">11 Save &amp; Next Step</p><h2>Save &amp; Next Step</h2></div>
            <p className="next-creation">Selected creation: <strong id="nextPerfumeName">Morning Tea Garden</strong></p>
            <div className="next-actions">
              <button id="saveDraft" className="panel-button">Save Draft</button>
              <button className="panel-button" type="button" onClick={() => navigate("/my-drafts")}>My Drafts</button>
              <button className="gold gold-button" type="button" onClick={openMakeItReal}>Make It Real</button>
            </div>
          </section>
        </section>

        <section className="disclaimer panel ornate-panel">
          Expert Lab creates a bespoke creative brief, not a final production formula. Final development must be refined, tested, and approved by Indische World artisans and perfumers.
        </section>
      </main>

      <dialog id="materialDialog">
        <form method="dialog">
          <div className="dialog-heading">
            <p className="step">Select Material</p>
            <button className="dialog-close panel-button" aria-label="Close">Close</button>
          </div>
          <label className="dialog-material-search" htmlFor="dialogMaterialSearch">
            <span className="dialog-material-search-label">Search materials</span>
            <input id="dialogMaterialSearch" type="search" placeholder="Search name, category, note..." autoComplete="off" />
          </label>
          <div id="dialogMaterials" />
        </form>
      </dialog>
    </>
  );
}
