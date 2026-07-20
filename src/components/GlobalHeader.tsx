import { type MouseEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { navigationItems } from "../data/navigation";

export type GlobalHeaderVariant = "default" | "transparent" | "light";

export type GlobalHeaderProps = {
  action?: ReactNode;
  activeLabel?: string;
  variant?: GlobalHeaderVariant;
};

const normalizePath = (value: string) => {
  const path = value.split("#")[0].split("?")[0];
  return path === "/index.html" ? "/" : path;
};

export default function GlobalHeader({ action, activeLabel, variant = "default" }: GlobalHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 18);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
    document.body.classList.remove("page-leaving");
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("nav-open", menuOpen);
    return () => document.body.classList.remove("nav-open");
  }, [menuOpen]);

  useEffect(() => {
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenuOpen(false); setAccountOpen(false); }
    };
    const closeAccount = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("keydown", closeWithEscape);
    document.addEventListener("pointerdown", closeAccount);
    return () => { document.removeEventListener("keydown", closeWithEscape); document.removeEventListener("pointerdown", closeAccount); };
  }, []);

  const currentPath = normalizePath(location.pathname);
  const isActive = (label: string, href: string) => {
    if (activeLabel) return activeLabel === label;
    return normalizePath(href) === currentPath;
  };

  const headerClasses = [
    "site-header",
    "global-header",
    `global-header--${variant}`,
    scrolled ? "scrolled" : "",
    menuOpen ? "menu-active" : ""
  ].filter(Boolean).join(" ");

  const navigateWithTransition = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    setMenuOpen(false);
    if (href.startsWith("#") || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.classList.add("page-leaving");
    window.setTimeout(() => {
      navigate(href);
    }, reduceMotion ? 0 : 260);
  };

  return (
    <header className={headerClasses} id="siteHeader">
      <a className="brand" href="/" aria-label="The Hall of Artisans home" onClick={(event) => navigateWithTransition(event, "/")}>
        <span className="brand-mark" aria-hidden="true">
          <img src="/assets/images/hall-artisans-header-logo.webp" alt="" />
        </span>
        <span className="brand-copy">
          <span className="brand-text">The Hall of Artisans</span>
          <span className="brand-world">Indische World</span>
        </span>
      </a>

      <button
        className="menu-toggle"
        id="menuToggle"
        type="button"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-controls="mainNav"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={`main-nav${menuOpen ? " open" : ""}`} id="mainNav" aria-label="Main navigation">
        {navigationItems.map((item) => {
          const active = isActive(item.label, item.href);
          return (
            <a
              key={item.label}
              className={active ? "active" : undefined}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={(event) => navigateWithTransition(event, item.href)}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
      <div className={`account-menu${accountOpen ? " open" : ""}`} ref={accountRef}>
        <button
          className="account-menu-trigger"
          type="button"
          aria-label="Open account menu"
          aria-haspopup="menu"
          aria-expanded={accountOpen}
          onClick={() => setAccountOpen((open) => !open)}
        >
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="16" cy="10.5" r="5.4" />
            <path d="M6.5 27c.8-6 4.3-9.1 9.5-9.1S24.7 21 25.5 27" />
          </svg>
        </button>
        <div className="account-dropdown" role="menu">
          <span className="account-dropdown-label">Artisan Account</span>
          <a href="/artisan-register" role="menuitem" onClick={(event) => navigateWithTransition(event, "/artisan-register")}><i>＋</i><span><strong>Register</strong><small>Create your Artisan account</small></span></a>
          <a href="/my-artisan-id" role="menuitem" onClick={(event) => navigateWithTransition(event, "/my-artisan-id")}><i>♙</i><span><strong>My Artisan ID</strong><small>View your identity card</small></span></a>
          <a href="/my-orders/latest" role="menuitem" onClick={(event) => navigateWithTransition(event, "/my-orders/latest")}><i>◇</i><span><strong>My Orders</strong><small>Follow your creations</small></span></a>
        </div>
      </div>
      {action}
    </header>
  );
}
