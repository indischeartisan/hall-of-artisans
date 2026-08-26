import { cloneElement, isValidElement, type MouseEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { navigationItems } from "../data/navigation";
import { authService } from "../features/auth/authService";
import { useAuth } from "../contexts/AuthContext";
import { orderService, type CustomerNotification } from "../features/orders/orderService";
import { subscribeToCustomerNotificationUpdates } from "../features/orders/requestLiveUpdates";
import DraftsModal from "./DraftsModal";

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
  const { user, profile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [accountMessage, setAccountMessage] = useState("");
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<"chat" | "update">("chat");
  const [scrolled, setScrolled] = useState(false);
  const [draftsOpen, setDraftsOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const mobileAccountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 18);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
    setAccountMessage("");
    document.body.classList.remove("page-leaving");
  }, [location.pathname]);

  const accountEmail = user?.email ?? null;
  const accountDisplayName = String(
    profile?.display_name
    ?? user?.user_metadata?.display_name
    ?? user?.user_metadata?.full_name
    ?? user?.email?.split("@")[0]
    ?? "Artisan ID"
  ).trim();

  const loadNotifications = useCallback(async () => {
    if (!user?.id) { setNotifications([]); return; }
    try {
      setNotifications(await orderService.getNotificationFeed(user.id));
    } catch { setNotifications([]); }
  }, [user?.id]);

  useEffect(() => {
    void loadNotifications();
    if (!user) return;
    const refresh = () => void loadNotifications();
    const unsubscribe = subscribeToCustomerNotificationUpdates(user.id, refresh);
    window.addEventListener("hoa:orders-change", refresh);
    return () => { unsubscribe(); window.removeEventListener("hoa:orders-change", refresh); };
  }, [loadNotifications, user]);

  const isNotificationUnread = useCallback((item: CustomerNotification) => item.readAt === null, []);
  const unreadNotifications = useMemo(() => {
    const latestByCreationAndKind = new Set<string>();
    return notifications.filter(isNotificationUnread).filter(item => {
      const groupKey = `${item.kind}:${item.requestId}`;
      if (latestByCreationAndKind.has(groupKey)) return false;
      latestByCreationAndKind.add(groupKey);
      return true;
    });
  }, [notifications, isNotificationUnread]);
  const unreadChats = unreadNotifications.filter(item => item.kind === "chat").length;
  const unreadUpdates = unreadNotifications.filter(item => item.kind === "update").length;
  const markRequestNotificationsSeen = useCallback((requestId: string) => {
    setNotifications(current => current.map(item => item.requestId === requestId ? { ...item, readAt: item.readAt ?? new Date().toISOString() } : item));
    void orderService.markNotificationsRead(requestId).catch(() => void loadNotifications());
  }, [loadNotifications]);
  const markNotificationsSeen = () => {
    setNotifications(current => current.map(item => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
    void orderService.markNotificationsRead().catch(() => void loadNotifications());
  };
  const openNotification = (requestId: string) => { markRequestNotificationsSeen(requestId); setAccountOpen(false); navigate(`/my-creations/${requestId}`); };

  useEffect(() => {
    const match = location.pathname.match(/^\/my-(?:creations|orders)\/([^/]+)/);
    const requestId = match?.[1] && match[1] !== "latest" ? decodeURIComponent(match[1]) : "";
    if (requestId && notifications.some(item => item.requestId === requestId && isNotificationUnread(item))) markRequestNotificationsSeen(requestId);
  }, [location.pathname, notifications, isNotificationUnread, markRequestNotificationsSeen]);

  useEffect(() => {
    if (!user) setSigningOut(false);
  }, [user]);

  useEffect(() => {
    document.body.classList.toggle("nav-open", menuOpen);
    return () => document.body.classList.remove("nav-open");
  }, [menuOpen]);

  useEffect(() => {
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenuOpen(false); setAccountOpen(false); }
    };
    const closeAccount = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node) && !mobileAccountRef.current?.contains(event.target as Node)) setAccountOpen(false);
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

  const mobileAction = isValidElement<{ className?: string; id?: string }>(action)
    ? cloneElement(action, {
        id: undefined,
        className: `${action.props.className ?? ""} mobile-nav-theme-action`.trim()
      })
    : action;

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

  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setAccountMessage("");
    const result = await authService.signOut();
    if (!result.ok) {
      setAccountMessage(result.error.message);
      setSigningOut(false);
      return;
    }
    setAccountOpen(false);
    navigate("/");
  };

  return (
    <>
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
        <div className="mobile-nav-tools" aria-label="Account and appearance" ref={mobileAccountRef}>
          {accountEmail && (
            <>
              <button className="mobile-nav-account-item mobile-nav-notifications mobile-nav-notifications-primary" type="button" onClick={() => setNotificationsOpen(open => !open)}>
                <i aria-hidden="true">✉</i><span><strong>Messages &amp; Updates</strong><small>{unreadNotifications.length ? `${unreadNotifications.length} unread notifications` : "You're all caught up"}</small></span>
                {unreadNotifications.length > 0 && <b>{unreadNotifications.length > 99 ? "99+" : unreadNotifications.length}</b>}
              </button>
              {notificationsOpen && (
                <div className="mobile-nav-notification-list mobile-nav-notification-list-primary">
                  <header>
                    <button type="button" className={notificationFilter === "chat" ? "is-active" : ""} onClick={() => setNotificationFilter("chat")}>Chat <b>{unreadChats}</b></button>
                    <button type="button" className={notificationFilter === "update" ? "is-active" : ""} onClick={() => setNotificationFilter("update")}>Updates <b>{unreadUpdates}</b></button>
                  </header>
                  <div>
                    {unreadNotifications.filter(item => item.kind === notificationFilter).slice(0, 5).map(item => <button type="button" className="is-unread" onClick={() => openNotification(item.requestId)} key={item.id}><i aria-hidden="true">{item.kind === "chat" ? "✉" : "↻"}</i><span><strong>{item.title}</strong><small>{item.detail}</small></span></button>)}
                    {!unreadNotifications.some(item => item.kind === notificationFilter) && <p>No unread {notificationFilter === "chat" ? "messages" : "project updates"}.</p>}
                  </div>
                  <footer><button type="button" onClick={markNotificationsSeen}>Mark all as read</button><a href="/my-creations/latest" onClick={(event) => navigateWithTransition(event, "/my-creations/latest")}>View creations</a></footer>
                </div>
              )}
            </>
          )}
          {mobileAction && (
            <div className="mobile-nav-tool-row">
              <span>Appearance</span>
              {mobileAction}
            </div>
          )}
          <button className="mobile-nav-artisan-id" type="button" aria-expanded={accountOpen} aria-controls="mobileAccountMenu" onClick={() => setAccountOpen(open => !open)}>
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <circle cx="16" cy="10.5" r="5.4" />
              <path d="M6.5 27c.8-6 4.3-9.1 9.5-9.1S24.7 21 25.5 27" />
            </svg>
            <span><strong>{accountEmail ? accountDisplayName : "Artisan ID"}</strong><small>{accountEmail ? "Artisan ID · Open your Hall identity" : "Sign in or create your identity"}</small></span>
            <i aria-hidden="true">{accountOpen ? "−" : "+"}</i>
          </button>
          {accountOpen && (
            <div className="mobile-nav-account-menu" id="mobileAccountMenu">
              {accountEmail ? (
                <>
                  <a className="mobile-nav-account-item" href="/my-artisan-id" onClick={(event) => navigateWithTransition(event, "/my-artisan-id")}><i aria-hidden="true">ID</i><span><strong>My Artisan ID</strong><small>View your identity card</small></span></a>
                  <button className="mobile-nav-account-item" type="button" onClick={() => { setDraftsOpen(true); setMenuOpen(false); setAccountOpen(false); }}><i aria-hidden="true">D</i><span><strong>My Drafts</strong><small>Open your saved creations</small></span></button>
                  <a className="mobile-nav-account-item" href="/my-creations/latest" onClick={(event) => navigateWithTransition(event, "/my-creations/latest")}><i aria-hidden="true">C</i><span><strong>My Creations</strong><small>Follow your bespoke journeys</small></span></a>
                  <button className="mobile-nav-account-item" type="button" disabled={signingOut} onClick={() => void signOut()}><i aria-hidden="true">→</i><span><strong>{signingOut ? "Signing Out..." : "Sign Out"}</strong><small>End this device session</small></span></button>
                </>
              ) : (
                <>
                  <a className="mobile-nav-account-item" href="/artisan-login" onClick={(event) => navigateWithTransition(event, "/artisan-login")}><i aria-hidden="true">→</i><span><strong>Sign In</strong><small>Open your Artisan account</small></span></a>
                  <a className="mobile-nav-account-item" href="/artisan-register" onClick={(event) => navigateWithTransition(event, "/artisan-register")}><i aria-hidden="true">+</i><span><strong>Register</strong><small>Create your Artisan account</small></span></a>
                </>
              )}
            </div>
          )}
        </div>
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
          {unreadNotifications.length > 0 && <b className="account-notification-badge" aria-label={`${unreadNotifications.length} unread notifications`}>{unreadNotifications.length > 99 ? "99+" : unreadNotifications.length}</b>}
        </button>
        <div className="account-dropdown" role="menu">
          <span className="account-dropdown-label">{accountEmail ? "Signed in" : "Artisan Account"}</span>
          {accountEmail ? (
            <>
              <span className="account-dropdown-identity" title={accountEmail}>{accountEmail}</span>
              <button className="account-dropdown-action account-notification-toggle" type="button" role="menuitem" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen(open => !open)}><i aria-hidden="true">✉</i><span><strong>Messages &amp; Updates</strong><small>{unreadNotifications.length ? `${unreadNotifications.length} unread notifications` : "You're all caught up"}</small></span>{unreadNotifications.length > 0 && <b>{unreadNotifications.length}</b>}</button>
              {notificationsOpen && <section className="account-notification-panel" aria-label="Messages and project updates"><header><button type="button" className={notificationFilter === "chat" ? "is-active" : ""} onClick={() => setNotificationFilter("chat")}>Chat <b>{unreadChats}</b></button><button type="button" className={notificationFilter === "update" ? "is-active" : ""} onClick={() => setNotificationFilter("update")}>Updates <b>{unreadUpdates}</b></button></header><div>{unreadNotifications.filter(item => item.kind === notificationFilter).slice(0, 5).map(item => <button type="button" className="is-unread" onClick={() => openNotification(item.requestId)} key={item.id}><i aria-hidden="true">{item.kind === "chat" ? "✉" : "↻"}</i><span><strong>{item.title}</strong><small>{item.detail}</small></span></button>)}{!unreadNotifications.some(item => item.kind === notificationFilter) && <p>No unread {notificationFilter === "chat" ? "messages" : "project updates"}.</p>}</div><footer><button type="button" onClick={markNotificationsSeen}>Mark all as read</button><a href="/my-creations/latest" onClick={(event) => navigateWithTransition(event, "/my-creations/latest")}>View creations</a></footer></section>}
              <a href="/my-artisan-id" role="menuitem" onClick={(event) => navigateWithTransition(event, "/my-artisan-id")}><i aria-hidden="true">ID</i><span><strong>My Artisan ID</strong><small>View your identity card</small></span></a>
              <a href="/my-creations/latest" role="menuitem" onClick={(event) => navigateWithTransition(event, "/my-creations/latest")}><i aria-hidden="true">C</i><span><strong>My Creations</strong><small>Follow your bespoke journeys</small></span></a>
              <button className="account-dropdown-action" type="button" role="menuitem" disabled={signingOut} onClick={() => void signOut()}><i aria-hidden="true">→</i><span><strong>{signingOut ? "Signing Out..." : "Sign Out"}</strong><small>End this device session</small></span></button>
            </>
          ) : (
            <>
              <a href="/artisan-login" role="menuitem" onClick={(event) => navigateWithTransition(event, "/artisan-login")}><i aria-hidden="true">→</i><span><strong>Sign In</strong><small>Open your Artisan account</small></span></a>
              <a href="/artisan-register" role="menuitem" onClick={(event) => navigateWithTransition(event, "/artisan-register")}><i aria-hidden="true">+</i><span><strong>Register</strong><small>Create your Artisan account</small></span></a>
            </>
          )}
          {accountMessage && <span className="account-dropdown-message" role="status">{accountMessage}</span>}
        </div>
      </div>
      {action}
    </header>
    <DraftsModal open={draftsOpen} onClose={() => setDraftsOpen(false)} />
    </>
  );
}
