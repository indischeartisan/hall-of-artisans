import { type MouseEvent, useLayoutEffect } from "react";
import { useNavigate } from "react-router";
import GlobalHeader from "../components/GlobalHeader";

export default function ChamberOfCreationPage() {
  const navigate = useNavigate();
  const isDark = true;
  const toggleTheme = () => undefined;

  useLayoutEffect(() => {
    const previousTitle = document.title;
    document.title = "Make Your Perfume | The Hall of Artisans";
    document.body.classList.add("perfume-mode-page");
    document.body.classList.remove("entrance-body", "lobby-body", "page-leaving");
    document.body.dataset.theme = "dark";
    return () => {
      document.title = previousTitle;
      document.body.classList.remove("perfume-mode-page", "page-leaving");
      delete document.body.dataset.theme;
    };
  }, []);

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
      <GlobalHeader activeLabel="Chamber of Creation" variant="transparent" />
      <main>
        <section className="perfume-page" aria-labelledby="perfumeTitle">
          <img
            className="perfume-bg"
            src="/assets/images/make-your-perfume-background.webp"
            alt="A warm glass-roofed perfumery atelier with brass tools, flowers, books, bottles, and artisan perfumers."
          />
          <div className="perfume-veil" aria-hidden="true" />

          <div className="perfume-heading">
            <h1 id="perfumeTitle">Chamber of Creation</h1>
            <p>Every fragrance begins differently. Choose how you would like to create yours.</p>
          </div>

          <div className="creation-grid creation-art-grid" aria-label="Creation modes">
            <a className="creation-art-card creation-art-left creation-art-card-describe" href="/describe-your-creation" aria-label="Describe Your Creation" onClick={openDescribeCreation}>
              <img className="panel-art panel-art-dark" src="/assets/images/describe-your-creation-panel.webp" alt="An ornate writing desk with a botanical journal, quill, ink bottle, flowers, and a golden frame." />
              <img className="panel-art panel-art-bright" src="/assets/images/describe-your-creation-panel.webp" alt="" />
              <span className="creation-art-copy creation-art-title">Describe Your Creation</span>
              <span className="creation-art-copy creation-art-desc">Tell our artisans the feeling,<br />memory, or world you imagine.</span>
              <span className="creation-art-copy creation-art-button-text">Write Your Story</span>
            </a>

            <a className="creation-art-card creation-art-card-primary" href="/artisan-bench" aria-label="Make Your Perfume" onClick={openArtisanBench}>
              <img className="panel-art panel-art-dark" src="/assets/images/make-card-chamber-of-creation.webp" alt="Make Your Perfume" />
              <img className="panel-art panel-art-bright" src="/assets/images/bright-panel-primary.webp" alt="" />
              <span className="creation-art-copy creation-art-title">Artisan Bench</span>
              <span className="creation-art-copy creation-art-desc">Craft your fragrance from<br />carefully selected materials<br />inside the Hall.</span>
              <span className="creation-art-copy creation-art-button-text">Make Your Perfume</span>
            </a>

            <div className="creation-art-card creation-art-card-soon creation-art-right" aria-label="Coming Soon">
              <img className="panel-art panel-art-dark" src="/assets/images/make-card-coming-soon-green.webp" alt="Coming soon creation mode" />
              <img className="panel-art panel-art-bright" src="/assets/images/bright-panel-right.webp" alt="" />
              <span className="creation-art-copy creation-art-title">Coming Soon</span>
              <span className="creation-art-copy creation-art-desc">A new way to create<br />is being crafted.</span>
            </div>
          </div>

          <p className="access-note">You may explore these modes without registration. A Perfumer ID is only needed later to save, share, submit, or track a real creation.</p>
        </section>
      </main>
    </>
  );
}
