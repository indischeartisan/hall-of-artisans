import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import GlobalHeader from "../../components/GlobalHeader";
import { WORKFLOW } from "../../domain/workflow";
import type { ReviewRequest } from "../orders/types";
import ContentManager from "./ContentManager";
import AdminHeader from "./AdminHeader";
import StaffProposalForm from "./StaffProposalForm";
import { staffService, type ArtisanProposalInput, type StaffAccess, type StaffRequestDetail, type StaffReviewer } from "./staffService";

const queueGroups = [
  { label: "New submissions", statuses: ["SUBMITTED"] },
  { label: "In artisan review", statuses: ["UNDER_REVIEW"] },
  { label: "Consultation & proposal", statuses: ["CONSULTATION", "READY_FOR_APPROVAL", "REVISION_REQUESTED"] },
  { label: "Order operations", statuses: ["READY_FOR_PAYMENT", "PAYMENT_PENDING", "PAID", "IN_PRODUCTION", "SHIPPED"] },
  { label: "Closed", statuses: ["COMPLETED", "CANCELLED"] }
] as const;

const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";

function AccessGate({ access }: { access: StaffAccess }) {
  const navigate = useNavigate();
  return <main className="admin-access"><span>Staff Workspace</span><h1>{access.signedIn ? "Staff access is required." : "Sign in to enter the Admin Portal."}</h1><p>{access.signedIn ? `${access.email} is signed in without a staff role. An administrator must assign a reviewer or administrator role before this account can enter.` : "This workspace contains private customer submissions and operational controls."}</p><div><button onClick={() => navigate("/admin/login?returnTo=/admin")}>Admin Sign In</button><button className="secondary" onClick={() => navigate("/perfumer/login?returnTo=/admin")}>Perfumer Sign In</button></div></main>;
}

function Queue({ items, reviewers, selectedId, onSelect }: { items: ReviewRequest[]; reviewers: StaffReviewer[]; selectedId: string; onSelect: (id: string) => void }) {
  const reviewerNames = new Map(reviewers.map(item => [item.userId, item.displayName]));
  return <aside className="admin-queue"><header><span>Operations</span><h2>Review Queue</h2><p>{items.filter(item => !["COMPLETED", "CANCELLED"].includes(item.status)).length} projects need visibility</p></header>{queueGroups.map(group => { const grouped = items.filter(item => (group.statuses as readonly string[]).includes(item.status)); if (!grouped.length) return null; return <section key={group.label}><h3>{group.label}<span>{grouped.length}</span></h3>{grouped.map(item => <button className={item.id === selectedId ? "active" : ""} onClick={() => onSelect(item.id)} key={item.id}><span><strong>{item.perfumeName}</strong><small>{item.requestNumber} · {item.assignedReviewerId ? reviewerNames.get(item.assignedReviewerId) ?? "Assigned" : "Unassigned"}</small></span><em>{WORKFLOW[item.status].label}</em></button>)}</section>; })}</aside>;
}

interface WorkspaceProps {
  detail: StaffRequestDetail; access: StaffAccess; reviewers: StaffReviewer[]; busy: boolean; error: string;
  onClaim: () => void; onAssign: (reviewerId: string | null) => void;
  onTransition: (status: string, label: string) => void;
  onProposal: (proposal: ArtisanProposalInput) => void;
  onMessage: (message: string) => void;
}

function RequestWorkspace({ detail, access, reviewers, busy, error, onClaim, onAssign, onTransition, onProposal, onMessage }: WorkspaceProps) {
  const { request, messages, activity } = detail;
  const [message, setMessage] = useState("");
  const admin = access.role === "admin" || access.role === "super_admin";
  const canReview = admin || request.assignedReviewerId === access.userId;
  const canConsult = canReview && ["CONSULTATION", "READY_FOR_APPROVAL", "REVISION_REQUESTED"].includes(request.status);
  const canPrepareProposal = canReview && ["CONSULTATION", "REVISION_REQUESTED"].includes(request.status);
  const action = canReview && request.status === "SUBMITTED" ? ["UNDER_REVIEW", "Begin Artisan Review"] : canReview && request.status === "UNDER_REVIEW" ? ["CONSULTATION", "Open Customer Consultation"] : admin && request.status === "PAYMENT_PENDING" ? ["PAID", "Confirm Payment"] : admin && request.status === "PAID" ? ["IN_PRODUCTION", "Begin Production"] : admin && request.status === "IN_PRODUCTION" ? ["SHIPPED", "Mark as Shipped"] : admin && request.status === "SHIPPED" ? ["COMPLETED", "Confirm Delivery"] : null;
  return <main className="admin-workspace">
    <section className="admin-project-head"><div><span>{request.requestNumber}</span><h1>{request.perfumeName}</h1><p>{request.creationMode === "described" ? "Story-led creation" : "Artisan Bench formula"} · {request.concentration}</p></div><strong>{WORKFLOW[request.status].label}</strong></section>
    {error && <p className="admin-error" role="alert">{error}</p>}
    <div className="admin-columns"><div>
      <section className="admin-panel admin-submission"><header><span>Immutable Submission</span><h2>Customer creation brief</h2></header><p>{request.fragranceBrief || "No written brief was supplied."}</p><dl><div><dt>Direction</dt><dd>{request.fragranceDirection.join(" · ") || "Not specified"}</dd></div><div><dt>Top notes</dt><dd>{request.topNotes.join(" · ") || "—"}</dd></div><div><dt>Heart notes</dt><dd>{request.heartNotes.join(" · ") || "—"}</dd></div><div><dt>Base notes</dt><dd>{request.baseNotes.join(" · ") || "—"}</dd></div><div><dt>Customer notes</dt><dd>{request.customerNotes || "None"}</dd></div><div><dt>Submitted</dt><dd>{formatDate(request.submittedAt)}</dd></div></dl></section>
      <section className="admin-panel admin-conversation"><header><span>Consultation</span><h2>Letters with the customer</h2><p>{canConsult ? "Clarify the creation here. When everything is understood, mark it ready to begin production." : "Conversation opens after the internal review moves into consultation."}</p></header><div>{messages.length ? messages.map(item => <article className={item.senderRole} key={item.id}><strong>{item.senderName}</strong><small>{formatDate(item.createdAt)}</small><p>{item.message}</p></article>) : <p>No messages yet.</p>}</div><form onSubmit={event => { event.preventDefault(); if (message.trim() && canConsult) { onMessage(message); setMessage(""); } }}><textarea disabled={!canConsult} value={message} onChange={e => setMessage(e.target.value)} placeholder={canConsult ? "Write a consultation message…" : "Consultation is not open yet."} /><button disabled={busy || !canConsult || !message.trim()}>Send Message</button></form></section>
      {canPrepareProposal && <StaffProposalForm key={`${request.id}-${request.status}`} request={request} busy={busy} onSubmit={onProposal}/>}
    </div><aside>
      <section className="admin-panel admin-actions"><span>Reviewer Assignment</span>{admin ? <label className="admin-assignment">Assigned reviewer<select disabled={busy} value={request.assignedReviewerId ?? ""} onChange={event => onAssign(event.target.value || null)}><option value="">Unassigned</option>{reviewers.map(reviewer => <option key={reviewer.userId} value={reviewer.userId}>{reviewer.displayName}</option>)}</select></label> : !request.assignedReviewerId && request.status === "SUBMITTED" ? <button disabled={busy} onClick={onClaim}>Claim This Project<b>→</b></button> : <p>{request.assignedReviewerId === access.userId ? "This project is assigned to you." : "This project belongs to another reviewer."}</p>}<hr/><span>Current Action</span><h2>{WORKFLOW[request.status].description}</h2>{action && <button disabled={busy} onClick={() => onTransition(action[0], action[1])}>{action[1]}<b>→</b></button>}{request.status === "CONSULTATION" && <small>Use this only after the customer brief is fully understood. The customer will then be sent to payment.</small>}{!action && <p>No staff transition is required at this stage.</p>}</section>
      <section className="admin-panel admin-activity"><span>Audit Trail</span><h2>Project activity</h2>{activity.slice().reverse().map(item => <article key={item.id}><i>✓</i><div><strong>{item.label}</strong><small>{formatDate(item.createdAt)}</small></div></article>)}</section>
    </aside></div>
  </main>;
}

export default function AdminPortalPage() {
  const location = useLocation();
  const [access, setAccess] = useState<StaffAccess | null>(null);
  const [reviewers, setReviewers] = useState<StaffReviewer[]>([]);
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

  useEffect(() => { void staffService.getAccess().then(async result => { setAccess(result); if (result.role) { await refreshQueue(); if (result.role === "admin" || result.role === "super_admin") setReviewers(await staffService.getReviewers()); } }).catch(cause => setError(cause instanceof Error ? cause.message : "Admin Portal could not be loaded.")).finally(() => setLoading(false)); }, []);
  useEffect(() => { setSection(new URLSearchParams(location.search).get("section") === "content" ? "content" : "operations"); }, [location.search]);
  useEffect(() => { if (access?.role && selected) void refreshDetail(selected).catch(cause => setError(cause instanceof Error ? cause.message : "Project could not be opened.")); }, [access?.role, selected]);
  const run = async (operation: () => Promise<unknown>) => { setBusy(true); setError(""); try { await operation(); await refreshQueue(); if (selected) await refreshDetail(selected); } catch (cause) { setError(cause instanceof Error ? cause.message : "The staff action could not be completed."); } finally { setBusy(false); } };

  if (loading) return <div className="admin-loading">Opening the staff workspace…</div>;
  if (!access?.role) return <><GlobalHeader variant="light"/><AccessGate access={access ?? { signedIn: false, role: null, email: "", userId: "" }}/></>;
  const canManageContent = access.role === "admin" || access.role === "super_admin";
  return <div className="admin-shell"><AdminHeader access={access} portalSection={section} onPortalSectionChange={setSection}/>{section === "content" && canManageContent ? <ContentManager/> : <div className="admin-layout"><Queue items={items} reviewers={reviewers} selectedId={selected} onSelect={setSelectedId}/>{detail ? <RequestWorkspace detail={detail} access={access} reviewers={reviewers} busy={busy} error={error} onClaim={() => void run(() => staffService.claim(detail.request.id))} onAssign={reviewerId => void run(() => staffService.assign(detail.request.id, reviewerId))} onTransition={(status, label) => void run(() => staffService.transition(detail.request.id, status, label))} onProposal={proposal => void run(() => staffService.transition(detail.request.id, "READY_FOR_APPROVAL", detail.request.status === "REVISION_REQUESTED" ? "Updated proposal ready for customer" : "Proposal ready for customer", proposal))} onMessage={message => void run(() => staffService.sendMessage(detail.request.id, message))}/> : <main className="admin-empty"><h2>{items.length ? "Select a project" : "The review queue is clear."}</h2><p>{error || "New customer submissions will appear here."}</p></main>}</div>}</div>;
}
