import { type MouseEvent, useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router";
import GlobalHeader from "../components/GlobalHeader";

type LobbyLinkProps = {
  ariaLabel: string;
  className: string;
  href: string;
  icon: string;
  id?: string;
};

function LobbyLink({ ariaLabel, className, href, icon, id }: LobbyLinkProps) {
  const navigate = useNavigate();
  const navigateWithTransition = (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith("#") || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.classList.add("page-leaving");
    window.setTimeout(() => {
      navigate(href);
    }, reduceMotion ? 0 : 260);
  };

  return (
    <a className={className} id={id} href={href} aria-label={ariaLabel} onClick={navigateWithTransition}>
      <img src={icon} alt="" />
    </a>
  );
}

const desktopLinks: LobbyLinkProps[] = [
  { className: "lobby-marker marker-archive", id: "hall-archive", href: "/hall-archive", ariaLabel: "Hall Archive", icon: "/assets/icons/translucent/hall-archive.webp" },
  { className: "lobby-marker marker-academy", id: "academy", href: "/academy", ariaLabel: "The Academy", icon: "/assets/icons/translucent/academy.webp" },
  { className: "lobby-marker marker-library", id: "library", href: "/library", ariaLabel: "The Library", icon: "/assets/icons/translucent/library.webp" },
  { className: "lobby-marker marker-make marker-primary", id: "make-your-perfume", href: "/chamber-of-creation", ariaLabel: "Make Your Perfume", icon: "/assets/icons/translucent/make-your-perfume.webp" },
  { className: "lobby-marker marker-bespoke", id: "bespoke-atelier", href: "/bespoke-atelier", ariaLabel: "Bespoke Atelier", icon: "/assets/icons/translucent/bespoke-atelier.webp" },
  { className: "lobby-marker marker-register", id: "artisan-register", href: "/artisan-register", ariaLabel: "Artisan Register", icon: "/assets/icons/translucent/artisan-register.webp" }
];

const mobileLinks: LobbyLinkProps[] = [
  { className: "mobile-marker mobile-main-cta mobile-marker-make", href: "/chamber-of-creation", ariaLabel: "Make Your Perfume", icon: "/assets/icons/translucent/make-your-perfume.webp" },
  { className: "mobile-marker mobile-marker-archive", href: "/hall-archive", ariaLabel: "Hall Archive", icon: "/assets/icons/translucent/hall-archive.webp" },
  { className: "mobile-marker mobile-marker-academy", href: "/academy", ariaLabel: "The Academy", icon: "/assets/icons/translucent/academy.webp" },
  { className: "mobile-marker mobile-marker-library", href: "/library", ariaLabel: "The Library", icon: "/assets/icons/translucent/library.webp" },
  { className: "mobile-marker mobile-marker-bespoke", href: "/bespoke-atelier", ariaLabel: "Bespoke Atelier", icon: "/assets/icons/translucent/bespoke-atelier.webp" },
  { className: "mobile-marker mobile-marker-register", href: "/artisan-register", ariaLabel: "Artisan Register", icon: "/assets/icons/translucent/artisan-register.webp" }
];

export default function LobbyPage() {
  const [theme, setTheme] = useState<"dark" | "bright">(() => {
    const saved = window.localStorage.getItem("hoa-theme");
    return saved === "dark" || saved === "bright" ? saved : "bright";
  });
  const isDark = theme === "dark";

  useLayoutEffect(() => {
    const previousTitle = document.title;
    document.title = "Artisan Hall Lobby | The Hall of Artisans";
    document.body.classList.add("lobby-body");
    document.body.classList.remove("entrance-body", "page-leaving");
    document.body.dataset.theme = theme;
    return () => {
      document.title = previousTitle;
      document.body.classList.remove("lobby-body", "page-leaving");
      delete document.body.dataset.theme;
    };
  }, []);

  useLayoutEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = isDark ? "bright" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("hoa-theme", nextTheme);
  };

  const themeToggle = (
    <button
      className="theme-toggle theme-toggle--slider lobby-theme-toggle"
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
      <GlobalHeader action={themeToggle} activeLabel="The Hall" variant="transparent" />
      <main>
        <section className="lobby-section lobby-page" id="lobby" aria-labelledby="lobbyTitle">
          <div className="lobby-desktop" aria-hidden="false">
            <div className="lobby-shade" aria-hidden="true" />
            <div className="lobby-header">
              <h1 id="lobbyTitle">The Hall of Artisans</h1>
            </div>

            <nav className="lobby-map" aria-label="Artisan Hall Lobby paths">
              {desktopLinks.map((link) => <LobbyLink key={link.className} {...link} />)}
            </nav>
          </div>

          <div className="lobby-mobile" aria-labelledby="mobileLobbyTitle">
            <div className="lobby-mobile-shade" aria-hidden="true" />
            <div className="mobile-lobby-title">
              <img src="/assets/images/hall-artisans-header-logo.webp" alt="The Hall of Artisans crest" />
              <h1 id="mobileLobbyTitle">The Hall of Artisans</h1>
              <p>Choose your path inside The Hall</p>
              <img className="mobile-ornament" src="/assets/icons/ornament-line.webp" alt="" aria-hidden="true" />
            </div>

            <nav className="mobile-lobby-actions" aria-label="Artisan Hall Lobby mobile paths">
              {mobileLinks.map((link) => <LobbyLink key={link.className} {...link} />)}
            </nav>
          </div>
        </section>
      </main>
    </>
  );
}
