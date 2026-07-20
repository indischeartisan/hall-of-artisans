import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import GlobalHeader from "../components/GlobalHeader";
import { useLegacyStylesheets } from "../hooks/useLegacyStylesheets";
import { prototypePersonalRecords } from "../dev/fixtures/profileFixtures";

const artisanProfileStyles = [
  "/assets/css/styles.css?v=18",
  "/assets/css/header-consistency.css?v=1",
  "/assets/css/global-header-light.css?v=3",
  "/assets/css/ornate-panel-bright.css?v=1"
] as const;

type Profile = { fullName: string; artisanId: string; specialty?: string; status?: string; registeredAt?: string };
const records = import.meta.env.DEV ? prototypePersonalRecords : { drafts: [], archive: [], orders: [] };

export default function MyArtisanIdPage() {
  useLegacyStylesheets("artisan-profile", artisanProfileStyles);
  const [modal, setModal] = useState<keyof typeof records | null>(null);
  const [actionMessage, setActionMessage] = useState("");
  let profile: Profile | null = null;
  try { profile = JSON.parse(localStorage.getItem("hallArtisanProfile") || "null"); } catch { profile = null; }
  useEffect(() => { document.title = "My Artisan ID | The Hall of Artisans"; document.body.className = "artisan-dashboard-body"; return () => { document.body.className = ""; }; }, []);
  if (!profile?.fullName || !profile.artisanId) return <Navigate to="/artisan-register" replace />;
  const date = profile.registeredAt ? new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(new Date(profile.registeredAt)) : "Not recorded";
  const specialty = profile.specialty || "Artisan Perfumer", status = profile.status || "Registered Artisan";
  const exportCard = async (share = false) => {
    try { const image = new Image(); image.src = "/assets/images/artisan-id-card-botanical-v2.webp"; await image.decode(); const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1920; const context = canvas.getContext("2d")!; context.drawImage(image, 0, 0, 1080, 1920); context.fillStyle = "#183020"; context.textAlign = "center"; context.font = "34px Georgia"; [[profile.fullName, 948], [profile.artisanId, 1073], [specialty, 1198], [status, 1329], ["Indische World", 1400], [date, 1510]].forEach(([text, y]) => context.fillText(String(text), 540, Number(y), 620)); const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(), "image/png")); const file = new File([blob], `artisan-id-${profile.artisanId}.png`, { type: "image/png" }); if (share && navigator.canShare?.({ files: [file] })) { await navigator.share({ title: "Artisan ID Card", files: [file] }); setActionMessage("Your Artisan ID Card is ready to share."); return; } const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = file.name; link.click(); URL.revokeObjectURL(url); setActionMessage(share ? "Your card has been downloaded. You may upload it manually to Instagram Story." : "Your Artisan ID Card has been downloaded."); } catch { setActionMessage("Export failed. Please try again."); }
  };
  return <><GlobalHeader activeLabel="Artisan ID" variant="light" /><main className="artisan-dashboard-shell">
    <section className="artisan-dashboard-intro dashboard-intro"><p className="section-kicker">Personal Hall Ledger</p><h1>My Artisan ID</h1><p className="dashboard-subtitle">Your identity, creations, and commissions are recorded here.</p><p className="dashboard-welcome">Welcome to The Hall, <strong>{profile.fullName}</strong>.</p></section>
    <section className="profile-summary dashboard-profile ornate-panel"><div className="profile-watermark" aria-hidden="true">HA</div><p className="section-kicker">Registered Artisan</p><h2>Official Record</h2><dl>{[["Name", profile.fullName], ["Artisan ID", profile.artisanId], ["Specialty", specialty], ["Status", status], ["Registered Since", date]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
    <section className="personal-actions dashboard-actions" aria-label="Personal records and actions">{(["drafts", "archive", "orders"] as const).map((type, index) => <button className="personal-action inner-panel" type="button" onClick={() => setModal(type)} key={type}><span className="action-monogram">{["D", "A", "O"][index]}</span><span><strong>My {type[0].toUpperCase() + type.slice(1)}</strong><small>{["Continue your unfinished fragrance creations.", "Explore your completed and archived creations.", "Track your bespoke commissions and orders."][index]}</small></span><span className="action-arrow">→</span></button>)}<a className="personal-action personal-action--primary inner-panel" href="/chamber-of-creation"><span className="action-monogram">+</span><span><strong>Start New Creation</strong><small>Begin a new journey of scent and story.</small></span><span className="action-arrow">→</span></a></section>
    <aside className="id-preview-wrap dashboard-card ornate-panel"><header className="card-panel-heading"><p className="section-kicker">Personal Hall Credential</p><h2>Your Official Artisan ID Card</h2><p>Instagram Story Size · 1080 × 1920</p></header><div className="artisan-card artisan-card-template"><img className="artisan-card-template-image" src="/assets/images/artisan-id-card-botanical-v2.webp" alt="Ornate botanical Artisan ID card" /><span className="id-card-text id-card-name">{profile.fullName}</span><span className="id-card-text id-card-artisan-id">{profile.artisanId}</span><span className="id-card-text id-card-specialty">{specialty}</span><span className="id-card-text id-card-status">{status}</span><span className="id-card-text id-card-registered-within">Indische World</span><span className="id-card-text id-card-registered-since">{date}</span></div><div className="card-actions inner-panel dashboard-card-actions"><button className="register-action" onClick={() => exportCard()}>Download ID Card</button><button className="register-action" onClick={() => exportCard(true)}>Share Card</button><a className="register-action register-action--primary" href="/hall">Enter The Hall</a></div><p className="action-message" role="status">{actionMessage}</p></aside>
  </main>{modal && <div className="artisan-modal"><div className="artisan-modal__backdrop" onClick={() => setModal(null)} /><section className="artisan-modal__dialog" role="dialog" aria-modal="true" tabIndex={-1}><button className="artisan-modal__close" onClick={() => setModal(null)}>×</button><header className="artisan-modal__header"><p className="section-kicker">Personal Record Chamber</p><h2>My {modal[0].toUpperCase() + modal.slice(1)}</h2><p>Your personal records within The Hall.</p></header><div className="record-list">{records[modal].map(item => <article className="record-item" key={item.title}><div className="record-item__heading"><h3>{item.title}</h3><span className="status-badge">{item.status}</span></div><p>{item.meta}</p></article>)}</div></section></div>}</>;
}
