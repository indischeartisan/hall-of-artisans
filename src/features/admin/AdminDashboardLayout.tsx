import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { adminDashboardService, type AdminDashboardSnapshot } from "./adminDashboardService";
import { staffService, type StaffAccess } from "./staffService";

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
  const refresh = async () => { setLoading(true); try { setSnapshot(await adminDashboardService.getSnapshot()); setError(""); } catch (cause) { setError(cause instanceof Error ? cause.message : "Admin data could not be loaded."); } finally { setLoading(false); } };
  useEffect(() => { void staffService.getAccess().then(result => { setAccess(result); if (result.role) return refresh(); setLoading(false); }).catch(cause => { setError(cause instanceof Error ? cause.message : "Admin access could not be checked."); setLoading(false); }); }, []);
  if (error) return <main className="hoa-admin-gate"><h1>Admin Workspace unavailable</h1><p>{error}</p></main>;
  if (!access) return <div className="hoa-admin-loading">Opening the Admin Workspace…</div>;
  if (access.role !== "admin" && access.role !== "super_admin") return <AccessGate access={access}/>;
  return <div className="hoa-admin-shell">
    <aside className="hoa-admin-sidebar">
      <a className="hoa-admin-brand" href="/admin"><img src="/assets/images/hall-artisans-header-logo.webp" alt=""/><span><strong>The Hall of Artisans</strong><small>Admin Workspace</small></span></a>
      <nav aria-label="Admin workspace">
        <NavLink end to="/admin"><LinkIcon>⌂</LinkIcon>Overview</NavLink>
        <NavLink to="/admin/creations"><LinkIcon>✦</LinkIcon>Creations</NavLink>
        <NavLink to="/admin/orders"><LinkIcon>▣</LinkIcon>Orders</NavLink>
        <NavLink to="/admin/revision-requests"><LinkIcon>↺</LinkIcon>Revisions</NavLink>
        <NavLink to="/admin/repeat-orders"><LinkIcon>∞</LinkIcon>Repeat Orders</NavLink>
        <NavLink to="/admin/completed-orders"><LinkIcon>✓</LinkIcon>Completed</NavLink>
        <span className="disabled"><LinkIcon>♙</LinkIcon>Artisans<small>Later</small></span>
        <NavLink to="/admin/library"><LinkIcon>◈</LinkIcon>Library</NavLink>
        <NavLink to="/admin/hall-archive"><LinkIcon>▤</LinkIcon>Hall Archive</NavLink>
        <span className="disabled"><LinkIcon>⚙</LinkIcon>Settings<small>Later</small></span>
      </nav>
      <div className="hoa-admin-user"><b>{access.email.slice(0, 1).toUpperCase()}</b><span><strong>{access.email}</strong><small>{access.role.replaceAll("_", " ")}</small></span></div>
    </aside>
    <div className="hoa-admin-main"><Outlet context={{ access, snapshot, loading, error, refresh } satisfies AdminOutletContext}/></div>
  </div>;
}
