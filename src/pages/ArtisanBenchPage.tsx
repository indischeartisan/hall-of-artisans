import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import GlobalHeader from "../components/GlobalHeader";
import DraftsModal from "../components/DraftsModal";
import { useAuth } from "../contexts/AuthContext";
import { useDrafts } from "../contexts/DraftContext";
import { orderService } from "../features/orders/orderService";
import { authPathWithReturnTo } from "../features/auth/returnTo";
import { isArtisanBenchDraft, type ArtisanBenchState, type NewDraftData } from "../types/perfumeDraft";

type Theme = "dark" | "bright";
type MobileWorkspace = "materials" | "formula" | "insights" | "notes" | "review";
type FormulaLayer = "top" | "heart" | "base";
type InsightsView = "balance" | "drydown";

const createEmptyBenchState = (): ArtisanBenchState => ({
  concentration: "edp",
  perfumeName: "",
  perfumerNotes: "",
  nameEdited: false,
  suggestedNames: [],
  formula: [],
  formulaMetadata: {
    concentration: "edp",
    total: 0,
    layerTotals: { top: 0, heart: 0, base: 0 },
    profile: {
      freshness: 0, sweetness: 0, warmth: 0, green: 0, floral: 0,
      woody: 0, powdery: 0, clean: 0, darkness: 0, strangeness: 0,
      intensity: 0, longevity: 0
    },
    warnings: [],
    positives: []
  },
  fragranceBrief: null,
  storyCard: null
});

const PENDING_BENCH_PREVIEW_KEY = "hallOfArtisans.pendingArtisanBenchPreview";
const readPendingBenchPreview = (): ArtisanBenchState | null => {
  try {
    const value = JSON.parse(window.localStorage.getItem(PENDING_BENCH_PREVIEW_KEY) || "null") as ArtisanBenchState | null;
    return value && Array.isArray(value.formula) && value.formulaMetadata ? value : null;
  } catch {
    return null;
  }
};

const stylesheets = [
  "/assets/css/expert-lab.css?v=4",
  "/assets/css/expert-panel-system.css?v=9",
  "/assets/css/expert-lab-refinements.css?v=24",
  "/assets/css/expert-lab-theme.css?v=30"
];

const scripts = [
  "/assets/js/fragrance-data.js?v=4",
  "/assets/js/formula-engine.js?v=5",
  "/assets/js/story-card-generator.js?v=4",
  "/assets/js/expert-lab-app.js?v=26"
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

export default function ArtisanBenchPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { activeDraft: activeCreationDraft, clearActiveDraft, createDraft, saveDraft, source } = useDrafts();
  const activeDraft = isArtisanBenchDraft(activeCreationDraft) ? activeCreationDraft : null;
  const isAuthenticated = Boolean(user);
  const [isDirty, setIsDirty] = useState(!activeDraft);
  const [draftSaveStatus, setDraftSaveStatus] = useState("");
  const [draftsOpen, setDraftsOpen] = useState(false);
  const [mobileWorkspace, setMobileWorkspace] = useState<MobileWorkspace>("formula");
  const [mobileFormulaLayer, setMobileFormulaLayer] = useState<FormulaLayer>("top");
  const [mobileInsightsView, setMobileInsightsView] = useState<InsightsView>("drydown");
  const [isMobileNameEditing, setIsMobileNameEditing] = useState(false);
  const [isMobileOptionsOpen, setIsMobileOptionsOpen] = useState(false);
  const [, setBenchRevision] = useState(0);
  const workspaceRef = useRef<HTMLElement>(null);
  const savedSignature = useRef(activeDraft ? JSON.stringify(activeDraft.benchState) : "");
  const hasBaseline = useRef(Boolean(activeDraft));
  const pendingPreview = useRef(activeDraft ? null : readPendingBenchPreview()).current;
  const pendingRestore = useRef(activeDraft?.benchState ?? pendingPreview);
  const restoringPendingPreview = useRef(Boolean(pendingPreview));
  const latestBenchState = useRef<ArtisanBenchState>(activeDraft?.benchState ?? pendingPreview ?? createEmptyBenchState());
  const loadedDraftId = useRef(activeDraft?.id ?? null);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = window.localStorage.getItem("hoa-theme");
    return saved === "dark" || saved === "bright" ? saved : "bright";
  });
  const isDark = theme === "dark";

  const selectMobileWorkspace = (workspace: MobileWorkspace) => {
    setMobileWorkspace(workspace);
    window.requestAnimationFrame(() => {
      const workspaceElement = workspaceRef.current;
      if (!workspaceElement) return;
      workspaceElement.scrollTo({ top: 0, behavior: "auto" });
      const top = workspaceElement.getBoundingClientRect().top;
      if (top < 72) workspaceElement.scrollIntoView({ behavior: "auto", block: "start" });
    });
  };

  const updateMobilePerfumeName = (value: string) => {
    const input = document.getElementById("perfumeNameInput") as HTMLInputElement | null;
    if (!input) return;
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const finishMobilePerfumeName = () => {
    const input = document.getElementById("perfumeNameInput") as HTMLInputElement | null;
    input?.dispatchEvent(new FocusEvent("blur"));
    setIsMobileNameEditing(false);
  };

  useEffect(() => {
    const bridgeWindow = window as typeof window & { __hoaArtisanBenchAuthenticated?: boolean; __hoaArtisanBenchCreatorName?: string };
    bridgeWindow.__hoaArtisanBenchAuthenticated = isAuthenticated;
    bridgeWindow.__hoaArtisanBenchCreatorName = String(user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Creator Name");
    window.dispatchEvent(new CustomEvent("hoa:artisan-bench-auth-change", { detail: { isAuthenticated } }));
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!activeDraft || loadedDraftId.current === activeDraft.id) return;
    loadedDraftId.current = activeDraft.id;
    pendingRestore.current = activeDraft.benchState;
    latestBenchState.current = activeDraft.benchState;
    savedSignature.current = JSON.stringify(activeDraft.benchState);
    hasBaseline.current = true;
    setIsDirty(false);
    setDraftSaveStatus(`Editing “${activeDraft.draftName}”.`);
    window.dispatchEvent(new CustomEvent("hoa:artisan-bench-load-state", { detail: activeDraft.benchState }));
  }, [activeDraft]);

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

  const startNewDraft = useCallback(() => {
    if (isDirty && !window.confirm("Start a new draft and discard your unsaved Artisan Bench changes?")) return;
    const emptyState = createEmptyBenchState();
    clearActiveDraft();
    pendingRestore.current = null;
    latestBenchState.current = emptyState;
    savedSignature.current = JSON.stringify(emptyState);
    hasBaseline.current = false;
    setIsDirty(true);
    setDraftSaveStatus("New draft started. Your previously saved drafts remain in My Drafts.");
    window.dispatchEvent(new CustomEvent("hoa:artisan-bench-load-state", { detail: emptyState }));
  }, [clearActiveDraft, isDirty]);

  useEffect(() => {
    const onState = (event: Event) => {
      const snapshot = (event as CustomEvent<ArtisanBenchState>).detail;
      if (!snapshot || !Array.isArray(snapshot.formula) || !snapshot.formulaMetadata) return;
      latestBenchState.current = snapshot;
      setBenchRevision(revision => revision + 1);
      if (!hasBaseline.current) {
        savedSignature.current = JSON.stringify(snapshot);
        hasBaseline.current = true;
        setIsDirty(true);
        return;
      }
      setIsDirty(Boolean(savedSignature.current) && JSON.stringify(snapshot) !== savedSignature.current);
    };
    const restore = () => {
      if (pendingRestore.current) {
        window.dispatchEvent(new CustomEvent("hoa:artisan-bench-load-state", { detail: pendingRestore.current }));
        pendingRestore.current = null;
        if (restoringPendingPreview.current) {
          window.localStorage.removeItem(PENDING_BENCH_PREVIEW_KEY);
          restoringPendingPreview.current = false;
        }
      } else {
        window.dispatchEvent(new CustomEvent("hoa:artisan-bench-request-state"));
      }
    };
    const onSave = async (event: Event) => {
      const snapshot = (event as CustomEvent<ArtisanBenchState>).detail;
      if (!snapshot || !Array.isArray(snapshot.formula) || !snapshot.formulaMetadata) {
        setDraftSaveStatus("The current Artisan Bench state is not ready to be saved. Please reload the page and try again.");
        return;
      }
      if (!user) {
        setDraftSaveStatus("Sign in or register before saving this draft to your account.");
        navigate(authPathWithReturnTo("/artisan-login", "/artisan-bench"));
        return;
      }
      const name = activeDraft?.draftName || snapshot.perfumeName.trim() || "Untitled Artisan Bench Draft";
      setDraftSaveStatus("Saving draft...");
      try {
        const result = activeDraft ? await saveDraft(activeDraft.id, draftData(snapshot, name)) : await createDraft(draftData(snapshot, name));
        if (!result) {
          setDraftSaveStatus("This draft could not be found. Please reopen it from My Drafts and try again.");
          return;
        }
        savedSignature.current = JSON.stringify(snapshot);
        setIsDirty(false);
        const destination = source === "supabase" ? "to your account" : "on this device";
        setDraftSaveStatus(`Draft “${result.draftName}” saved ${destination}.`);
      } catch (requestError) {
        const detail = requestError instanceof Error ? requestError.message : "Please check your connection and sign-in session.";
        setDraftSaveStatus(`This draft could not be saved. ${detail}`);
      }
    };
    const onSaveRequest = (event: Event) => { void onSave(event); };
    window.addEventListener("hoa:artisan-bench-state-change", onState);
    window.addEventListener("hoa:artisan-bench-ready", restore);
    window.addEventListener("hoa:artisan-bench-save-request", onSaveRequest);
    return () => {
      window.removeEventListener("hoa:artisan-bench-state-change", onState);
      window.removeEventListener("hoa:artisan-bench-ready", restore);
      window.removeEventListener("hoa:artisan-bench-save-request", onSaveRequest);
    };
  }, [activeDraft, createDraft, draftData, navigate, saveDraft, source, user]);

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

  const previewCreation = async () => {
    window.dispatchEvent(new CustomEvent("hoa:artisan-bench-preview-request"));
    const snapshot = latestBenchState.current;
    const bridgeWindow = window as typeof window & {
      fragranceData?: { materials?: Array<{ id: string; name: string }> };
    };
    const materialNames = Object.fromEntries((bridgeWindow.fragranceData?.materials ?? []).map(material => [material.id, material.name]));
    setDraftSaveStatus("Preparing your creation review...");
    try {
      const name = activeDraft?.draftName || snapshot.perfumeName.trim() || "Untitled Artisan Bench Draft";
      const linkedDraft = activeDraft
        ? await saveDraft(activeDraft.id, draftData(snapshot, name))
        : await createDraft(draftData(snapshot, name));
      if (!linkedDraft) throw new Error("The current draft could not be linked to this preview.");
      savedSignature.current = JSON.stringify(snapshot);
      setIsDirty(false);
      const request = await orderService.createArtisanBenchPreview(snapshot, linkedDraft.id, materialNames);
      navigate(`/my-creations/${request.id}`);
    } catch (requestError) {
      const detail = requestError instanceof Error ? requestError.message : "The preview could not be created.";
      if (detail.toLowerCase().includes("sign in")) {
        window.localStorage.setItem(PENDING_BENCH_PREVIEW_KEY, JSON.stringify(snapshot));
        setDraftSaveStatus("Sign in or register to continue reviewing your creation.");
        navigate(authPathWithReturnTo("/artisan-login", "/artisan-bench?resume=review"));
        return;
      }
      setDraftSaveStatus(detail);
    }
  };

  const themeToggle = (
    <button
      id="themeToggle"
      className="theme-toggle theme-toggle--slider"
      type="button"
      aria-label={isDark ? "Switch to bright mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      onClick={toggleTheme}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-option theme-toggle-sun">☀</span>
        <span className="theme-toggle-option theme-toggle-moon">☾</span>
        <span className="theme-toggle-thumb" />
      </span>
    </button>
  );

  return (
    <>
      <GlobalHeader action={themeToggle} activeLabel="Chamber of Creation" variant={isDark ? "default" : "light"} />
      <main>
        <section className="hero-lab" id="top">
          <img
            className="hero-image"
            src={isDark
              ? "/assets/images/artisan-bench-night.webp?v=2"
              : "/assets/images/artisan-bench-bright.webp?v=2"}
            alt=""
            aria-hidden="true"
          />
          <div className="hero-veil" />
          <div className="hero-copy">
            <p className="kicker">Chamber of Creation</p>
            <h1>Artisan Bench</h1>
            <p>Compose a bespoke fragrance brief from concentration, materials, note layers, balance, naming, and drydown.</p>
          </div>
        </section>

        <section
          ref={workspaceRef}
          className={`expert-workshop mobile-workspace mobile-view-${mobileWorkspace}`}
          aria-label="Expert formula workspace"
        >
          <header
            className={`mobile-workbench-status${isMobileOptionsOpen ? " is-options-open" : ""}`}
            aria-label="Current creation status"
          >
            <div className="mobile-workbench-status__content">
              {isMobileNameEditing ? (
                <input
                  autoFocus
                  className="mobile-workbench-name-input"
                  aria-label="Edit creation name"
                  value={latestBenchState.current.perfumeName}
                  placeholder="Untitled Creation"
                  onChange={(event) => updateMobilePerfumeName(event.currentTarget.value)}
                  onBlur={finishMobilePerfumeName}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                    if (event.key === "Escape") event.currentTarget.blur();
                  }}
                />
              ) : (
                <button
                  type="button"
                  className="mobile-workbench-name-display"
                  aria-label="Edit creation name"
                  onClick={() => setIsMobileNameEditing(true)}
                >
                  <strong>{latestBenchState.current.perfumeName || "Untitled Creation"}</strong>
                  <span aria-hidden="true">✎</span>
                </button>
              )}
              <div className="mobile-workbench-status__meta">
                <span>{latestBenchState.current.concentration.toUpperCase()}</span>
                <span>{latestBenchState.current.formulaMetadata.total}% formula</span>
                <span className={isDirty ? "is-unsaved" : "is-saved"}>{isDirty ? "Unsaved" : "Saved"}</span>
              </div>
            </div>
            <button
              className="mobile-workbench-status__more"
              type="button"
              aria-label="Creation options"
              aria-expanded={isMobileOptionsOpen}
              onClick={() => setIsMobileOptionsOpen((open) => !open)}
            >...</button>
            {isMobileOptionsOpen ? (
              <div className="mobile-workbench-options" role="menu" aria-label="Creation options menu">
                <button type="button" role="menuitem" onClick={() => {
                  setIsMobileOptionsOpen(false);
                  startNewDraft();
                }}>New Draft</button>
                <button type="button" role="menuitem" onClick={() => {
                  setIsMobileOptionsOpen(false);
                  document.getElementById("saveDraft")?.click();
                }}>Save Draft</button>
                <button type="button" role="menuitem" onClick={() => {
                  setIsMobileOptionsOpen(false);
                  setDraftsOpen(true);
                }}>My Drafts</button>
              </div>
            ) : null}
          </header>
          <aside className="material-library panel ornate-panel">
            <div className="panel-title"><p className="step">Material Library</p><h2>Find Your Materials</h2><small>Explore accords and add them directly to your formula.</small></div>
            <label className="search-label" htmlFor="materialSearch">Search materials</label>
            <div className="mobile-material-search-row">
              <input id="materialSearch" placeholder="Search materials" />
              <button id="mobileMaterialFilter" type="button" aria-label="Filter: show only materials already in formula" title="Show materials in formula" aria-pressed="false"><span aria-hidden="true">☷</span></button>
            </div>
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
            <section id="mobileFormulaBuilder" className={`formula-builder panel ornate-panel mobile-layer-${mobileFormulaLayer}`}>
              <div className="panel-heading"><div><p className="step">05 Formula Builder</p><h2>Build Your Structure</h2></div></div>
              <section className="mobile-formula-overview" aria-label="Formula balance">
                <div
                  className="mobile-formula-ring"
                  style={{
                    background: `conic-gradient(#204f38 0 ${latestBenchState.current.formulaMetadata.layerTotals.top}%, #c49a3a ${latestBenchState.current.formulaMetadata.layerTotals.top}% ${latestBenchState.current.formulaMetadata.layerTotals.top + latestBenchState.current.formulaMetadata.layerTotals.heart}%, #8d8a78 ${latestBenchState.current.formulaMetadata.layerTotals.top + latestBenchState.current.formulaMetadata.layerTotals.heart}% ${latestBenchState.current.formulaMetadata.total}%, rgba(145, 126, 91, .16) ${latestBenchState.current.formulaMetadata.total}% 100%)`
                  }}
                >
                  <div><small>Total</small><strong>{latestBenchState.current.formulaMetadata.total}%</strong></div>
                </div>
                <div className="mobile-formula-balance-copy">
                  <span>Formula Balance <i aria-hidden="true">⚖</i></span>
                  <strong>
                    {latestBenchState.current.formulaMetadata.total === 100 ? "The formula is perfectly balanced." : "Continue balancing your formula."}
                    {latestBenchState.current.formulaMetadata.total === 100 ? <i className="mobile-balance-check" aria-hidden="true">✓</i> : null}
                  </strong>
                  <div className="mobile-formula-totals">
                    <span>Top <b>{latestBenchState.current.formulaMetadata.layerTotals.top}%</b></span>
                    <span>Heart <b>{latestBenchState.current.formulaMetadata.layerTotals.heart}%</b></span>
                    <span>Base <b>{latestBenchState.current.formulaMetadata.layerTotals.base}%</b></span>
                  </div>
                </div>
              </section>
              <nav className="mobile-layer-tabs" aria-label="Formula note layers">
                {(["top", "heart", "base"] as FormulaLayer[]).map((layer) => (
                  <button
                    key={layer}
                    type="button"
                    className={mobileFormulaLayer === layer ? "is-active" : ""}
                    aria-pressed={mobileFormulaLayer === layer}
                    onClick={() => setMobileFormulaLayer(layer)}
                  >
                    {layer === "top" ? "❧" : layer === "heart" ? "❀" : "♢"} {layer} notes
                  </button>
                ))}
              </nav>
              <div className="layer-grid inner-grid">
                <div className="layer-card inner-panel" data-layer="top">
                  <header className="mobile-layer-heading"><div><h3>Top Notes</h3><small>The first impression · Light &amp; Evaporative</small></div><strong data-layer-total="top">0%</strong></header>
                  <div className="selected-list" id="topList" />
                  <button data-add="top" className="add-btn panel-button"><span aria-hidden="true">＋</span> Add Material</button>
                </div>
                <div className="layer-card inner-panel" data-layer="heart">
                  <header className="mobile-layer-heading"><div><h3>Heart Notes</h3><small>The character · Rich &amp; Expressive</small></div><strong data-layer-total="heart">0%</strong></header>
                  <div className="selected-list" id="heartList" />
                  <button data-add="heart" className="add-btn panel-button"><span aria-hidden="true">＋</span> Add Material</button>
                </div>
                <div className="layer-card inner-panel" data-layer="base">
                  <header className="mobile-layer-heading"><div><h3>Base Notes</h3><small>The lasting impression · Deep &amp; Enduring</small></div><strong data-layer-total="base">0%</strong></header>
                  <div className="selected-list" id="baseList" />
                  <button data-add="base" className="add-btn panel-button"><span aria-hidden="true">＋</span> Add Material</button>
                </div>
              </div>
              <section className={`mobile-formula-validation ${latestBenchState.current.formulaMetadata.total === 100 ? "is-balanced" : ""}`} aria-live="polite">
                <span aria-hidden="true">{latestBenchState.current.formulaMetadata.total === 100 ? "✓" : "!"}</span>
                <div><strong>{latestBenchState.current.formulaMetadata.total === 100 ? "Formula is balanced at 100%" : `Formula total is ${latestBenchState.current.formulaMetadata.total}%`}</strong><small>{latestBenchState.current.formulaMetadata.total === 100 ? "Well done, Artisan." : "Continue balancing to reach 100%."}</small></div>
              </section>
              <div className="formula-summary-strip">
                <span>Total Formula <strong id="totalPercent">0%</strong></span>
                <span>Top <strong id="topTotal">0%</strong></span>
                <span>Heart <strong id="heartTotal">0%</strong></span>
                <span>Base <strong id="baseTotal">0%</strong></span>
              </div>
              <div className="actions inner-panel">
                <button id="autoBalance" className="panel-button">Auto 100%</button>
                <button id="generateBrief" className="gold gold-button">Generate</button>
                <button id="clearFormula" className="quiet panel-button">Clear All</button>
              </div>
            </section>

            <section className="mobile-insights-heading" aria-label="Scent direction">
              <span>Scent Direction</span>
              <strong>
                {latestBenchState.current.fragranceBrief?.olfactiveFamily
                  || "Build your formula to reveal its scent direction."}
              </strong>
              <p>Understand the balance and how your creation develops on skin.</p>
              <nav aria-label="Insight view">
                <button type="button" className={mobileInsightsView === "balance" ? "is-active" : ""} onClick={() => setMobileInsightsView("balance")}>Balance</button>
                <button type="button" className={mobileInsightsView === "drydown" ? "is-active" : ""} onClick={() => setMobileInsightsView("drydown")}>Drydown</button>
              </nav>
            </section>

            <aside className={`analysis panel ornate-panel ${mobileInsightsView === "balance" ? "is-mobile-active" : ""}`}>
              <div className="panel-title"><p className="step">06 Formula Analysis</p><h2>Formula Balance</h2></div>
              <div id="profileBars" />
            </aside>

            <section className={`drydown panel ornate-panel ${mobileInsightsView === "drydown" ? "is-mobile-active" : ""}`}>
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
            <section className="brief perfumer-notes panel ornate-panel">
              <div className="panel-title"><p className="step">09 Notes for Perfumer</p><h2>Notes</h2></div>
              <div className="mobile-notes-intro">
                <span>Notes for Perfumer</span>
                <strong>Give your creation a story.</strong>
                <p>Tell the perfumer about mood, memory, occasion, or anything important.</p>
              </div>
              <label htmlFor="perfumerNotesInput">Write anything the perfumer should know</label>
              <textarea id="perfumerNotesInput" className="brief-paper inner-panel" maxLength={3000} placeholder="Describe the mood, memory, occasion, preferences, concerns, or any detail you want the perfumer to consider…" />
              <small>Your notes are saved with this draft and included when you send the creation for review.</small>
              <button className="mobile-continue-review" type="button" onClick={() => selectMobileWorkspace("review")}>Continue to Review <span aria-hidden="true">→</span></button>
              <div id="briefOutput" hidden />
            </section>
            <section id="story-card" className="story-card-section panel ornate-panel">
              <div className="panel-title"><p className="step">Review Your Creation</p><h2>{latestBenchState.current.perfumeName || "Untitled Creation"}</h2><small>Check every detail before sending it to an artisan.</small></div>
              <section className="mobile-review-summary" aria-label="Creation summary">
                <div><span>Identity</span><strong>{latestBenchState.current.concentration.toUpperCase()} · {latestBenchState.current.formulaMetadata.total}% total</strong></div>
                <div><span>Formula Structure</span><strong>Top {latestBenchState.current.formulaMetadata.layerTotals.top}% · Heart {latestBenchState.current.formulaMetadata.layerTotals.heart}% · Base {latestBenchState.current.formulaMetadata.layerTotals.base}%</strong></div>
                <div><span>Perfumer Notes</span><strong>{latestBenchState.current.perfumerNotes || "No notes added yet."}</strong></div>
              </section>
              <div id="storyCardPreview" className="story-card-preview inner-panel" aria-live="polite" />
              <div className="story-card-actions">
                <button id="downloadStoryCard" className="panel-button">Download Story Card</button>
                <button id="shareStoryCard" className="panel-button" disabled={!isAuthenticated} aria-label={isAuthenticated ? "Share Story Card" : "Share Story Card — sign in required"}>Share Story Card</button>
              </div>
              <p id="storyCardMessage" className="story-card-message" aria-live="polite">Temporary preview mode: download is unlocked for review.</p>
            </section>
          </section>

          <section className="next panel ornate-panel">
            <div className="panel-title"><p className="step">11 Save &amp; Next Step</p><h2>Save &amp; Next Step</h2></div>
            <p className="next-creation">Selected creation: <strong id="nextPerfumeName">Morning Tea Garden</strong></p>
            <div className="next-actions">
              <button className="panel-button" type="button" onClick={startNewDraft}>New Draft</button>
              <button id="saveDraft" className="panel-button" type="button">Save Draft</button>
              <button className="panel-button" type="button" onClick={() => setDraftsOpen(true)}>My Drafts</button>
              <button className="gold gold-button review-creation-cta" type="button" onClick={previewCreation}>Review Your Creation</button>
            </div>
            <p className="story-card-message" role="status" aria-live="polite">{draftSaveStatus}</p>
          </section>

          <nav className="mobile-workbench-nav" aria-label="Artisan Bench workspace">
            {([
              ["materials", "Materials", "✦"],
              ["formula", "Formula", "◫"],
              ["insights", "Insights", "◇"],
              ["notes", "Notes", "✎"],
              ["review", "Review", "✓"]
            ] as Array<[MobileWorkspace, string, string]>).map(([id, label, icon]) => (
              <button
                key={id}
                type="button"
                className={mobileWorkspace === id ? "is-active" : ""}
                aria-current={mobileWorkspace === id ? "page" : undefined}
                onClick={() => selectMobileWorkspace(id)}
              >
                <span aria-hidden="true">{icon}</span>
                <small>{label}</small>
              </button>
            ))}
          </nav>
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
      <DraftsModal open={draftsOpen} onClose={() => setDraftsOpen(false)} initialMode="artisan_bench" />
    </>
  );
}
