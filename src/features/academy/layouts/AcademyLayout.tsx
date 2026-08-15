import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../../contexts/AuthContext";
import { authService } from "../../auth/authService";
import { useAcademyLocale } from "../hooks/useAcademyLocale";
import "../styles/academy-tokens.css";

export default function AcademyLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useAcademyLocale();
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const brightPanels = document.createElement("link");
    brightPanels.rel = "stylesheet";
    brightPanels.href = "/assets/css/ornate-panel-bright.css?v=1";
    brightPanels.dataset.academyBrightPanels = "true";
    document.head.appendChild(brightPanels);
    return () => brightPanels.remove();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const closeAccount = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("pointerdown", closeAccount);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("pointerdown", closeAccount);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, []);

  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    const result = await authService.signOut();
    if (!result.ok) {
      setSigningOut(false);
      return;
    }
    setAccountOpen(false);
    navigate("/");
  };

  return (
    <div className="academy-shell">
      <header className={`academy-header${mobileNavOpen ? " academy-header--menu-open" : ""}`}>
        <a className="academy-header__brand" href="/" aria-label="The Hall of Artisans home">
          <img src="/assets/images/hall-artisans-header-logo.webp" alt="" />
          <span><strong>The Hall of Artisans</strong><small>Indische World</small></span>
        </a>
        <nav className="academy-header__nav" aria-label={t("navigation")}>
          <NavLink end to="/academy">{t("title")}</NavLink>
          <NavLink to="/academy/courses">{t("courses")}</NavLink>
          <NavLink to="/my-academy">{t("myAcademy")}</NavLink>
        </nav>
        <div className={`academy-header__account account-menu${accountOpen ? " open" : ""}`} ref={accountRef}>
          <button className="academy-header__account-trigger" type="button" aria-label="Open account menu" aria-haspopup="menu" aria-expanded={accountOpen} onClick={() => setAccountOpen((open) => !open)}>
            <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="10.5" r="5.4" /><path d="M6.5 27c.8-6 4.3-9.1 9.5-9.1S24.7 21 25.5 27" /></svg>
          </button>
          <div className="account-dropdown" role="menu">
            <span className="account-dropdown-label">{user?.email ? "Signed in" : "Artisan Account"}</span>
            {user?.email ? <>
              <span className="account-dropdown-identity" title={user.email}>{user.email}</span>
              <Link to="/my-artisan-id" role="menuitem" onClick={() => setAccountOpen(false)}><i aria-hidden="true">ID</i><span><strong>My Artisan ID</strong><small>View your identity card</small></span></Link>
              <Link to="/my-creations/latest" role="menuitem" onClick={() => setAccountOpen(false)}><i aria-hidden="true">C</i><span><strong>My Creations</strong><small>Follow your bespoke journeys</small></span></Link>
              <button className="account-dropdown-action" type="button" role="menuitem" disabled={signingOut} onClick={() => void signOut()}><i aria-hidden="true">→</i><span><strong>{signingOut ? "Signing Out..." : "Sign Out"}</strong><small>End this device session</small></span></button>
            </> : <>
              <Link to="/artisan-login" role="menuitem" onClick={() => setAccountOpen(false)}><i aria-hidden="true">→</i><span><strong>Sign In</strong><small>Open your Artisan account</small></span></Link>
              <Link to="/artisan-register" role="menuitem" onClick={() => setAccountOpen(false)}><i aria-hidden="true">+</i><span><strong>Register</strong><small>Create your Artisan account</small></span></Link>
            </>}
          </div>
        </div>
        <button className="academy-header__menu-trigger" type="button" aria-label="Open Academy navigation" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((open) => !open)}>
          <span /><span /><span />
        </button>
      </header>
      <Outlet />
      <nav className="academy-mobile-dock" aria-label="Academy mobile navigation">
        <a href="/" aria-label="The Hall"><img src="/assets/images/hall-artisans-header-logo.webp" alt="" /><span>The Hall</span></a>
        <NavLink to="/academy/courses"><span className="academy-mobile-dock__icon" aria-hidden="true">&#9783;</span><span>Courses</span></NavLink>
        <NavLink to="/my-academy"><span className="academy-mobile-dock__icon" aria-hidden="true">&#8962;</span><span>My Academy</span></NavLink>
        <span className="academy-mobile-dock__locale"><span className="academy-mobile-dock__icon" aria-hidden="true">&#8853;</span><span>EN / ID</span></span>
      </nav>
    </div>
  );
}
