import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useOutletContext, useSearchParams } from "react-router";
import { WORKFLOW } from "../../domain/workflow";
import type { ReviewRequest } from "../orders/types";
import type { StaffRequestDetail } from "../admin/staffService";
import type { PerfumerOutletContext } from "./PerfumerWorkspaceLayout";
import { perfumerService } from "./perfumerService";
import { aftercareService, type AftercareCase } from "../aftercare/aftercareService";

const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
const status = (value: ReviewRequest["status"]) => <span className={`perfumer-status status-${value.toLowerCase()}`}>{WORKFLOW[value].label}</span>;
const nextAction = (request: ReviewRequest) => request.status === "SUBMITTED" ? ["UNDER_REVIEW", "Begin Review"] : request.status === "UNDER_REVIEW" ? ["CONSULTATION", "Open Consultation"] : request.status === "CONSULTATION" ? ["READY_FOR_PAYMENT", "Ready for Payment"] : null;

function Header({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) { return <header className="perfumer-page-head"><span>{eyebrow}</span><h1>{title}</h1><p>{copy}</p></header>; }
function State({ context }: { context: PerfumerOutletContext }) { return <div className="perfumer-state">{context.loading ? "Preparing your assigned creations…" : context.error || "No assigned creations yet."}</div>; }

function PerfumerAftercare({ cases, reload }: { cases: AftercareCase[]; reload: () => Promise<void> }) {
  const [messages, setMessages] = useState<Record<string, string>>({}); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const send = async (item: AftercareCase) => { const value = messages[item.id]?.trim(); if (!value) return; setBusy(true); try { await aftercareService.send(item.id, value); setMessages(current => ({ ...current, [item.id]: "" })); await reload(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Reply could not be sent."); } finally { setBusy(false); } };
  const resolve = async (item: AftercareCase) => { setBusy(true); try { await aftercareService.resolve(item.id); await reload(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Case could not be resolved."); } finally { setBusy(false); } };
  return <section className="perfumer-aftercare"><header><span>Post-delivery care</span><h3>Aftercare &amp; Feedback</h3></header>{error && <p className="perfumer-error">{error}</p>}{cases.length ? cases.map(item => <article key={item.id}><header><div><small>{item.kind.replaceAll("_", " ")} · {item.status}</small><strong>{item.subject}</strong></div>{item.rating && <b>{item.rating}/5</b>}</header><div>{item.messages.map(note => <p className={note.senderRole} key={note.id}><strong>{note.senderName}</strong><span>{note.message}</span><small>{formatDate(note.createdAt)}</small></p>)}</div>{item.status !== "RESOLVED" && <footer><input value={messages[item.id] ?? ""} onChange={event => setMessages(current => ({ ...current, [item.id]: event.target.value }))} placeholder="Reply to this customer…"/><button disabled={busy} onClick={() => void send(item)}>Send</button><button disabled={busy} onClick={() => void resolve(item)}>Resolve</button></footer>}</article>) : <p className="empty">No aftercare requests for this completed project.</p>}</section>;
}

function ProjectWorkspace({ project, mode = "drawer", onClose, onChanged }: { project: ReviewRequest; mode?: "drawer" | "inline"; onClose?: () => void; onChanged: () => Promise<void> }) {
  const [detail, setDetail] = useState<StaffRequestDetail | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [aftercare, setAftercare] = useState<AftercareCase[]>([]);
  const load = async () => { const [projectDetail, cases] = await Promise.all([perfumerService.getDetail(project.id), aftercareService.getForRequest(project.id)]); setDetail(projectDetail); setAftercare(cases); };
  useEffect(() => { void load().catch(cause => setError(cause instanceof Error ? cause.message : "Project could not be opened.")); }, [project.id]);
  const request = detail?.request ?? project;
  const snapshot = request.submissionSnapshot ?? request.previewSnapshot;
  const action = nextAction(request);
  const run = async (operation: () => Promise<unknown>) => { setBusy(true); setError(""); try { await operation(); await onChanged(); await load(); } catch (cause) { setError(cause instanceof Error ? cause.message : "The action could not be completed."); } finally { setBusy(false); } };
  const submitMessage = (event: FormEvent) => { event.preventDefault(); if (message.trim() && request.status === "CONSULTATION") void run(async () => { await perfumerService.sendMessage(request.id, message); setMessage(""); }); };
  const content = <section className={`perfumer-project ${mode}`}>
    {onClose && <button className="perfumer-close" onClick={onClose}>×</button>}
    <header><span>{request.requestNumber}</span><h2>{request.perfumeName}</h2><p>{request.creationMode === "described" ? "Describe Your Creation" : "Artisan Bench"} · {request.packageSnapshot?.name ?? "Package not recorded"}</p>{status(request.status)}</header>
    {error && <p className="perfumer-error">{error}</p>}
    <div className="perfumer-facts"><div><small>Concentration</small><strong>{request.concentration}</strong></div><div><small>Submitted</small><strong>{formatDate(request.submittedAt)}</strong></div><div><small>Updated</small><strong>{formatDate(request.lastUpdatedAt)}</strong></div></div>
    <section className="perfumer-brief"><h3>Customer Creation Brief</h3><p>{request.fragranceBrief || snapshot?.writtenStory || "No written brief supplied."}</p><dl><div><dt>Direction</dt><dd>{request.fragranceDirection.join(" · ") || "—"}</dd></div><div><dt>Top</dt><dd>{request.topNotes.join(" · ") || "To interpret"}</dd></div><div><dt>Heart</dt><dd>{request.heartNotes.join(" · ") || "To interpret"}</dd></div><div><dt>Base</dt><dd>{request.baseNotes.join(" · ") || "To interpret"}</dd></div><div><dt>Customer notes</dt><dd>{request.customerNotes || snapshot?.additionalNotes || "None"}</dd></div><div><dt>Avoid</dt><dd>{snapshot?.notesToAvoid.join(" · ") || "None"}</dd></div></dl></section>
    <section className="perfumer-chat"><header><div><span>Private Consultation</span><h3>Letters with the customer</h3></div><small>{request.status === "CONSULTATION" ? "Chat is open" : "Opens during consultation"}</small></header><div className="perfumer-chat-log">{detail?.messages.length ? detail.messages.map(item => <article className={item.senderRole} key={item.id}><header><strong>{item.senderName}</strong><small>{formatDate(item.createdAt)}</small></header><p>{item.message}</p></article>) : <p className="empty">No letters yet.</p>}</div><form onSubmit={submitMessage}><textarea value={message} onChange={e => setMessage(e.target.value)} disabled={request.status !== "CONSULTATION"} placeholder={request.status === "CONSULTATION" ? "Write a clear consultation message…" : "Chat opens when this creation enters consultation."}/><button disabled={busy || request.status !== "CONSULTATION" || !message.trim()}>Send</button></form></section>
    <section className="perfumer-timeline"><h3>Project Activity</h3>{detail?.activity.slice().reverse().map(item => <article key={item.id}><i>✓</i><span><strong>{item.label}</strong><small>{formatDate(item.createdAt)}</small></span></article>)}</section>
    {request.status === "COMPLETED" && <PerfumerAftercare cases={aftercare} reload={load}/>} 
    {action && <button className="perfumer-primary" disabled={busy} onClick={() => void run(() => perfumerService.transition(request.id, action[0], action[1]))}>{busy ? "Updating…" : action[1]}<b>→</b></button>}
  </section>;
  return mode === "drawer" ? <div className="perfumer-drawer-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose?.(); }}>{content}</div> : content;
}

export function PerfumerOverviewPage() {
  const context = useOutletContext<PerfumerOutletContext>();
  const projects = context.data?.projects ?? [];
  const metrics = [["Waiting for Review", "SUBMITTED"], ["In Review", "UNDER_REVIEW"], ["Consultations", "CONSULTATION"], ["Ready for Payment", "READY_FOR_PAYMENT"]] as const;
  return <div className="perfumer-page"><Header eyebrow="Artisan Workspace" title="Your Atelier Desk" copy="Assigned creations, customer letters, and the next work requiring your craft."/>{!context.data ? <State context={context}/> : <><section className="perfumer-metrics">{metrics.map(([label, value], index) => <a href={`/perfumer/creations?status=${value}`} key={value}><i>{["◉", "✦", "✉", "◇"][index]}</i><span><small>{label}</small><strong>{projects.filter(item => item.status === value).length}</strong></span></a>)}</section><div className="perfumer-overview-grid"><section className="perfumer-card"><header><h2>Priority Work</h2><a href="/perfumer/creations">All creations</a></header>{projects.slice(0, 6).map(item => <article key={item.id}><div><strong>{item.perfumeName}</strong><small>{item.requestNumber} · {formatDate(item.lastUpdatedAt)}</small></div>{status(item.status)}<a href={`/perfumer/creations?open=${item.id}`}>Open</a></article>)}{!projects.length && <p className="empty">No projects are assigned to you.</p>}</section><section className="perfumer-card"><header><h2>Recent Customer Letters</h2><a href="/perfumer/messages">Open inbox</a></header>{context.data.recentMessages.filter(item => item.senderRole === "customer").slice(0, 6).map(item => <article key={item.id}><div><strong>{item.senderName}</strong><small>{projects.find(project => project.id === item.requestId)?.perfumeName ?? "Creation"} · {formatDate(item.createdAt)}</small><p>{item.message}</p></div><a href={`/perfumer/messages?open=${item.requestId}`}>Reply</a></article>)}{!context.data.recentMessages.length && <p className="empty">No customer letters yet.</p>}</section></div></>}</div>;
}

export function PerfumerCreationsPage() {
  const context = useOutletContext<PerfumerOutletContext>();
  const [params] = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(params.get("open") ?? "");
  const [filter, setFilter] = useState(params.get("status") ?? "ALL");
  const projects = context.data?.projects ?? [];
  const customers = context.data?.customers ?? [];
  const filtered = useMemo(() => projects.filter(item => {
    const customer = customers.find(entry => entry.userId === item.userId);
    return (filter === "ALL" || item.status === filter) && `${customer?.displayName} ${customer?.artisanId} ${item.perfumeName} ${item.requestNumber} ${item.fragranceBrief}`.toLowerCase().includes(search.toLowerCase());
  }), [projects, customers, search, filter]);
  const selected = projects.find(item => item.id === selectedId);
  const groups = customers.map(customer => ({ customer, projects: filtered.filter(item => item.userId === customer.userId) })).filter(group => group.projects.length);
  return <div className="perfumer-page"><Header eyebrow="Assigned Customer Work" title="Customer Projects" copy="Every customer and creation assigned to your atelier, including post-delivery aftercare."/>{!context.data ? <State context={context}/> : <><section className="perfumer-filter"><input placeholder="Search customer, Artisan ID, or creation…" value={search} onChange={e => setSearch(e.target.value)}/><select value={filter} onChange={e => setFilter(e.target.value)}><option value="ALL">All stages</option>{["SUBMITTED", "UNDER_REVIEW", "CONSULTATION", "READY_FOR_PAYMENT", "COMPLETED"].map(item => <option key={item}>{item}</option>)}</select></section><div className="perfumer-customer-layout"><aside className="perfumer-customer-list">{groups.map(({ customer, projects: customerProjects }) => <section key={customer.userId}><header><div><strong>{customer.displayName}</strong><small>{customer.artisanId ?? "Registered customer"}</small></div><b>{customerProjects.length}</b></header>{customerProjects.map(project => { const latest = context.data?.recentMessages.find(item => item.requestId === project.id); const openCases = context.data?.aftercareCases.filter(item => item.reviewRequestId === project.id && item.status !== "RESOLVED").length ?? 0; return <button className={project.id === selectedId ? "active" : ""} onClick={() => setSelectedId(project.id)} key={project.id}><strong>{project.perfumeName}{openCases > 0 && <b className="aftercare-count">{openCases}</b>}</strong><small>{project.requestNumber} · {latest?.message ?? WORKFLOW[project.status].label}</small>{status(project.status)}</button>; })}</section>)}{!groups.length && <p className="empty">No customer projects match this view.</p>}</aside>{selected ? <ProjectWorkspace mode="inline" project={selected} onChanged={context.refresh}/> : <section className="perfumer-state perfumer-project-empty">Select a customer project to open its brief and letters.</section>}</div></>}</div>;
}

export function PerfumerMessagesPage() {
  const context = useOutletContext<PerfumerOutletContext>();
  const [params] = useSearchParams();
  const projects = context.data?.projects ?? [];
  const [selectedId, setSelectedId] = useState(params.get("open") ?? projects[0]?.id ?? "");
  useEffect(() => { if (!selectedId && projects[0]) setSelectedId(projects[0].id); }, [projects, selectedId]);
  const selected = projects.find(item => item.id === selectedId);
  return <div className="perfumer-page"><Header eyebrow="Private Correspondence" title="Customer Letters" copy="Conversations remain attached to each creation and open only during consultation."/>{!context.data ? <State context={context}/> : <div className="perfumer-messages-layout"><aside>{projects.map(project => { const latest = context.data?.recentMessages.find(item => item.requestId === project.id); return <button className={project.id === selectedId ? "active" : ""} onClick={() => setSelectedId(project.id)} key={project.id}><strong>{project.perfumeName}</strong><small>{latest?.message ?? WORKFLOW[project.status].label}</small>{status(project.status)}</button>; })}</aside>{selected ? <ProjectWorkspace mode="inline" project={selected} onChanged={context.refresh}/> : <section className="perfumer-state">Select a creation to open its letters.</section>}</div>}</div>;
}

export function PerfumerCompletedWorksPage() {
  const context = useOutletContext<PerfumerOutletContext>();
  const [search, setSearch] = useState("");
  const completed = (context.data?.projects ?? []).filter(item => item.status === "COMPLETED");
  const customers = context.data?.customers ?? [];
  const filtered = completed.filter(item => {
    const customer = customers.find(entry => entry.userId === item.userId);
    return `${item.perfumeName} ${item.requestNumber} ${customer?.displayName ?? ""} ${customer?.artisanId ?? ""}`.toLowerCase().includes(search.toLowerCase());
  });
  const [selectedId, setSelectedId] = useState("");
  useEffect(() => { if (!selectedId && filtered[0]) setSelectedId(filtered[0].id); }, [filtered, selectedId]);
  const selected = completed.find(item => item.id === selectedId);
  return <div className="perfumer-page"><Header eyebrow="Artisan Record" title="Completed Works" copy="A permanent record of commissions completed by your atelier, with feedback and linked follow-up work."/>{!context.data ? <State context={context}/> : <><section className="perfumer-filter"><input placeholder="Search customer, Artisan ID, or completed work…" value={search} onChange={event => setSearch(event.target.value)}/><strong>{filtered.length} completed</strong></section><div className="perfumer-customer-layout"><aside className="perfumer-customer-list">{filtered.map(project => { const customer = customers.find(item => item.userId === project.userId); const followUps = context.data?.aftercareCases.filter(item => item.reviewRequestId === project.id).length ?? 0; return <button className={project.id === selectedId ? "active" : ""} onClick={() => setSelectedId(project.id)} key={project.id}><strong>{project.perfumeName}</strong><small>{customer?.displayName ?? "Customer"} · {project.requestNumber}</small><span className="perfumer-status status-completed">Completed · {followUps} aftercare</span></button>; })}{!filtered.length && <p className="empty">No completed works match this view.</p>}</aside>{selected ? <ProjectWorkspace mode="inline" project={selected} onChanged={context.refresh}/> : <section className="perfumer-state perfumer-project-empty">Completed commissions will be preserved here.</section>}</div></>}</div>;
}

export function PerfumerProfilePage() {
  const context = useOutletContext<PerfumerOutletContext>();
  return <div className="perfumer-page"><Header eyebrow="Artisan Record" title="My Profile" copy="The staff identity currently used for assigned creations and customer correspondence."/><section className="perfumer-profile-card"><div className="perfumer-monogram">{context.access.email.slice(0, 1).toUpperCase()}</div><dl><div><dt>Staff account</dt><dd>{context.access.email}</dd></div><div><dt>Workspace role</dt><dd>Perfumer · Reviewer</dd></div><div><dt>Assigned creations</dt><dd>{context.data?.projects.length ?? 0}</dd></div><div><dt>Access</dt><dd>Private assigned records only</dd></div></dl><p>Profile editing and availability settings will be added later. Role assignment remains controlled by an administrator.</p></section></div>;
}
