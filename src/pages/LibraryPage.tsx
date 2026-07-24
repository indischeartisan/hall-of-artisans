import { useEffect, useLayoutEffect } from "react";
import GlobalHeader from "../components/GlobalHeader";
import { loadLibraryCatalog, type LibraryMaterial } from "../features/library/libraryCatalogService";

const libraryStyles = [
  "/assets/css/styles.css?v=17",
  "/assets/css/library.css?v=8",
  "/assets/css/header-consistency.css?v=1"
];

const libraryDataScripts = [
  "/assets/js/library-data.js?v=4",
  "/assets/js/library-note-details.js?v=1"
];

const libraryUiScript = "/assets/js/library-modal.js?v=4";

type LibraryWindow = Window & {
  LIBRARY_CATEGORIES?: string[];
  LIBRARY_FEATURED_IDS?: string[];
  LIBRARY_MATERIALS?: LibraryMaterial[];
};

function loadScript(src: string) {
  return new Promise<HTMLScriptElement>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.dataset.reactLegacyAsset = "library";
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Unable to load ${src}`));
    document.body.appendChild(script);
  });
}

export default function LibraryPage() {
  useLayoutEffect(() => {
    document.title = "The Library | The Hall of Artisans";
    document.body.classList.add("library-body");

    const links = libraryStyles.map((href) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.reactLegacyAsset = "library";
      document.head.appendChild(link);
      return link;
    });

    return () => {
      document.body.classList.remove("library-body", "library-modal-open", "show-indische-only");
      links.forEach((link) => link.remove());
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadedScripts: HTMLScriptElement[] = [];

    const startLibrary = async () => {
      for (const src of libraryDataScripts) {
        const script = await loadScript(src);
        loadedScripts.push(script);
        if (cancelled) return;
      }

      try {
        const catalog = await loadLibraryCatalog();
        if (catalog && !cancelled) {
          const libraryWindow = window as LibraryWindow;
          libraryWindow.LIBRARY_CATEGORIES = catalog.categories;
          libraryWindow.LIBRARY_FEATURED_IDS = catalog.featuredIds;
          libraryWindow.LIBRARY_MATERIALS = catalog.materials;
          document.body.dataset.libraryCatalogSource = "supabase";
        } else {
          document.body.dataset.libraryCatalogSource = "legacy";
        }
      } catch (error) {
        document.body.dataset.libraryCatalogSource = "legacy";
        console.warn("Supabase material catalog unavailable; using the local Library catalog.", error);
      }

      if (cancelled) return;
      const uiScript = await loadScript(libraryUiScript);
      loadedScripts.push(uiScript);
    };

    void startLibrary().catch((error) => {
      if (!cancelled) console.error(error);
    });

    return () => {
      cancelled = true;
      delete document.body.dataset.libraryCatalogSource;
      loadedScripts.forEach((script) => script.remove());
    };
  }, []);

  return (
    <>
      <GlobalHeader activeLabel="The Library" variant="light" />
      <main className="library-page" id="library">
        <div className="library-shell">
          <section className="library-hero" aria-labelledby="library-title">
            <div className="library-flourish" aria-hidden="true" />
            <h1 id="library-title">The Library</h1>
            <p>Explore the materials, notes, and accords of Indische World.</p>
            <label className="library-search">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m16.2 16.2 4.3 4.3" />
              </svg>
              <input
                type="search"
                data-library-search
                placeholder="Search materials, notes, accords..."
                autoComplete="off"
              />
            </label>
          </section>

          <nav className="category-rail" data-category-chips aria-label="Library categories" />
          <section className="material-grid" data-library-grid aria-label="Material library" />

          <section className="indische-section" aria-labelledby="indische-title">
            <div className="indische-copy">
              <h2 id="indische-title">Indische Materials — Coming Soon</h2>
              <p>Rare, legendary, and long-awaited materials from the far corners of Indische World are currently being catalogued.</p>
            </div>
            <div className="coming-soon-grid" data-coming-soon-grid aria-label="Coming soon Indische materials" />
          </section>

          <section className="library-cta" aria-labelledby="library-cta-title">
            <h2 id="library-cta-title">Ready to create your own scent?</h2>
            <span>Choose your materials, follow your story, and begin your first creation inside The Hall.</span>
            <a href="/chamber-of-creation">Enter Make Your Perfume</a>
          </section>
        </div>
      </main>

      <div className="library-modal" data-library-modal aria-hidden="true">
        <article className="library-modal-card" role="dialog" aria-modal="true" aria-labelledby="libraryModalTitle">
          <button className="library-close" type="button" data-library-close>Close</button>
          <div data-library-modal-panel />
        </article>
      </div>
    </>
  );
}
