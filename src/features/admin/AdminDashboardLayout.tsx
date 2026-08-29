import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { adminDashboardService, type AdminAftercareCase, type AdminDashboardSnapshot } from "./adminDashboardService";
import { staffService, type StaffAccess, type StaffReviewer } from "./staffService";

export interface AdminOutletContext { access: StaffAccess; snapshot: AdminDashboardSnapshot | null; reviewers: StaffReviewer[] | null; aftercare: AdminAftercareCase[] | null; orderItemsLoaded: boolean; loading: boolean; error: string; refresh: () => Promise<void>; loadReviewers: () => Promise<void>; loadAftercare: () => Promise<void>; loadOrderItems: () => Promise<void> }

function AccessGate({ access }: { access: StaffAccess }) {
  const navigate = useNavigate();
  return <main className="hoa-admin-gate"><span>Admin Workspace</span><h1>{access.signedIn ? "Administrator access is required." : "Sign in to enter the Admin Workspace."}</h1><p>{access.signedIn ? `${access.email} does not have an administrator or reviewer role.` : "This workspace contains private submissions and order controls."}</p><button onClick={() => navigate("/admin/login?returnTo=/admin")}>Admin Sign In</button></main>;
}

const LinkIcon = ({ children }: { children: string }) => <i aria-hidden="true">{children}</i>;

export default function AdminDashboardLayout() {
  const [access, setAccess] = useState<StaffAccess | null>(null);
  const [snapshot, setSnapshot] = useState<AdminDashboardSnapshot | null>(null);
  const [reviewers, setReviewers] = useState<StaffReviewer[] | null>(null);
  const [aftercare, setAftercare] = useState<AdminAftercareCase[] | null>(null);
  const [orderItemsLoaded, setOrderItemsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = async () => { setLoading(true); try { setSnapshot(await adminDashboardService.getSnapshot()); setReviewers(null); setAftercare(null); setOrderItemsLoaded(false); setError(""); } catch (cause) { setError(cause instanceof Error ? cause.message : "Admin data could not be loaded."); } finally { setLoading(false); } };
  const loadReviewers = async () => { if (reviewers) return; try { setReviewers(await staffService.getReviewers()); } catch (cause) { setReviewers([]); setError(cause instanceof Error ? cause.message : "Perfumer data could not be loaded."); } };
  const loadAftercare = async () => { if (aftercare || !snapshot) return; try { setAftercare(await adminDashboardService.getAftercare(snapshot)); } catch (cause) { setAftercare([]); setError(cause instanceof Error ? cause.message : "Aftercare data could not be loaded."); } };
  const loadOrderItems = async () => { if (orderItemsLoaded || !snapshot) return; try { const orders = await adminDashboardService.getOrderItems(snapshot.orders); setSnapshot(current => current ? { ...current, orders } : current); setOrderItemsLoaded(true); } catch (cause) { setOrderItemsLoaded(true); setError(cause instanceof Error ? cause.message : "Order items could not be loaded."); } };
  useEffect(() => { void staffService.getAccess().then(result => { setAccess(result); if (result.role) return refresh(); setLoading(false); }).catch(cause => { setError(cause instanceof Error ? cause.message : "Admin access could not be checked."); setLoading(false); }); }, []);
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
      <button className="hoa-admin-manual-refresh" type="button" disabled={loading} onClick={() => void refresh()}>{loading ? "Refreshing…" : "Refresh Data"}</button>
    </aside>
    <main className="hoa-admin-main">{error && snapshot && <div className="hoa-workspace-warning" role="alert"><span><strong>Live data could not be refreshed.</strong> The last successfully loaded data remains available.</span><button type="button" disabled={loading} onClick={() => void refresh()}>{loading ? "Retrying…" : "Try Again"}</button></div>}<Outlet context={{ access, snapshot, reviewers, aftercare, orderItemsLoaded, loading, error, refresh, loadReviewers, loadAftercare, loadOrderItems } satisfies AdminOutletContext}/></main>
  </div>;
}
