import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { staffService, type StaffAccess } from "../admin/staffService";
import { isRequestLocallyRead, perfumerService, type PerfumerWorkspaceData } from "./perfumerService";
import { subscribeToStaffMessageUpdates } from "../orders/requestLiveUpdates";

export interface PerfumerOutletContext {
  access: StaffAccess;
  data: PerfumerWorkspaceData | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}

export default function PerfumerWorkspaceLayout() {
  const navigate = useNavigate();
  const [access, setAccess] = useState<StaffAccess | null>(null);
  const [data, setData] = useState<PerfumerWorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const unreadChats = new Set((data?.recentMessages ?? []).filter(item => item.senderRole === "customer" && !item.readAt && !isRequestLocallyRead(item.requestId)).map(item => item.requestId)).size;
  const refresh = async (userId = access?.userId) => {
    if (!userId) return;
    setLoading(true);
    try { setData(await perfumerService.getWorkspace(userId)); setError(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Artisan data could not be loaded."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void staffService.getAccess().then(result => { setAccess(result); if (result.role === "reviewer") return refresh(result.userId); setLoading(false); }).catch(cause => { setError(cause instanceof Error ? cause.message : "Access could not be checked."); setLoading(false); }); }, []);
  useEffect(() => access?.role === "reviewer" ? subscribeToStaffMessageUpdates(() => void refresh(access.userId)) : undefined, [access?.role, access?.userId]);
  useEffect(() => {
    const markRead = (event: Event) => {
      const { requestId, seenAt } = (event as CustomEvent<{ requestId: string; seenAt: number }>).detail;
      setData(current => current ? { ...current, recentMessages: current.recentMessages.map(message => message.requestId === requestId && message.senderRole === "customer" ? { ...message, readAt: new Date(seenAt).toISOString() } : message) } : current);
    };
    window.addEventListener("hoa:perfumer-chat-read", markRead);
    return () => window.removeEventListener("hoa:perfumer-chat-read", markRead);
  }, []);
  if (!access || loading && !data) return <div className="perfumer-loading">Opening your Artisan Workspace…</div>;
  if (access.role !== "reviewer") return <main className="perfumer-gate"><span>Artisan Workspace</span><h1>Perfumer access is required.</h1><p>{access.signedIn ? `${access.email} is not registered as a reviewer.` : "Sign in with the account assigned by The Hall."}</p><button onClick={() => navigate("/perfumer/login?returnTo=/perfumer")}>Perfumer Sign In</button></main>;
  return <div className="perfumer-shell">
    <aside className="perfumer-sidebar">
      <a className="perfumer-brand" href="/perfumer"><img src="/assets/images/hall-artisans-header-logo.webp" alt=""/><span><strong>The Hall of Artisans</strong><small>Artisan Workspace</small></span></a>
      <nav><NavLink end to="/perfumer"><i>⌂</i>Overview</NavLink><NavLink to="/perfumer/creations"><i>✦</i>Customer Projects{unreadChats > 0 && <b className="perfumer-nav-badge" aria-label={`${unreadChats} chats with unread messages`}>{unreadChats}</b>}</NavLink><NavLink to="/perfumer/completed"><i>✓</i>Completed Works</NavLink><NavLink to="/perfumer/profile"><i>♙</i>My Profile</NavLink></nav>
      <div className="perfumer-identity"><b>{access.email.slice(0, 1).toUpperCase()}</b><span><strong>{access.email}</strong><small>Perfumer · Reviewer</small></span></div>
    </aside>
    <main className="perfumer-main"><Outlet context={{ access, data, loading, error, refresh } satisfies PerfumerOutletContext}/></main>
  </div>;
}
