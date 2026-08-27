import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { adminDashboardService, type AdminDashboardSnapshot } from "./adminDashboardService";
import { staffService, type StaffAccess } from "./staffService";
import { subscribeToStaffMessageUpdates, type StaffRealtimeEvent } from "../orders/requestLiveUpdates";

export interface AdminOutletContext { access: StaffAccess; snapshot: AdminDashboardSnapshot | null; loading: boolean; error: string; refresh: () => Promise<void> }

function AccessGate({ access }: { access: StaffAccess }) {
  const navigate = useNavigate();
  return <main className="hoa-admin-gate"><span>Admin Workspace</span><h1>{access.signedIn ? "Administrator access is required." : "Sign in to enter the Admin Workspace."}</h1><p>{access.signedIn ? `${access.email} does not have an administrator or reviewer role.` : "This workspace contains private submissions and order controls."}</p><button onClick={() => navigate("/admin/login?returnTo=/admin")}>Admin Sign In</button></main>;
}

const LinkIcon = ({ children }: { children: string }) => <i aria-hidden="true">{children}</i>;

export default function AdminDashboardLayout() {
  const [access, setAccess] = useState<StaffAccess | null>(null);
  const [snapshot, setSnapshot] = useState<AdminDashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const lastSuccessfulFetch = useRef(0);
  const refresh = async () => { setLoading(true); try { setSnapshot(await adminDashboardService.getSnapshot()); lastSuccessfulFetch.current = Date.now(); setError(""); } catch (cause) { setError(cause instanceof Error ? cause.message : "Admin data could not be loaded."); } finally { setLoading(false); } };
  useEffect(() => { void staffService.getAccess().then(result => { setAccess(result); if (result.role) return refresh(); setLoading(false); }).catch(cause => { setError(cause instanceof Error ? cause.message : "Admin access could not be checked."); setLoading(false); }); }, []);
  const requestIds = (snapshot?.creations ?? []).map(item => item.request.id);
  useEffect(() => {
    if (access?.role !== "admin" && access?.role !== "super_admin") return;
    const patch = (event: StaffRealtimeEvent) => setSnapshot(current => {
      if (!current) return current;
      const row = event.eventType === "DELETE" ? event.old : event.new;
      const requestId = String(row.request_id ?? row.id ?? "");
      const creation = current.creations.find(item => item.request.id === requestId);
      if (event.table === "request_messages" && event.eventType !== "DELETE" && row.sender_role === "customer" && creation) {
        const message = { id: String(row.id), requestId, creationName: creation.request.perfumeName, message: String(row.message ?? ""), senderName: String(row.sender_name ?? "Customer"), createdAt: String(row.created_at ?? new Date().toISOString()) };
        return { ...current, customerMessages: [message, ...current.customerMessages.filter(item => item.id !== message.id)].slice(0, 20) };
      }
      if (event.table === "request_activity" && event.eventType === "INSERT" && creation) {
        const activity = { id: String(row.id), requestId, creationName: creation.request.perfumeName, label: String(row.label ?? "Project updated"), createdAt: String(row.created_at ?? new Date().toISOString()) };
        return { ...current, activity: [activity, ...current.activity.filter(item => item.id !== activity.id)].slice(0, 20) };
      }
      return current;
    });
    const handle = (event: StaffRealtimeEvent) => {
      patch(event);
      if (event.table === "request_activity" && event.eventType === "INSERT") {
        const requestId = String(event.new.request_id ?? "");
        void staffService.getQueueItem(requestId).then(project => {
          if (!project) return;
          setSnapshot(current => current ? { ...current, creations: current.creations.map(item => item.request.id === requestId ? { ...item, request: project } : item) } : current);
        });
      }
    };
    return subscribeToStaffMessageUpdates(requestIds, handle, { onRecovery: () => void refresh(), getLastSuccessfulFetch: () => lastSuccessfulFetch.current });
  }, [access?.role, requestIds.join(",")]);
  if (error && !access) return <main className="hoa-admin-gate"><h1>Admin Workspace unavailable</h1><p>{error}</p><button onClick={() => window.location.reload()}>Try Again</button></main>;
  if (!access) return <div className="hoa-admin-loading">Opening the Admin Workspace…</div>;
  if (access.role !== "admin" && access.role !== "super_admin") return <AccessGate access={access}/>;
  return <div className="hoa-admin-shell">
    <aside className="hoa-admin-sidebar">
      <a className="hoa-admin-brand" href="/admin"><img src="/assets/images/hall-artisans-header-logo.webp" alt=""/><span><strong>The Hall of Artisans</strong><small>Admin Workspace</small></span></a>
      <nav aria-label="Admin workspace">
        <NavLink end to="/admin"><LinkIcon>⌂</LinkIcon>Overview</NavLink>
        <NavLink to="/admin/creations"><LinkIcon>✦</LinkIcon>Creations</NavLink>
        <NavLink to="/admin/orders"><LinkIcon>▣</LinkIcon>Orders</NavLink>
        <NavLink to="/admin/customers"><LinkIcon>♙</LinkIcon>Customers</NavLink>
        <span className="hoa-admin-nav-label">Content</span>
        <NavLink to="/admin/library"><LinkIcon>◈</LinkIcon>Library</NavLink>
        <NavLink to="/admin/hall-archive"><LinkIcon>▤</LinkIcon>Hall Archive</NavLink>
        <span className="disabled"><LinkIcon>⚙</LinkIcon>Settings<small>Later</small></span>
      </nav>
      <div className="hoa-admin-user"><b>{access.email.slice(0, 1).toUpperCase()}</b><span><strong>{access.email}</strong><small>{access.role.replaceAll("_", " ")}</small></span></div>
    </aside>
    <main className="hoa-admin-main">{error && snapshot && <div className="hoa-workspace-warning" role="alert"><span><strong>Live data could not be refreshed.</strong> The last successfully loaded data remains available.</span><button type="button" disabled={loading} onClick={() => void refresh()}>{loading ? "Retrying…" : "Try Again"}</button></div>}<Outlet context={{ access, snapshot, loading, error, refresh } satisfies AdminOutletContext}/></main>
  </div>;
}
