import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import type { StaffAccess } from "./staffService";
import { staffService } from "./staffService";

type PortalSection = "operations" | "content";

export default function AdminHeader({ access, portalSection, onPortalSectionChange }: { access?: StaffAccess; portalSection?: PortalSection; onPortalSectionChange?: (section: PortalSection) => void; activeLabel?: string; variant?: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [resolvedAccess, setResolvedAccess] = useState<StaffAccess | null>(access ?? null);
  useEffect(() => { if (access) setResolvedAccess(access); else void staffService.getAccess().then(setResolvedAccess); }, [access]);
  const canManageContent = resolvedAccess?.role === "admin" || resolvedAccess?.role === "super_admin";
  const querySection = new URLSearchParams(location.search).get("section");
  const activeSection = portalSection ?? (querySection === "content" ? "content" : "operations");
  const goPortal = (section: PortalSection) => {
    setOpen(false);
    if (location.pathname === "/admin" && onPortalSectionChange) onPortalSectionChange(section);
    navigate(section === "content" ? "/admin?section=content" : "/admin");
  };

  return <header className="admin-header">
    <a className="admin-header-brand" href="/admin" onClick={event => { event.preventDefault(); goPortal("operations"); }}>
      <img src="/assets/images/hall-artisans-header-logo.webp" alt=""/>
      <span><strong>The Hall of Artisans</strong><small>Administration</small></span>
    </a>
    <button className="admin-header-toggle" type="button" aria-label={open ? "Close admin navigation" : "Open admin navigation"} aria-expanded={open} onClick={() => setOpen(value => !value)}><span/><span/><span/></button>
    <nav className={open ? "open" : ""} aria-label="Admin navigation">
      <button className={location.pathname === "/admin" && activeSection === "operations" ? "active" : ""} onClick={() => goPortal("operations")}>Order Operations</button>
      {canManageContent && <button className={location.pathname === "/admin" && activeSection === "content" ? "active" : ""} onClick={() => goPortal("content")}>Content Manager</button>}
      {canManageContent && <a className={location.pathname === "/admin/library" ? "active" : ""} href="/admin/library" onClick={() => setOpen(false)}>Library Catalog</a>}
      {canManageContent && <a className={location.pathname === "/admin/hall-archive" ? "active" : ""} href="/admin/hall-archive" onClick={() => setOpen(false)}>Hall Archive</a>}
      <a href="/" onClick={() => setOpen(false)}>View Website</a>
    </nav>
    <div className="admin-header-identity"><span>{resolvedAccess?.role?.replaceAll("_", " ") ?? "Staff Portal"}</span><strong>{resolvedAccess?.email ?? "The Hall of Artisans"}</strong></div>
  </header>;
}
