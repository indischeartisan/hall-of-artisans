import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router";
import type { AdminAftercareCase, AdminOrder } from "./adminDashboardService";
import type { AdminOutletContext } from "./AdminDashboardLayout";
import { aftercareService, type AftercareCase } from "../aftercare/aftercareService";

const date = (value: string) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
const label = (value: string) => value.replaceAll("_", " ").toLowerCase().replace(/(^|\s)\w/g, match => match.toUpperCase());
const badge = (value: string) => <span className={`hoa-status status-${value.toLowerCase()}`}>{label(value)}</span>;

function Header({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <header className="hoa-admin-page-head"><div><span>{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div></header>;
}

function CaseDrawer({ item, onClose }: { item: AdminAftercareCase; onClose: () => void }) {
  const [detail, setDetail] = useState<AftercareCase | null>(null);
  useEffect(() => { void aftercareService.getCase(item.id).then(setDetail); }, [item.id]);
  const messages = detail?.messages ?? [];
  return <div className="hoa-drawer-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}><aside className="hoa-detail-drawer"><button className="hoa-drawer-close" onClick={onClose}>×</button><header><span>{label(item.kind)} Request</span><h2>{item.creationName}</h2><p>{item.requestNumber} · {item.customer.name}</p>{badge(item.status)}</header>
    <dl className="hoa-detail-facts"><div><dt>Artisan ID</dt><dd>{item.customer.artisanId}</dd></div><div><dt>Submitted</dt><dd>{date(item.createdAt)}</dd></div><div><dt>Updated</dt><dd>{date(item.updatedAt)}</dd></div><div><dt>Assigned artisan</dt><dd>{item.assignedReviewerId ? "Assigned" : "Unassigned"}</dd></div><div><dt>Follow-up order</dt><dd>{item.linkedReviewRequestId ? "Created" : "Not created"}</dd></div><div><dt>Case ID</dt><dd>{item.id.slice(0, 8)}</dd></div></dl>
    <section><h3>{item.subject}</h3><p>{item.body}</p></section>
    <section><h3>Conversation</h3>{messages.length ? messages.map(message => <article className="hoa-message" key={message.id}><strong>{message.senderName}</strong><small>{date(message.createdAt)}</small><p>{message.message}</p></article>) : <p>{detail ? "No follow-up messages yet." : "Loading conversation…"}</p>}</section>
    {item.linkedReviewRequestId && <a className="hoa-primary" href={`/admin/creations?open=${item.linkedReviewRequestId}`}>Open Linked Creation <b>→</b></a>}
  </aside></div>;
}

function AftercareQueuePage({ kind, title, copy }: { kind: "ADJUSTMENT" | "REORDER"; title: string; copy: string }) {
  const { snapshot, loading, error } = useOutletContext<AdminOutletContext>();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [selectedId, setSelectedId] = useState("");
  const cases = (snapshot?.aftercare ?? []).filter(item => item.kind === kind);
  const filtered = useMemo(() => cases.filter(item => `${item.creationName} ${item.requestNumber} ${item.customer.name} ${item.customer.artisanId} ${item.subject}`.toLowerCase().includes(search.toLowerCase()) && (status === "ALL" || item.status === status)), [cases, search, status]);
  const selected = cases.find(item => item.id === selectedId);
  return <div className="hoa-admin-page"><Header eyebrow="Aftercare" title={title} copy={copy}/>{!snapshot ? <div className="hoa-admin-state">{loading ? "Preparing requests…" : error}</div> : <><section className="hoa-filter-bar orders"><input aria-label={`Search ${title}`} placeholder="Search perfume, customer, or request…" value={search} onChange={event => setSearch(event.target.value)}/><label>Status<select value={status} onChange={event => setStatus(event.target.value)}><option value="ALL">All statuses</option><option value="OPEN">Open</option><option value="DISCUSSING">Discussing</option><option value="RESOLVED">Resolved</option></select></label></section><section className="hoa-data-card"><table><thead><tr><th>Perfume</th><th>Customer</th><th>Request</th><th>Subject</th><th>Status</th><th>Updated</th><th/></tr></thead><tbody>{filtered.map(item => <tr key={item.id}><td><strong>{item.creationName}</strong><small>{item.requestNumber}</small></td><td><strong>{item.customer.name}</strong><small>{item.customer.artisanId}</small></td><td>{label(item.kind)}</td><td>{item.subject}</td><td>{badge(item.status)}</td><td>{date(item.updatedAt)}</td><td><button onClick={() => setSelectedId(item.id)}>Details</button></td></tr>)}</tbody></table>{!filtered.length && <p className="empty-copy">No {title.toLowerCase()} match this view.</p>}</section></>}{selected && <CaseDrawer item={selected} onClose={() => setSelectedId("")}/>}</div>;
}

export const AdminRevisionRequestsPage = () => <AftercareQueuePage kind="ADJUSTMENT" title="Revision Requests" copy="Review adjustment requests while preserving the original completed commission."/>;
export const AdminRepeatOrdersPage = () => <AftercareQueuePage kind="REORDER" title="Repeat Orders" copy="Track requests to recreate a preserved perfume as a linked order."/>;

function perfumeNames(order: AdminOrder) { return order.items.map(item => item.creationName).join(", "); }

export function AdminCompletedOrdersPage() {
  const { snapshot, loading, error } = useOutletContext<AdminOutletContext>();
  const [search, setSearch] = useState("");
  const orders = (snapshot?.orders ?? []).filter(order => order.productionStatus === "completed" || order.shippingStatus === "delivered");
  const filtered = orders.filter(order => `${order.orderNumber} ${order.customer.name} ${order.customer.artisanId} ${perfumeNames(order)}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="hoa-admin-page"><Header eyebrow="Preservation" title="Completed Orders" copy="Review completed perfumes and prepare selected creations for the public Hall Archive."/>{!snapshot ? <div className="hoa-admin-state">{loading ? "Preparing completed orders…" : error}</div> : <><section className="hoa-filter-bar"><input aria-label="Search completed orders" placeholder="Search perfume, order, or customer…" value={search} onChange={event => setSearch(event.target.value)}/></section><section className="hoa-data-card"><table><thead><tr><th>Order</th><th>Perfume</th><th>Customer</th><th>Production</th><th>Delivery</th><th>Updated</th><th/></tr></thead><tbody>{filtered.flatMap(order => order.items.map(item => <tr key={item.id}><td><strong>{order.orderNumber}</strong><small>{date(order.createdAt)}</small></td><td><strong>{item.creationName}</strong><small>{item.reviewRequestId.slice(0, 8)}</small></td><td><strong>{order.customer.name}</strong><small>{order.customer.artisanId}</small></td><td>{badge(item.productionStatus)}</td><td>{badge(item.shippingStatus)}</td><td>{date(order.updatedAt)}</td><td><a className="hoa-table-action" href={`/admin/hall-archive?candidate=${encodeURIComponent(item.reviewRequestId)}`}>Archive Setup</a></td></tr>))}</tbody></table>{!filtered.length && <p className="empty-copy">No completed orders match this view.</p>}</section></>}</div>;
}
