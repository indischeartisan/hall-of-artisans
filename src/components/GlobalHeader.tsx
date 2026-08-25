import { cloneElement, isValidElement, type MouseEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { navigationItems } from "../data/navigation";
import { authService } from "../features/auth/authService";
import { useAuth } from "../contexts/AuthContext";
import { orderService } from "../features/orders/orderService";

type CustomerNotification = { id: string; requestId: string; kind: "chat" | "update"; title: string; detail: string; createdAt: string };
const CUSTOMER_NOTIFICATIONS_SEEN_KEY = "hoa:customer-notifications-seen:v2";

const loadNotificationSeenByRequest = (): Record<string, number> => {
  try {
    const stored = window.localStorage.getItem(CUSTOMER_NOTIFICATIONS_SEEN_KEY);
    return stored ? JSON.parse(stored) as Record<string, number> : {};
  } catch {
    return {};
  }
};

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
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [accountMessage, setAccountMessage] = useState("");
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<"chat" | "update">("chat");
  const [notificationSeenByRequest, setNotificationSeenByRequest] = useState(loadNotificationSeenByRequest);
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
    setAccountMessage("");
    document.body.classList.remove("page-leaving");
  }, [location.pathname]);

  const accountEmail = user?.email ?? null;

  const loadNotifications = useCallback(async () => {
    if (!user) { setNotifications([]); return; }
    try {
      const requests = await orderService.getRequests(false);
      const details = await Promise.all(requests.map(request => orderService.getDetail(request.id)));
      const next = details.flatMap(detail => detail ? [
        ...detail.messages.filter(message => message.senderRole === "artisan").map(message => ({ id: `chat:${message.id}`, requestId: detail.request.id, kind: "chat" as const, title: detail.request.perfumeName, detail: message.message, createdAt: message.createdAt })),
        ...detail.activity.map(item => ({ id: `update:${item.id}`, requestId: detail.request.id, kind: "update" as const, title: detail.request.perfumeName, detail: item.label, createdAt: item.createdAt }))
      ] : []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 40);
      setNotifications(next);
    } catch { setNotifications([]); }
  }, [user]);

  useEffect(() => {
    void loadNotifications();
    if (!user) return;
    const pollId = window.setInterval(() => { if (document.visibilityState === "visible") void loadNotifications(); }, 5000);
    const refresh = () => void loadNotifications();
    window.addEventListener("hoa:orders-change", refresh);
    return () => { window.clearInterval(pollId); window.removeEventListener("hoa:orders-change", refresh); };
  }, [loadNotifications, user]);

  const isNotificationUnread = useCallback((item: CustomerNotification) => new Date(item.createdAt).getTime() > (notificationSeenByRequest[item.requestId] ?? 0), [notificationSeenByRequest]);
  const unreadNotifications = useMemo(() => notifications.filter(isNotificationUnread), [notifications, isNotificationUnread]);
  const unreadChats = unreadNotifications.filter(item => item.kind === "chat").length;
  const unreadUpdates = unreadNotifications.filter(item => item.kind === "update").length;
  const saveNotificationSeenState = useCallback((next: Record<string, number>) => {
    window.localStorage.setItem(CUSTOMER_NOTIFICATIONS_SEEN_KEY, JSON.stringify(next));
    return next;
  }, []);
  const markRequestNotificationsSeen = useCallback((requestId: string) => {
    setNotificationSeenByRequest(current => saveNotificationSeenState({ ...current, [requestId]: Date.now() }));
  }, [saveNotificationSeenState]);
  const markNotificationsSeen = () => {
    const seenAt = Date.now();
    setNotificationSeenByRequest(current => saveNotificationSeenState(notifications.reduce((next, item) => ({ ...next, [item.requestId]: seenAt }), current)));
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
        <div className="mobile-nav-tools" aria-label="Account and appearance">
          {mobileAction && (
            <div className="mobile-nav-tool-row">
              <span>Appearance</span>
              {mobileAction}
            </div>
          )}
          <a className="mobile-nav-artisan-id" href="/my-artisan-id" onClick={(event) => navigateWithTransition(event, "/my-artisan-id")}>
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <circle cx="16" cy="10.5" r="5.4" />
              <path d="M6.5 27c.8-6 4.3-9.1 9.5-9.1S24.7 21 25.5 27" />
            </svg>
            <span><strong>Artisan ID</strong><small>{accountEmail ? "Open your Hall identity" : "Sign in or create your identity"}</small></span>
            {unreadNotifications.length > 0 && <b>{unreadNotifications.length > 99 ? "99+" : unreadNotifications.length}</b>}
          </a>
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
              {notificationsOpen && <section className="account-notification-panel" aria-label="Messages and project updates"><header><button type="button" className={notificationFilter === "chat" ? "is-active" : ""} onClick={() => setNotificationFilter("chat")}>Chat <b>{unreadChats}</b></button><button type="button" className={notificationFilter === "update" ? "is-active" : ""} onClick={() => setNotificationFilter("update")}>Updates <b>{unreadUpdates}</b></button></header><div>{notifications.filter(item => item.kind === notificationFilter).slice(0, 5).map(item => <button type="button" className={isNotificationUnread(item) ? "is-unread" : ""} onClick={() => openNotification(item.requestId)} key={item.id}><i aria-hidden="true">{item.kind === "chat" ? "✉" : "↻"}</i><span><strong>{item.title}</strong><small>{item.detail}</small></span></button>)}{!notifications.some(item => item.kind === notificationFilter) && <p>No {notificationFilter === "chat" ? "messages" : "project updates"} yet.</p>}</div><footer><button type="button" onClick={markNotificationsSeen}>Mark all as read</button><a href="/my-creations/latest" onClick={(event) => navigateWithTransition(event, "/my-creations/latest")}>View creations</a></footer></section>}
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
  );
}
