import { useEffect, useLayoutEffect } from "react";
import GlobalHeader from "../components/GlobalHeader";

const academyStyles = [
  "/assets/css/styles.css?v=17",
  "/assets/css/academy.css?v=2",
  "/assets/css/header-consistency.css?v=1"
];

const academyScripts = [
  "/assets/js/academy-data.js",
  "/assets/js/academy.js"
];

function loadScript(src: string) {
  return new Promise<HTMLScriptElement>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.dataset.reactLegacyAsset = "academy";
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Unable to load ${src}`));
    document.body.appendChild(script);
  });
}

export default function AcademyPage() {
  useLayoutEffect(() => {
    document.title = "The Academy | The Hall of Artisans";
    document.body.classList.add("academy-body");

    const links = academyStyles.map((href) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.reactLegacyAsset = "academy";
      document.head.appendChild(link);
      return link;
    });

    return () => {
      document.body.classList.remove("academy-body");
      links.forEach((link) => link.remove());
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadedScripts: HTMLScriptElement[] = [];

    const startAcademy = async () => {
      for (const src of academyScripts) {
        const script = await loadScript(src);
        loadedScripts.push(script);
        if (cancelled) break;
      }
    };

    void startAcademy().catch((error) => {
      if (!cancelled) console.error(error);
    });

    return () => {
      cancelled = true;
      loadedScripts.forEach((script) => script.remove());
    };
  }, []);

  return (
    <>
      <GlobalHeader activeLabel="The Academy" variant="light" />
      <main id="academy" className="academy-page">
        <section className="academy-hero" aria-labelledby="academy-title">
          <div className="academy-veil" />
          <div className="academy-title-block">
            <h1 id="academy-title">The Academy</h1>
            <img src="/assets/academy/icons/divider.svg" className="title-divider" alt="" />
            <p>Learn the language of fragrance inside The Hall of Artisans.</p>
          </div>
          <div className="lesson-grid" data-lesson-grid aria-label="Academy lessons" />
        </section>
      </main>

      <div className="lesson-modal" data-modal aria-hidden="true">
        <article
          className="lesson-modal-panel"
          data-modal-panel
          role="dialog"
          aria-modal="true"
          aria-label="Academy lesson"
        />
      </div>
    </>
  );
}
