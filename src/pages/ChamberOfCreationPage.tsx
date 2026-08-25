import { type MouseEvent, type UIEvent, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import GlobalHeader from "../components/GlobalHeader";

export default function ChamberOfCreationPage() {
  const navigate = useNavigate();
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const [activeMode, setActiveMode] = useState(1);
  const [theme, setTheme] = useState<"dark" | "bright">(() => {
    const saved = window.localStorage.getItem("hoa-theme");
    return saved === "dark" || saved === "bright" ? saved : "dark";
  });
  const isDark = theme === "dark";

  const toggleTheme = () => {
    const nextTheme = isDark ? "bright" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("hoa-theme", nextTheme);
  };

  useLayoutEffect(() => {
    const previousTitle = document.title;
    document.title = "Make Your Perfume | The Hall of Artisans";
    document.body.classList.add("perfume-mode-page");
    document.body.classList.remove("entrance-body", "lobby-body", "page-leaving");
    document.body.dataset.theme = theme;
    return () => {
      document.title = previousTitle;
      document.body.classList.remove("perfume-mode-page", "page-leaving");
      delete document.body.dataset.theme;
    };
  }, []);

  useLayoutEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  useLayoutEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    if (!media.matches) return;

    const centerDefaultMode = () => cardRefs.current[1]?.scrollIntoView({ block: "nearest", inline: "center" });
    const frame = window.requestAnimationFrame(centerDefaultMode);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const centerMode = (index: number) => {
    setActiveMode(index);
    cardRefs.current[index]?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "nearest",
      inline: "center"
    });
  };

  const updateActiveMode = (event: UIEvent<HTMLDivElement>) => {
    const carouselCenter = event.currentTarget.getBoundingClientRect().left + event.currentTarget.clientWidth / 2;
    const closest = cardRefs.current.reduce((best, card, index) => {
      if (!card) return best;
      const bounds = card.getBoundingClientRect();
      const distance = Math.abs(bounds.left + bounds.width / 2 - carouselCenter);
      return distance < best.distance ? { index, distance } : best;
    }, { index: activeMode, distance: Number.POSITIVE_INFINITY });
    if (closest.index !== activeMode) setActiveMode(closest.index);
  };

  const openArtisanBench = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.classList.add("page-leaving");
    window.setTimeout(() => {
      navigate("/artisan-bench");
    }, reduceMotion ? 0 : 260);
  };

  const openDescribeCreation = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate("/describe-your-creation");
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
      <GlobalHeader action={themeToggle} activeLabel="Chamber of Creation" variant="transparent" />
      <main>
        <section className="perfume-page" aria-labelledby="perfumeTitle">
          <img
            className="perfume-bg"
            src={isDark ? "/assets/images/chamber-of-creation-night-v2.webp" : "/assets/images/chamber-of-creation-bright-v2.webp"}
            alt="A warm glass-roofed perfumery atelier with brass tools, flowers, books, bottles, and artisan perfumers."
          />
          <div className="perfume-veil" aria-hidden="true" />

          <div className="perfume-heading">
            <h1 id="perfumeTitle">Chamber of Creation</h1>
            <p>Every fragrance begins differently. Choose how you would like to create yours.</p>
          </div>

          <div className="creation-carousel-shell">
          <div className="creation-grid creation-art-grid" aria-label="Creation modes" onScroll={updateActiveMode}>
            <a ref={(node) => { cardRefs.current[0] = node; }} className={`creation-art-card creation-art-left creation-art-card-describe${activeMode === 0 ? " is-active" : ""}`} href="/describe-your-creation" aria-label="Describe Your Creation" onClick={(event) => {
              if (window.matchMedia("(max-width: 700px)").matches && activeMode !== 0) { event.preventDefault(); centerMode(0); return; }
              openDescribeCreation(event);
            }}>
              <img className="panel-art panel-art-dark" src="/assets/images/describe-your-creation-panel.webp" alt="An ornate writing desk with a botanical journal, quill, ink bottle, flowers, and a golden frame." />
              <img className="panel-art panel-art-bright" src="/assets/images/describe-your-creation-panel-bright-v4.webp" alt="" />
              <span className="creation-art-copy creation-art-title">Describe Your Creation</span>
              <span className="creation-art-copy creation-art-desc">Tell our artisans the feeling,<br />memory, or world you imagine.</span>
              <span className="creation-art-copy creation-art-button-text">Write Your Story</span>
            </a>

            <a ref={(node) => { cardRefs.current[1] = node; }} className={`creation-art-card creation-art-card-primary${activeMode === 1 ? " is-active" : ""}`} href="/artisan-bench" aria-label="Make Your Perfume" onClick={(event) => {
              if (window.matchMedia("(max-width: 700px)").matches && activeMode !== 1) { event.preventDefault(); centerMode(1); return; }
              openArtisanBench(event);
            }}>
              <img className="panel-art panel-art-dark" src="/assets/images/make-card-chamber-of-creation.webp" alt="Make Your Perfume" />
              <img className="panel-art panel-art-bright" src="/assets/images/bright-panel-primary.webp" alt="" />
              <span className="creation-art-copy creation-art-title">Artisan Bench</span>
              <span className="creation-art-copy creation-art-desc">Craft your fragrance from<br />carefully selected materials<br />inside the Hall.</span>
              <span className="creation-art-copy creation-art-button-text">Make Your Perfume</span>
            </a>

            <div ref={(node) => { cardRefs.current[2] = node; }} className={`creation-art-card creation-art-card-soon creation-art-right${activeMode === 2 ? " is-active" : ""}`} aria-label="Coming Soon, locked" role="group" aria-disabled="true" onClick={() => centerMode(2)}>
              <img className="panel-art panel-art-dark" src="/assets/images/make-card-coming-soon-green.webp" alt="Coming soon creation mode" />
              <img className="panel-art panel-art-bright" src="/assets/images/bright-panel-right.webp" alt="" />
              <span className="creation-art-copy creation-art-title">Coming Soon</span>
              <span className="creation-art-copy creation-art-desc">A new way to create<br />is being crafted.</span>
            </div>
          </div>

          <div className="creation-carousel-controls" aria-label="Choose a creation mode">
            <button type="button" className="creation-carousel-arrow" onClick={() => centerMode(Math.max(0, activeMode - 1))} disabled={activeMode === 0} aria-label="Previous creation mode">&#8249;</button>
            <div className="creation-carousel-dots">
              {["Describe Your Creation", "Artisan Bench", "Coming Soon"].map((label, index) => (
                <button key={label} type="button" className={activeMode === index ? "is-active" : ""} onClick={() => centerMode(index)} aria-label={`Show ${label}`} aria-current={activeMode === index ? "true" : undefined} />
              ))}
            </div>
            <button type="button" className="creation-carousel-arrow" onClick={() => centerMode(Math.min(2, activeMode + 1))} disabled={activeMode === 2} aria-label="Next creation mode">&#8250;</button>
          </div>
          </div>

          <p className="access-note"><strong>Explore freely.</strong><span>Artisan ID is only required when you save or submit.</span></p>
        </section>
      </main>
    </>
  );
}
