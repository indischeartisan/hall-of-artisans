import { useEffect, useState, type FormEvent } from "react";
import { aftercareService, type AftercareCase, type AftercareKind } from "./aftercareService";

const actions: Array<[AftercareKind, string, string]> = [
  ["GRATITUDE", "Send Thanks", "Share a private note of gratitude with your artisan."],
  ["REVIEW", "Leave a Review", "Record your experience and rating."],
  ["ISSUE", "Report an Issue", "Tell us if something arrived damaged or incorrect."],
  ["ADJUSTMENT", "Request Adjustment", "Start a linked discussion without altering the completed order."],
  ["REORDER", "Reorder", "Ask to recreate this preserved fragrance."],
];
const label = (value: string) => value.charAt(0) + value.slice(1).toLowerCase();
const date = (value: string) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

const demoCase = (): AftercareCase => ({
  id: "aftercare-demo", reviewRequestId: "demo-completed-order", userId: "demo-customer", assignedReviewerId: "demo-artisan",
  kind: "GRATITUDE", status: "DISCUSSING", subject: "Thank you for this fragrance", body: "The perfume arrived beautifully.", rating: null,
  linkedReviewRequestId: null, resolvedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  messages: [
    { id: "demo-message-1", caseId: "aftercare-demo", senderRole: "customer", senderName: "You", message: "The perfume arrived beautifully. Thank you for bringing the story to life.", createdAt: new Date().toISOString() },
    { id: "demo-message-2", caseId: "aftercare-demo", senderRole: "artisan", senderName: "The Hall Artisan", message: "It was an honour to create it for you. Your final formula remains preserved in The Hall.", createdAt: new Date().toISOString() }
  ]
});

export default function CustomerAftercarePanel({ requestId, demo = false }: { requestId: string; demo?: boolean }) {
  const [cases, setCases] = useState<AftercareCase[]>(() => demo ? [demoCase()] : []);
  const [kind, setKind] = useState<AftercareKind | null>(null);
  const [subject, setSubject] = useState(""); const [body, setBody] = useState(""); const [rating, setRating] = useState(5);
  const [message, setMessage] = useState<Record<string, string>>({}); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const [followUpId, setFollowUpId] = useState("");
  const load = async () => { if (!demo) setCases(await aftercareService.getForRequest(requestId)); };
  useEffect(() => { void load().catch(cause => setError(cause instanceof Error ? cause.message : "Aftercare could not be loaded.")); }, [requestId]);
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!kind) return; setBusy(true); setError(""); setFollowUpId(""); try { if (demo) { const now = new Date().toISOString(); const id = `demo-${Date.now()}`; setCases(current => [{ id, reviewRequestId: requestId, userId: "demo-customer", assignedReviewerId: "demo-artisan", kind, status: "OPEN", subject, body, rating: kind === "REVIEW" ? rating : null, linkedReviewRequestId: null, resolvedAt: null, createdAt: now, updatedAt: now, messages: [{ id: `${id}-message`, caseId: id, senderRole: "customer", senderName: "You", message: body, createdAt: now }] }, ...current]); } else { const created = await aftercareService.create(requestId, { kind, subject, body, rating: kind === "REVIEW" ? rating : null }); setFollowUpId(created.linkedReviewRequestId ?? ""); await load(); } setKind(null); setSubject(""); setBody(""); } catch (cause) { setError(cause instanceof Error ? cause.message : "Your request could not be sent."); } finally { setBusy(false); } };
  const send = async (item: AftercareCase) => { const text = message[item.id]?.trim(); if (!text) return; setBusy(true); try { if (demo) { const now = new Date().toISOString(); setCases(current => current.map(entry => entry.id === item.id ? { ...entry, updatedAt: now, messages: [...entry.messages, { id: `demo-message-${Date.now()}`, caseId: entry.id, senderRole: "customer", senderName: "You", message: text, createdAt: now }] } : entry)); } else { await aftercareService.send(item.id, text); await load(); } setMessage(current => ({ ...current, [item.id]: "" })); } catch (cause) { setError(cause instanceof Error ? cause.message : "Message could not be sent."); } finally { setBusy(false); } };
  return <section className="fulfillment-panel aftercare-panel">
    <header><p>Aftercare &amp; Feedback</p><h2>Your story can continue.</h2><span>The completed commission stays preserved. Adjustments and reorders become linked follow-up records.</span></header>
    {error && <p className="aftercare-error" role="alert">{error}</p>}
    {followUpId && <div className="aftercare-followup"><strong>New linked creation created.</strong><span>Your completed original remains unchanged.</span><a href={`/my-creations/${followUpId}`}>Open New Creation →</a></div>}
    {!followUpId && cases.filter(item => item.linkedReviewRequestId).map(item => <div className="aftercare-followup compact" key={`linked-${item.id}`}><strong>{label(item.kind)} creation</strong><span>Linked to this completed commission.</span><a href={`/my-creations/${item.linkedReviewRequestId}`}>Open Creation →</a></div>)}
    <div className="aftercare-actions">{actions.map(([value, title, copy]) => <button type="button" onClick={() => { setKind(value); setSubject(title); }} key={value}><strong>{title}</strong><small>{copy}</small></button>)}</div>
    {kind && <form className="aftercare-form" onSubmit={submit}><div><small>{label(kind)}</small><button type="button" onClick={() => setKind(null)}>×</button></div><input required maxLength={160} value={subject} onChange={event => setSubject(event.target.value)} placeholder="Subject"/>{kind === "REVIEW" && <label>Rating <select value={rating} onChange={event => setRating(Number(event.target.value))}>{[5,4,3,2,1].map(value => <option key={value} value={value}>{value} / 5</option>)}</select></label>}<textarea required maxLength={5000} value={body} onChange={event => setBody(event.target.value)} placeholder="Write your message…"/><button disabled={busy}>Send to The Hall</button></form>}
    {!!cases.length && <div className="aftercare-cases"><h3>Aftercare history</h3>{cases.map(item => <article key={item.id}><header><span>{label(item.kind)} · {label(item.status)}</span><strong>{item.subject}</strong><small>{date(item.updatedAt)}{item.rating ? ` · ${item.rating}/5` : ""}</small></header><div>{item.messages.map(note => <p className={note.senderRole} key={note.id}><b>{note.senderName}</b><span>{note.message}</span><small>{date(note.createdAt)}</small></p>)}</div>{item.status !== "RESOLVED" && <div className="aftercare-reply"><input value={message[item.id] ?? ""} onChange={event => setMessage(current => ({ ...current, [item.id]: event.target.value }))} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); void send(item); } }} placeholder="Reply to this aftercare conversation…"/><button type="button" disabled={busy} onClick={() => void send(item)}>Send</button></div>}</article>)}</div>}
  </section>;
}
