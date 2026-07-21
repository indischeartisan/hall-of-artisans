import { type MouseEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import GlobalHeader from "../components/GlobalHeader";

export default function EntranceHallPage() {
  const heroRef = useRef<HTMLElement>(null);
  const heroImageRef = useRef<HTMLImageElement>(null);
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"dark" | "bright">(() => {
    const saved = window.localStorage.getItem("hoa-theme");
    return saved === "dark" || saved === "bright" ? saved : "bright";
  });
  const isDark = theme === "dark";

  useLayoutEffect(() => {
    document.body.classList.add("entrance-body");
    document.body.dataset.theme = theme;
    const brightPanels = document.createElement("link");
    brightPanels.rel = "stylesheet";
    brightPanels.href = "/assets/css/ornate-panel-bright.css?v=1";
    brightPanels.dataset.reactLegacyAsset = "entrance-bright-panels";
    document.head.appendChild(brightPanels);

    return () => {
      document.body.classList.remove("entrance-body", "page-leaving");
      delete document.body.dataset.theme;
      brightPanels.remove();
    };
  }, []);

  useLayoutEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let frame = 0;
    const updateHeroMotion = () => {
      const hero = heroRef.current;
      const heroImage = heroImageRef.current;
      if (!hero || !heroImage) return;
      const rect = hero.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / hero.offsetHeight));
      const baseScale = isDark ? 1 : 1.04;
      const scrollScale = isDark ? progress * 0.012 : progress * 0.035;
      const travel = isDark ? 0 : progress * 54;
      heroImage.style.transform = `translate3d(0, ${travel}px, 0) scale(${baseScale + scrollScale})`;
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateHeroMotion);
    };
    updateHeroMotion();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isDark]);

  const enterHall = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.classList.add("page-leaving");
    window.setTimeout(() => navigate("/hall"), reduceMotion ? 0 : 260);
  };

  const toggleTheme = () => {
    const nextTheme = isDark ? "bright" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("hoa-theme", nextTheme);
  };

  const themeToggle = (
    <button
      className="theme-toggle entrance-theme-toggle"
      type="button"
      aria-label={isDark ? "Switch to bright mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      onClick={toggleTheme}
    >
      <span className="theme-toggle-icon" aria-hidden="true">{isDark ? "☀" : "☾"}</span>
    </button>
  );

  return (
    <>
      <GlobalHeader action={themeToggle} variant="transparent" />
      <main id="top">
        <section className="hero" aria-label="The Hall of Artisans entrance" ref={heroRef}>
          <picture>
            <source media="(min-width: 1024px) and (orientation: landscape)" srcSet={isDark ? "/assets/images/hall-entrance-night-desktop-v2.png" : "/assets/images/hall-entrance-desktop-bg.webp"} />
            <img
              className="hero-image"
              ref={heroImageRef}
              src={isDark ? "/assets/images/hall-entrance-night-mobile.webp" : "/assets/images/hall-entrance-bg.webp"}
              alt={`${isDark ? "A moonlit" : "A bright"} glass conservatory perfume hall filled with artisans, flowers, antique carts, and golden perfume tools.`}
            />
          </picture>
          <div className="hero-shade" aria-hidden="true" />
          <div className="hero-content">
            <p className="eyebrow">Indische World</p>
            <h1>The Hall of Artisans</h1>
            <p className="tagline">A place within Indische World where extraordinary scents are born through story, craft, and timeless artistry.</p>
            <div className="hero-entry-actions">
              <a className="primary-button hero-enter-panel inner-panel" href="/hall" aria-label="Enter The Hall" onClick={enterHall}>
                <span>Enter The Hall</span>
              </a>
              <a className="primary-button hero-enter-panel inner-panel" href="/chamber-of-creation" aria-label="Craft Your Own Perfume">
                <span>Craft Your Own Perfume</span>
              </a>
            </div>
            <a className="scroll-indicator" href="#hall-lobby" aria-label="Scroll to discover The Hall of Artisans">
              <span>Scroll to Discover</span>
              <i aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="intro-section" id="hall-lobby">
          <div className="section-inner section-narrow">
            <img className="inside-hall-logo" src="/assets/images/hall-artisans-header-logo.webp" alt="The Hall of Artisans" />
            <p className="section-kicker">Inside The Hall</p>
            <h2>What Is The Hall of Artisans?</h2>
            <div className="ornament" aria-hidden="true" />
            <p>The Hall of Artisans is a place within Indische World where visitors may learn the language of fragrance, explore unusual materials, and create scents of their own.</p>
            <p>Some arrive to learn. Some arrive to create. Some arrive to turn their stories into real perfumes.</p>
          </div>
        </section>

        <section className="final-cta">
          <div className="section-inner section-narrow">
            <p className="section-kicker">The Hall Awaits</p>
            <h2>Every Extraordinary Scent Has A Beginning.</h2>
            <div className="ornament" aria-hidden="true" />
            <p>Beyond these doors lies the Academy, the Library, and the Creation Chambers of The Hall of Artisans.</p>
            <a className="primary-button svg-button" href="/hall" aria-label="Enter The Hall" onClick={enterHall}>
              <img src="/assets/images/enter-hall-button.svg" alt="" aria-hidden="true" />
              <span>Enter The Hall</span>
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
