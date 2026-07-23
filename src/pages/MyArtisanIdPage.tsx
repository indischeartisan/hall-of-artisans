import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router";
import GlobalHeader from "../components/GlobalHeader";
import { authService } from "../features/auth/authService";
import { orderService } from "../features/orders/orderService";
import { useDrafts } from "../contexts/DraftContext";
import { useLegacyStylesheets } from "../hooks/useLegacyStylesheets";
import { artisanSpecialtyGroups, defaultArtisanSpecialty, formatArtisanSpecialty, parseArtisanSpecialty, type ArtisanSpecialty } from "../data/artisanSpecialty";

const artisanProfileStyles = [
  "/assets/css/styles.css?v=18",
  "/assets/css/header-consistency.css?v=1",
  "/assets/css/global-header-light.css?v=3",
  "/assets/css/ornate-panel-bright.css?v=1"
] as const;

type Profile = { fullName: string; artisanId: string; specialty?: string; status?: string; registeredAt?: string };
type RecordType = "drafts" | "archive" | "orders";
type PersonalRecord = { id: string; title: string; meta: string; status: string };

export default function MyArtisanIdPage() {
  useLegacyStylesheets("artisan-profile", artisanProfileStyles);
  const navigate = useNavigate();
  const { drafts } = useDrafts();
  const [modal, setModal] = useState<RecordType | null>(null);
  const [requests, setRequests] = useState(() => orderService.getRequests(false));
  const [actionMessage, setActionMessage] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authFailed, setAuthFailed] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSpecialty, setEditSpecialty] = useState<ArtisanSpecialty>({ ...defaultArtisanSpecialty });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  useEffect(() => { document.title = "My Artisan ID | The Hall of Artisans"; document.body.className = "artisan-dashboard-body"; return () => { document.body.className = ""; }; }, []);
  useEffect(() => { void authService.getArtisanIdentity().then(result => { if (!result.ok) { setAuthFailed(true); setLoading(false); return; } setProfile({ fullName: result.data.displayName, artisanId: result.data.publicId, specialty: result.data.specialty, status: result.data.status === "active" ? "Registered Artisan" : result.data.status, registeredAt: result.data.issuedAt }); setLoading(false); }); }, []);
  useEffect(() => { const refresh = () => setRequests(orderService.getRequests(false)); window.addEventListener("hoa:orders-change", refresh); return () => window.removeEventListener("hoa:orders-change", refresh); }, []);
  useEffect(() => { if (!modal) return; document.body.classList.add("modal-open"); const close = (event: KeyboardEvent) => { if (event.key === "Escape") setModal(null); }; window.addEventListener("keydown", close); return () => { document.body.classList.remove("modal-open"); window.removeEventListener("keydown", close); }; }, [modal]);
  const records = useMemo<Record<RecordType, PersonalRecord[]>>(() => ({
    drafts: drafts.map(draft => ({ id: draft.id, title: draft.draftName, meta: `${draft.perfumeName || "Untitled creation"} · Updated ${new Date(draft.updatedAt).toLocaleString()}`, status: draft.status === "ready" ? "Ready" : "Draft" })),
    orders: requests.filter(request => request.status !== "DRAFT_PREVIEW").map(request => ({ id: request.id, title: request.perfumeName, meta: `${request.requestNumber} · Updated ${new Date(request.lastUpdatedAt).toLocaleString()}`, status: request.status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase()) })),
    archive: requests.filter(request => request.status === "COMPLETED").map(request => ({ id: request.id, title: request.perfumeName, meta: `${request.requestNumber} · Completed ${request.completedAt ? new Date(request.completedAt).toLocaleDateString() : "date unavailable"}`, status: "Archived" }))
  }), [drafts, requests]);
  if (loading) return <><GlobalHeader activeLabel="Artisan ID" variant="light" /><main className="artisan-dashboard-shell"><p className="form-message" role="status">Opening your secure Hall ledger...</p></main></>;
  if (authFailed || !profile?.fullName || !profile.artisanId) return <Navigate to="/artisan-login" replace />;
  const date = profile.registeredAt ? new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(new Date(profile.registeredAt)) : "Not recorded";
  const specialty = profile.specialty || "Artisan Perfumer", status = profile.status || "Registered Artisan";
  const beginProfileEdit = () => { setEditName(profile.fullName); setEditSpecialty(parseArtisanSpecialty(specialty)); setProfileMessage(""); setEditingProfile(true); };
  const cancelProfileEdit = () => { setEditingProfile(false); setProfileMessage(""); };
  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileMessage("");
    const result = await authService.updateArtisanProfile(editName, editSpecialty);
    setProfileSaving(false);
    if (!result.ok) { setProfileMessage(result.error.message); return; }
    setProfile(current => current ? { ...current, fullName: result.data.displayName, specialty: result.data.specialty } : current);
    setEditingProfile(false);
    setProfileMessage("Your official profile has been updated.");
  };
  const exportCard = async (share = false) => {
    try { const image = new Image(); image.src = "/assets/images/artisan-id-card-botanical-v2.webp"; await image.decode(); const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1920; const context = canvas.getContext("2d")!; context.drawImage(image, 0, 0, 1080, 1920); context.fillStyle = "#183020"; context.textAlign = "center"; context.font = "34px Georgia"; [[profile.fullName, 948], [profile.artisanId, 1073], [specialty, 1198], [status, 1329], ["Indische World", 1400], [date, 1510]].forEach(([text, y]) => context.fillText(String(text), 540, Number(y), 620)); const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(), "image/png")); const file = new File([blob], `artisan-id-${profile.artisanId}.png`, { type: "image/png" }); if (share && navigator.canShare?.({ files: [file] })) { await navigator.share({ title: "Artisan ID Card", files: [file] }); setActionMessage("Your Artisan ID Card is ready to share."); return; } const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = file.name; link.click(); URL.revokeObjectURL(url); setActionMessage(share ? "Your card has been downloaded. You may upload it manually to Instagram Story." : "Your Artisan ID Card has been downloaded."); } catch { setActionMessage("Export failed. Please try again."); }
  };
  const openOrderRecord = (id: string) => {
    setModal(null);
    navigate(`/my-orders/${encodeURIComponent(id)}`);
  };
  return <><GlobalHeader activeLabel="Artisan ID" variant="light" /><main className="artisan-dashboard-shell">
    <section className="artisan-dashboard-intro dashboard-intro"><p className="section-kicker">Personal Hall Ledger</p><h1>My Artisan ID</h1><p className="dashboard-subtitle">Your identity, creations, and commissions are recorded here.</p><p className="dashboard-welcome">Welcome to The Hall, <strong>{profile.fullName}</strong>.</p></section>
    <section className="profile-summary dashboard-profile ornate-panel"><div className="profile-watermark" aria-hidden="true">HA</div><p className="section-kicker">Registered Artisan</p><div className="profile-title-row"><h2>Official Record</h2>{!editingProfile && <button className="profile-edit-button" type="button" onClick={beginProfileEdit}>Edit Profile</button>}</div>{editingProfile ? <form className="profile-edit-form" onSubmit={saveProfile}><dl><div><dt><label htmlFor="artisan-profile-name">Name</label></dt><dd><input id="artisan-profile-name" value={editName} onChange={event => setEditName(event.target.value)} minLength={2} maxLength={80} autoComplete="name" required /></dd></div><div><dt>Artisan ID</dt><dd>{profile.artisanId}</dd></div><div className="profile-specialty-row"><dt>Specialty</dt><dd><div className="profile-specialty-selects">{artisanSpecialtyGroups.map(group => <label key={group.id}><span>{group.label}</span><select aria-label={group.label} value={editSpecialty[group.id]} onChange={event => setEditSpecialty(current => ({ ...current, [group.id]: event.target.value }))}>{group.options.map(option => <option key={option} value={option}>{option}</option>)}</select></label>)}</div><small className="profile-specialty-preview">{formatArtisanSpecialty(editSpecialty)}</small></dd></div><div><dt>Status</dt><dd>{status}</dd></div><div><dt>Registered Since</dt><dd>{date}</dd></div></dl><div className="profile-edit-actions"><button type="button" onClick={cancelProfileEdit} disabled={profileSaving}>Cancel</button><button className="profile-save-button" type="submit" disabled={profileSaving}>{profileSaving ? "Saving..." : "Save Changes"}</button></div></form> : <dl>{[["Name", profile.fullName], ["Artisan ID", profile.artisanId], ["Specialty", specialty], ["Status", status], ["Registered Since", date]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}<p className={`profile-edit-message${profileMessage ? " is-visible" : ""}`} role="status">{profileMessage}</p></section>
    <section className="personal-actions dashboard-actions" aria-label="Personal records and actions">{(["drafts", "archive", "orders"] as const).map((type, index) => <button className="personal-action inner-panel" type="button" onClick={() => setModal(type)} key={type}><span className="action-monogram">{["D", "A", "O"][index]}</span><span><strong>My {type[0].toUpperCase() + type.slice(1)}</strong><small>{["Continue your unfinished fragrance creations.", "Explore your completed and archived creations.", "Track your bespoke commissions and orders."][index]}</small></span><span className="action-arrow">→</span></button>)}<a className="personal-action personal-action--primary inner-panel" href="/chamber-of-creation"><span className="action-monogram">+</span><span><strong>Start New Creation</strong><small>Begin a new journey of scent and story.</small></span><span className="action-arrow">→</span></a></section>
    <aside className="id-preview-wrap dashboard-card ornate-panel"><header className="card-panel-heading"><p className="section-kicker">Personal Hall Credential</p><h2>Your Official Artisan ID Card</h2><p>Instagram Story Size · 1080 × 1920</p></header><div className="artisan-card artisan-card-template"><img className="artisan-card-template-image" src="/assets/images/artisan-id-card-botanical-v2.webp" alt="Ornate botanical Artisan ID card" /><span className="id-card-text id-card-name">{profile.fullName}</span><span className="id-card-text id-card-artisan-id">{profile.artisanId}</span><span className="id-card-text id-card-specialty">{specialty}</span><span className="id-card-text id-card-status">{status}</span><span className="id-card-text id-card-registered-within">Indische World</span><span className="id-card-text id-card-registered-since">{date}</span></div><div className="card-actions inner-panel dashboard-card-actions"><button className="register-action" onClick={() => exportCard()}>Download ID Card</button><button className="register-action" onClick={() => exportCard(true)}>Share Card</button><a className="register-action register-action--primary" href="/hall">Enter The Hall</a></div><p className="action-message" role="status">{actionMessage}</p></aside>
  </main>{modal && <div className="artisan-modal"><div className="artisan-modal__backdrop" onClick={() => setModal(null)} /><section className="artisan-modal__dialog inner-panel" role="dialog" aria-modal="true" aria-labelledby="personal-record-title" tabIndex={-1}><button className="artisan-modal__close" type="button" aria-label="Close personal records" onClick={() => setModal(null)}>×</button><header className="artisan-modal__header"><p className="section-kicker">Personal Record Chamber</p><h2 id="personal-record-title">My {modal[0].toUpperCase() + modal.slice(1)}</h2><p>Your personal records within The Hall.</p></header><div className="record-list">{records[modal].length ? records[modal].map(item => {
    const content = <><div className="record-item__heading"><h3>{item.title}</h3><span className="status-badge">{item.status}</span></div><p>{item.meta}</p></>;
    return modal === "orders" ? <button className="record-item record-item--link inner-panel" type="button" key={item.id} onClick={() => openOrderRecord(item.id)} aria-label={`Open order ${item.title}`}>{content}</button> : <article className="record-item inner-panel" key={item.id}>{content}</article>;
  }) : <p className="modal-empty inner-panel">No {modal} have been recorded yet.</p>}</div></section></div>}</>;
}
