import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import GlobalHeader from "../../components/GlobalHeader";
import { WORKFLOW } from "../../domain/workflow";
import type { ReviewRequest } from "../orders/types";
import ContentManager from "./ContentManager";
import { staffService, type ArtisanProposalInput, type StaffAccess, type StaffRequestDetail } from "./staffService";

const queueGroups = [
  { label: "New submissions", statuses: ["SUBMITTED"] },
  { label: "In artisan review", statuses: ["UNDER_REVIEW", "WAITING_FOR_REPLY", "REVISION_REQUESTED"] },
  { label: "Customer decision", statuses: ["READY_FOR_APPROVAL"] },
  { label: "Order operations", statuses: ["READY_FOR_CHECKOUT", "PAYMENT_PENDING", "PAID", "IN_PRODUCTION", "SHIPPED"] },
  { label: "Closed", statuses: ["COMPLETED", "CANCELLED"] }
] as const;

const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
const splitLines = (value: string) => value.split("\n").map(item => item.trim()).filter(Boolean);

function AccessGate({ access }: { access: StaffAccess }) {
  const navigate = useNavigate();
  return <main className="admin-access"><span>Staff Workspace</span><h1>{access.signedIn ? "Staff access is required." : "Sign in to enter the Admin Portal."}</h1><p>{access.signedIn ? `${access.email} is signed in as a customer. A super administrator must assign a reviewer or administrator role before this account can enter.` : "This workspace contains private customer submissions and operational controls."}</p><div><button onClick={() => navigate(access.signedIn ? "/my-artisan-id" : "/artisan-login?returnTo=/admin")}>{access.signedIn ? "Return to Customer Account" : "Staff Sign In"}</button><button className="secondary" onClick={() => navigate("/")}>Return to The Hall</button></div></main>;
}

function Queue({ items, selectedId, onSelect }: { items: ReviewRequest[]; selectedId: string; onSelect: (id: string) => void }) {
  return <aside className="admin-queue"><header><span>Operations</span><h2>Review Queue</h2><p>{items.filter(item => !["COMPLETED", "CANCELLED"].includes(item.status)).length} projects need visibility</p></header>{queueGroups.map(group => { const grouped = items.filter(item => (group.statuses as readonly string[]).includes(item.status)); if (!grouped.length) return null; return <section key={group.label}><h3>{group.label}<span>{grouped.length}</span></h3>{grouped.map(item => <button className={item.id === selectedId ? "active" : ""} onClick={() => onSelect(item.id)} key={item.id}><span><strong>{item.perfumeName}</strong><small>{item.requestNumber}</small></span><em>{WORKFLOW[item.status].label}</em></button>)}</section>;})}</aside>;
}

function ProposalForm({ request, busy, onSubmit }: { request: ReviewRequest; busy: boolean; onSubmit: (input: ArtisanProposalInput) => void }) {
  const [form, setForm] = useState({ summary: request.artisanReview?.summary ?? "", olfactiveDirection: request.artisanReview?.olfactiveDirection ?? "", drydown: request.artisanReview?.drydown ?? "", finalPrice: String(request.finalPrice ?? ""), estimatedProduction: request.estimatedProduction ?? "", revisionsIncluded: String(request.revisionsIncluded ?? 1), adjustments: request.recommendedAdjustments.join("\n"), included: request.includedItems.join("\n") });
  const change = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => { event.preventDefault(); onSubmit({ summary: form.summary.trim(), olfactiveDirection: form.olfactiveDirection.trim(), drydown: form.drydown.trim(), finalPrice: Number(form.finalPrice), estimatedProduction: form.estimatedProduction.trim(), revisionsIncluded: Number(form.revisionsIncluded), recommendedAdjustments: splitLines(form.adjustments), includedItems: splitLines(form.included) }); };
  return <form className="admin-proposal" onSubmit={submit}><header><span>Artisan Proposal</span><h2>Prepare the customer decision</h2><p>Every field is recorded with the project before it moves to customer approval.</p></header><label>Review summary<textarea required value={form.summary} onChange={e => change("summary", e.target.value)} /></label><div><label>Olfactive direction<input required value={form.olfactiveDirection} onChange={e => change("olfactiveDirection", e.target.value)} /></label><label>Drydown<input value={form.drydown} onChange={e => change("drydown", e.target.value)} /></label></div><div><label>Final price (IDR)<input required min="1" type="number" value={form.finalPrice} onChange={e => change("finalPrice", e.target.value)} /></label><label>Production estimate<input required placeholder="6–8 weeks" value={form.estimatedProduction} onChange={e => change("estimatedProduction", e.target.value)} /></label><label>Revisions included<input required min="0" type="number" value={form.revisionsIncluded} onChange={e => change("revisionsIncluded", e.target.value)} /></label></div><label>Recommended adjustments <small>One item per line</small><textarea value={form.adjustments} onChange={e => change("adjustments", e.target.value)} /></label><label>Included items <small>One item per line</small><textarea value={form.included} onChange={e => change("included", e.target.value)} /></label><button disabled={busy}>{busy ? "Saving proposal…" : "Send Proposal for Customer Approval"}</button></form>;
}

function RequestWorkspace({ detail, role, busy, error, onTransition, onProposal, onMessage }: { detail: StaffRequestDetail; role: StaffAccess["role"]; busy: boolean; error: string; onTransition: (status: string, label: string) => void; onProposal: (input: ArtisanProposalInput) => void; onMessage: (message: string) => void }) {
  const { request, messages, activity } = detail;
  const [message, setMessage] = useState("");
  const admin = role === "admin" || role === "super_admin";
  const action = request.status === "SUBMITTED" ? ["UNDER_REVIEW", "Begin Artisan Review"] : request.status === "WAITING_FOR_REPLY" ? ["UNDER_REVIEW", "Resume Review"] : request.status === "REVISION_REQUESTED" ? ["UNDER_REVIEW", "Begin Revision"] : admin && request.status === "PAYMENT_PENDING" ? ["PAID", "Confirm Payment"] : admin && request.status === "PAID" ? ["IN_PRODUCTION", "Begin Production"] : admin && request.status === "IN_PRODUCTION" ? ["SHIPPED", "Mark as Shipped"] : admin && request.status === "SHIPPED" ? ["COMPLETED", "Confirm Delivery"] : null;
  return <main className="admin-workspace"><section className="admin-project-head"><div><span>{request.requestNumber}</span><h1>{request.perfumeName}</h1><p>{request.creationMode === "described" ? "Story-led creation" : "Artisan Bench formula"} · {request.concentration}</p></div><strong>{WORKFLOW[request.status].label}</strong></section>{error && <p className="admin-error" role="alert">{error}</p>}<div className="admin-columns"><div><section className="admin-panel admin-submission"><header><span>Immutable Submission</span><h2>Customer creation brief</h2></header><p>{request.fragranceBrief || "No written brief was supplied."}</p><dl><div><dt>Direction</dt><dd>{request.fragranceDirection.join(" · ") || "Not specified"}</dd></div><div><dt>Top notes</dt><dd>{request.topNotes.join(" · ") || "—"}</dd></div><div><dt>Heart notes</dt><dd>{request.heartNotes.join(" · ") || "—"}</dd></div><div><dt>Base notes</dt><dd>{request.baseNotes.join(" · ") || "—"}</dd></div><div><dt>Customer notes</dt><dd>{request.customerNotes || "None"}</dd></div><div><dt>Submitted</dt><dd>{formatDate(request.submittedAt)}</dd></div></dl></section><section className="admin-panel admin-conversation"><header><span>Conversation</span><h2>Letters with the customer</h2></header><div>{messages.length ? messages.map(item => <article className={item.senderRole} key={item.id}><strong>{item.senderName}</strong><small>{formatDate(item.createdAt)}</small><p>{item.message}</p></article>) : <p>No messages yet.</p>}</div><form onSubmit={event => { event.preventDefault(); if (message.trim()) { onMessage(message); setMessage(""); } }}><textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Write a project message…" /><button disabled={busy || !message.trim()}>Send Message</button></form></section>{request.status === "UNDER_REVIEW" && <ProposalForm request={request} busy={busy} onSubmit={onProposal} />}</div><aside><section className="admin-panel admin-actions"><span>Current Action</span><h2>{WORKFLOW[request.status].description}</h2>{action && <button disabled={busy} onClick={() => onTransition(action[0], action[1])}>{action[1]}<b>→</b></button>}{request.status === "UNDER_REVIEW" && <button className="secondary" disabled={busy} onClick={() => onTransition("WAITING_FOR_REPLY", "Waiting for customer guidance")}>Request Customer Guidance</button>}{!action && request.status !== "UNDER_REVIEW" && <p>No staff transition is required at this stage.</p>}</section><section className="admin-panel admin-activity"><span>Audit Trail</span><h2>Project activity</h2>{activity.slice().reverse().map(item => <article key={item.id}><i>✓</i><div><strong>{item.label}</strong><small>{formatDate(item.createdAt)}</small></div></article>)}</section></aside></div></main>;
}

export default function AdminPortalPage() {
  const [access, setAccess] = useState<StaffAccess | null>(null);
  const [items, setItems] = useState<ReviewRequest[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState<StaffRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [section, setSection] = useState<"operations" | "content">("operations");
  const selected = useMemo(() => selectedId || items[0]?.id || "", [items, selectedId]);
  const refreshQueue = async () => { const queue = await staffService.getQueue(); setItems(queue); if (!selectedId && queue[0]) setSelectedId(queue[0].id); };
  const refreshDetail = async (id: string) => setDetail(await staffService.getDetail(id));

  useEffect(() => { void staffService.getAccess().then(async result => { setAccess(result); if (result.role) await refreshQueue(); }).catch(cause => setError(cause instanceof Error ? cause.message : "Admin Portal could not be loaded.")).finally(() => setLoading(false)); }, []);
  useEffect(() => { if (access?.role && selected) void refreshDetail(selected).catch(cause => setError(cause instanceof Error ? cause.message : "Project could not be opened.")); }, [access?.role, selected]);
  const run = async (operation: () => Promise<unknown>) => { setBusy(true); setError(""); try { await operation(); await refreshQueue(); if (selected) await refreshDetail(selected); } catch (cause) { setError(cause instanceof Error ? cause.message : "The staff action could not be completed."); } finally { setBusy(false); } };

  if (loading) return <div className="admin-loading">Opening the staff workspace…</div>;
  if (!access?.role) return <><GlobalHeader variant="light"/><AccessGate access={access ?? { signedIn: false, role: null, email: "" }}/></>;
  const canManageContent = access.role === "admin" || access.role === "super_admin";
  return <div className="admin-shell"><GlobalHeader variant="light"/><header className="admin-topbar"><div><span>The Hall of Artisans</span><h1>Admin Portal</h1></div><p>{access.role.replaceAll("_", " ")} · {access.email}</p></header>{canManageContent && <nav className="admin-section-tabs" aria-label="Admin workspace"><button className={section === "operations" ? "active" : ""} onClick={() => setSection("operations")}>Order Operations</button><button className={section === "content" ? "active" : ""} onClick={() => setSection("content")}>Content Manager</button></nav>}{section === "content" && canManageContent ? <ContentManager/> : <div className="admin-layout"><Queue items={items} selectedId={selected} onSelect={setSelectedId}/>{detail ? <RequestWorkspace detail={detail} role={access.role} busy={busy} error={error} onTransition={(status, label) => void run(() => staffService.transition(detail.request.id, status, label))} onProposal={proposal => void run(() => staffService.transition(detail.request.id, "READY_FOR_APPROVAL", "Artisan proposal prepared for customer approval", proposal))} onMessage={message => void run(() => staffService.sendMessage(detail.request.id, message))}/> : <main className="admin-empty"><h2>{items.length ? "Select a project" : "The review queue is clear."}</h2><p>{error || "New customer submissions will appear here."}</p></main>}</div>}</div>;
}
