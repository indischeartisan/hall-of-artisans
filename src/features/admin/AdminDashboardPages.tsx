import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router";
import { WORKFLOW } from "../../domain/workflow";
import type { ReviewRequest } from "../orders/types";
import { adminDashboardService, type AdminCreation, type AdminOrder } from "./adminDashboardService";
import type { AdminOutletContext } from "./AdminDashboardLayout";
import { staffService, type StaffRequestDetail } from "./staffService";

const money = (amount: number, currency = "IDR") => new Intl.NumberFormat("id-ID", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
const date = (value: string | null) => value ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
const sameDay = (value: string | null, target: Date) => Boolean(value && new Date(value).toDateString() === target.toDateString());
const sameMonth = (value: string | null, target: Date) => Boolean(value && new Date(value).getMonth() === target.getMonth() && new Date(value).getFullYear() === target.getFullYear());
const statusLabel = (value: string) => WORKFLOW[value as keyof typeof WORKFLOW]?.label ?? value.replaceAll("_", " ").toLowerCase().replace(/(^|\s)\w/g, match => match.toUpperCase());
const badge = (status: string) => <span className={`hoa-status status-${status.toLowerCase()}`}>{statusLabel(status)}</span>;

function PageHeader({ eyebrow, title, copy, actions }: { eyebrow: string; title: string; copy: string; actions?: React.ReactNode }) {
  return <header className="hoa-admin-page-head"><div><span>{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>{actions}</header>;
}

function Loading({ loading, error }: { loading: boolean; error: string }) {
  if (loading) return <div className="hoa-admin-state">Preparing live workspace data…</div>;
  return <div className="hoa-admin-state error">{error || "No data is available yet."}</div>;
}

export function AdminOverviewPage() {
  const { snapshot, loading, error, refresh } = useOutletContext<AdminOutletContext>();
  if (!snapshot) return <div className="hoa-admin-page"><PageHeader eyebrow="Admin Workspace" title="Overview" copy="What is happening inside The Hall today."/><Loading loading={loading} error={error}/></div>;
  const now = new Date();
  const requests = snapshot.creations;
  const counts = [
    ["Waiting for Review", requests.filter(item => item.request.status === "SUBMITTED").length, "/admin/creations?status=SUBMITTED"],
    ["With Perfumer", requests.filter(item => item.request.status === "UNDER_REVIEW").length, "/admin/creations?status=UNDER_REVIEW"],
    ["In Consultation", requests.filter(item => item.request.status === "CONSULTATION").length, "/admin/creations?status=CONSULTATION"],
    ["In Production", requests.filter(item => item.request.status === "IN_PRODUCTION").length, "/admin/orders?status=IN_PRODUCTION"]
  ] as const;
  const paid = snapshot.orders.filter(order => order.paymentStatus.toLowerCase() === "paid");
  const waiting = snapshot.orders.filter(order => order.paymentStatus.toLowerCase() === "pending");
  const attention = [
    ...requests.filter(item => item.request.status === "SUBMITTED").map(item => ({ label: "Waiting for review", title: item.request.perfumeName, copy: item.request.requestNumber, href: `/admin/creations?open=${item.request.id}` })),
    ...snapshot.customerMessages.map(item => ({ label: "Customer update", title: item.creationName, copy: item.message, href: `/admin/creations?open=${item.requestId}` })),
    ...requests.filter(item => item.request.status === "READY_FOR_PAYMENT").map(item => ({ label: "Ready for payment", title: item.request.perfumeName, copy: item.request.requestNumber, href: `/admin/creations?open=${item.request.id}` })),
    ...snapshot.orders.filter(order => order.paymentStatus.toLowerCase() === "paid" && order.productionStatus === "not_started").map(order => ({ label: "Payment confirmed", title: order.orderNumber, copy: "Production has not started", href: `/admin/orders?open=${order.id}` })),
    ...snapshot.orders.filter(order => order.productionStatus === "completed" && order.shippingStatus === "not_shipped").map(order => ({ label: "Ready to ship", title: order.orderNumber, copy: `${order.items.length} creation${order.items.length === 1 ? "" : "s"}`, href: `/admin/orders?open=${order.id}` }))
  ].slice(0, 5);
  return <div className="hoa-admin-page">
    <PageHeader eyebrow="Admin Workspace" title="Good day, Administrator" copy="A concise operational view of creations, payments, and production." actions={<button className="hoa-text-button" onClick={() => void refresh()}>Refresh data</button>}/>
    <section className="hoa-metric-grid">{counts.map(([label, value, href], index) => <a href={href} key={label}><i>{["◉", "♙", "✦", "◆"][index]}</i><span><small>{label}</small><strong>{value}</strong><em>creations</em></span></a>)}</section>
    <section className="hoa-money-strip"><header><span>Money In</span><small>Recorded orders only</small></header><div><small>Paid Today</small><strong>{money(paid.filter(item => sameDay(item.paidAt, now)).reduce((sum, item) => sum + item.amount, 0))}</strong></div><div><small>Paid This Month</small><strong>{money(paid.filter(item => sameMonth(item.paidAt, now)).reduce((sum, item) => sum + item.amount, 0))}</strong></div><div><small>Waiting for Payment</small><strong>{money(waiting.reduce((sum, item) => sum + item.amount, 0))}</strong></div></section>
    <div className="hoa-overview-grid">
      <section className="hoa-admin-card"><header><h2>Needs Attention</h2><a href="/admin/creations">View all</a></header>{attention.length ? attention.map((item, index) => <article key={`${item.label}-${index}`}><b>{index + 1}</b><div><strong>{item.title}</strong><small>{item.label} · {item.copy}</small></div><a href={item.href}>Open</a></article>) : <p className="empty-copy">Nothing requires immediate attention.</p>}</section>
      <section className="hoa-admin-card"><header><h2>Recent Activity</h2><a href="/admin/creations">View creations</a></header>{snapshot.activity.slice(0, 6).map(item => <article key={item.id}><b>✓</b><div><strong>{item.label}</strong><small>{item.creationName} · {date(item.createdAt)}</small></div></article>)}</section>
      <section className="hoa-admin-card hoa-recent"><header><h2>Recent Creations</h2><a href="/admin/creations">View all</a></header>{requests.slice(0, 6).map(item => <article key={item.request.id}><div><strong>{item.request.perfumeName}</strong><small>{item.customer.name} · {item.request.requestNumber}</small></div>{badge(item.request.status)}</article>)}</section>
    </div>
  </div>;
}

const nextAction = (request: ReviewRequest) => request.status === "SUBMITTED" ? ["UNDER_REVIEW", "Begin Review"] : request.status === "UNDER_REVIEW" ? ["CONSULTATION", "Open Consultation"] : request.status === "CONSULTATION" ? ["READY_FOR_PAYMENT", "Ready for Payment"] : null;

function CreationDrawer({ creation, onClose, onChanged }: { creation: AdminCreation; onClose: () => void; onChanged: () => Promise<void> }) {
  const [detail, setDetail] = useState<StaffRequestDetail | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { void staffService.getDetail(creation.request.id).then(setDetail).catch(cause => setError(cause instanceof Error ? cause.message : "Detail could not be loaded.")); }, [creation.request.id]);
  const request = detail?.request ?? creation.request;
  const snapshot = request.submissionSnapshot ?? request.previewSnapshot;
  const action = nextAction(request);
  const run = async () => { if (!action) return; setBusy(true); try { await staffService.transition(request.id, action[0], action[1]); await onChanged(); setDetail(await staffService.getDetail(request.id)); } catch (cause) { setError(cause instanceof Error ? cause.message : "Action failed."); } finally { setBusy(false); } };
  return <div className="hoa-drawer-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><aside className="hoa-detail-drawer" aria-label="Creation detail"><button className="hoa-drawer-close" onClick={onClose}>×</button><header><span>Creation Detail</span><h2>{request.perfumeName}</h2><p>{request.requestNumber} · {creation.customer.name}</p>{badge(request.status)}</header>
    {error && <p className="hoa-inline-error">{error}</p>}
    <dl className="hoa-detail-facts"><div><dt>Artisan ID</dt><dd>{creation.customer.artisanId}</dd></div><div><dt>Mode</dt><dd>{request.creationMode === "described" ? "Describe Your Creation" : "Artisan Bench"}</dd></div><div><dt>Package</dt><dd>{request.packageSnapshot?.name ?? "Not selected"}</dd></div><div><dt>Fixed price</dt><dd>{request.packageSnapshot ? money(request.packageSnapshot.price, request.packageSnapshot.currency) : "—"}</dd></div><div><dt>Perfumer</dt><dd>{creation.reviewerName}</dd></div><div><dt>Updated</dt><dd>{date(request.lastUpdatedAt)}</dd></div></dl>
    <section><h3>Brief & Story</h3><p>{request.fragranceBrief || snapshot?.writtenStory || "No written story supplied."}</p></section>
    <section><h3>Formula</h3>{snapshot?.formulaMaterials.length ? <div className="hoa-token-list">{snapshot.formulaMaterials.map(item => <span key={`${item.materialId}-${item.layer}`}>{item.layer ?? "note"}: {item.materialName} {item.percentage}%</span>)}</div> : <p>Formula will be interpreted by the perfumer.</p>}</section>
    <section><h3>Customer Notes</h3><p>{request.customerNotes || snapshot?.additionalNotes || "None"}</p><div className="hoa-token-list">{(snapshot?.notesToAvoid ?? []).map(item => <span key={item}>Avoid: {item}</span>)}</div></section>
    <section><h3>Recent Conversation</h3>{detail?.messages.slice(-3).map(message => <article className="hoa-message" key={message.id}><strong>{message.senderName}</strong><small>{date(message.createdAt)}</small><p>{message.message}</p></article>) ?? <p>Loading conversation…</p>}</section>
    <section><h3>Activity</h3>{detail?.activity.slice(-5).reverse().map(item => <p className="hoa-activity-line" key={item.id}><span>✓</span>{item.label}<small>{date(item.createdAt)}</small></p>)}</section>
    {action && <button className="hoa-primary" disabled={busy} onClick={() => void run()}>{busy ? "Updating…" : action[1]} <b>→</b></button>}
  </aside></div>;
}

export function AdminCreationsPage() {
  const { snapshot, loading, error, refresh } = useOutletContext<AdminOutletContext>();
  const query = new URLSearchParams(location.search);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(query.get("status") ?? "ALL");
  const [packageId, setPackageId] = useState("ALL");
  const [reviewer, setReviewer] = useState("ALL");
  const [selectedId, setSelectedId] = useState(query.get("open") ?? "");
  const [assigningId, setAssigningId] = useState("");
  const [assignmentError, setAssignmentError] = useState("");
  const creationStatuses = ["SUBMITTED", "UNDER_REVIEW", "CONSULTATION", "READY_FOR_PAYMENT"];
  const creations = (snapshot?.creations ?? []).filter(item => creationStatuses.includes(item.request.status));
  const packages = [...new Map(creations.filter(item => item.request.packageSnapshot).map(item => [item.request.packageSnapshot!.id, item.request.packageSnapshot!.name])).entries()];
  const filtered = useMemo(() => creations.filter(item => {
    const haystack = `${item.request.perfumeName} ${item.request.requestNumber} ${item.customer.name} ${item.customer.artisanId}`.toLowerCase();
    return (!search || haystack.includes(search.toLowerCase())) && (status === "ALL" || item.request.status === status) && (packageId === "ALL" || item.request.selectedPackageId === packageId) && (reviewer === "ALL" || item.request.assignedReviewerId === reviewer);
  }), [creations, search, status, packageId, reviewer]);
  const selected = creations.find(item => item.request.id === selectedId);
  const assignPerfumer = async (requestId: string, reviewerId: string) => {
    setAssigningId(requestId); setAssignmentError("");
    try { await staffService.assign(requestId, reviewerId || null); await refresh(); }
    catch (cause) { setAssignmentError(cause instanceof Error ? cause.message : "Perfumer assignment could not be updated."); }
    finally { setAssigningId(""); }
  };
  return <div className="hoa-admin-page"><PageHeader eyebrow="Operations" title="Creations" copy="Review and manage customer creations before payment."/>
    {!snapshot ? <Loading loading={loading} error={error}/> : <><section className="hoa-filter-bar"><input aria-label="Search creations" placeholder="Search creation, customer, or number…" value={search} onChange={e => setSearch(e.target.value)}/><label>Status<select value={status} onChange={e => setStatus(e.target.value)}><option value="ALL">All statuses</option>{["SUBMITTED", "UNDER_REVIEW", "CONSULTATION", "READY_FOR_PAYMENT"].map(item => <option key={item}>{item}</option>)}</select></label><label>Package<select value={packageId} onChange={e => setPackageId(e.target.value)}><option value="ALL">All packages</option>{packages.map(([id, name]) => <option value={id} key={id}>{name}</option>)}</select></label><label>Perfumer<select value={reviewer} onChange={e => setReviewer(e.target.value)}><option value="ALL">All perfumers</option>{snapshot.reviewers.map(item => <option value={item.userId} key={item.userId}>{item.displayName}</option>)}</select></label></section>
    {assignmentError && <p className="hoa-inline-error" role="alert">{assignmentError}</p>}
    <section className="hoa-data-card"><table><thead><tr><th>Creation</th><th>Customer</th><th>Package</th><th>Perfumer</th><th>Status</th><th>Updated</th><th/></tr></thead><tbody>{filtered.map(item => <tr key={item.request.id}><td><strong>{item.request.perfumeName}</strong><small>{item.request.requestNumber}</small></td><td><strong>{item.customer.name}</strong><small>{item.customer.artisanId}</small></td><td>{item.request.packageSnapshot?.name ?? "—"}</td><td><select className="hoa-perfumer-select" aria-label={`Assign perfumer to ${item.request.perfumeName}`} disabled={assigningId === item.request.id} value={item.request.assignedReviewerId ?? ""} onChange={event => void assignPerfumer(item.request.id, event.target.value)}><option value="">Unassigned</option>{snapshot.reviewers.map(perfumer => <option value={perfumer.userId} key={perfumer.userId}>{perfumer.displayName}</option>)}</select></td><td>{badge(item.request.status)}</td><td>{date(item.request.lastUpdatedAt)}</td><td><button onClick={() => setSelectedId(item.request.id)}>Details</button></td></tr>)}</tbody></table>{!filtered.length && <p className="empty-copy">No creations match these filters.</p>}</section></>}
    {selected && <CreationDrawer creation={selected} onClose={() => setSelectedId("")} onChanged={refresh}/>} 
  </div>;
}

function OrderDrawer({ order, onClose, onChanged }: { order: AdminOrder; onClose: () => void; onChanged: () => Promise<void> }) {
  const detail = order.checkoutDetails;
  const address = [detail.address, detail.city, detail.region, detail.postalCode, detail.country].filter(Boolean).join(", ");
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const runAction = async (stage: "START_PRODUCTION" | "MARK_SHIPPED" | "MARK_DELIVERED") => {
    setBusy(true); setActionError("");
    try { await adminDashboardService.transitionOrder(order.id, stage, tracking); await onChanged(); }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : "Order status could not be updated."); }
    finally { setBusy(false); }
  };
  return <div className="hoa-drawer-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><aside className="hoa-detail-drawer order"><button className="hoa-drawer-close" onClick={onClose}>×</button><header><span>Order Detail</span><h2>{order.orderNumber}</h2><p>{order.customer.name} · {order.customer.artisanId}</p>{badge(order.productionStatus)}</header>
    <dl className="hoa-detail-facts"><div><dt>Payment</dt><dd>{statusLabel(order.paymentStatus)}</dd></div><div><dt>Paid on</dt><dd>{date(order.paidAt)}</dd></div><div><dt>Total</dt><dd>{money(order.amount, order.currency)}</dd></div><div><dt>Overall status</dt><dd>{statusLabel(order.productionStatus)}</dd></div><div><dt>Shipping</dt><dd>{statusLabel(order.shippingStatus)}</dd></div><div><dt>Updated</dt><dd>{date(order.updatedAt)}</dd></div></dl>
    <section><h3>Delivery</h3><p><strong>{String(detail.recipient ?? order.customer.name)}</strong><br/>{address || "Address not recorded."}<br/>{String(detail.phone ?? "")}</p><p>Preference: {statusLabel(order.shippingPreference)}<br/>Courier / tracking: {order.trackingNumber || "Not assigned"}</p></section>
    <section><h3>Creations in this order</h3>{order.items.map((item, index) => <article className="hoa-order-item" key={item.id}><b>{index + 1}</b><div><strong>{item.creationName}</strong><small>{money(item.amount, item.currency)}</small></div><span>{statusLabel(item.productionStatus)}<small>{statusLabel(item.shippingStatus)}</small></span></article>)}</section>
    <section className="hoa-order-actions"><h3>Fulfillment Action</h3>{actionError && <p className="hoa-inline-error" role="alert">{actionError}</p>}
      {order.paymentStatus !== "paid" && <p>Payment must be confirmed before production can begin.</p>}
      {order.paymentStatus === "paid" && order.productionStatus === "not_started" && <button className="hoa-primary" disabled={busy} onClick={() => void runAction("START_PRODUCTION")}>Start Production <b>→</b></button>}
      {order.productionStatus === "in_production" && <><label>Courier tracking number<input value={tracking} onChange={event => setTracking(event.target.value)} placeholder="Enter tracking number"/></label><button className="hoa-primary" disabled={busy || !tracking.trim()} onClick={() => void runAction("MARK_SHIPPED")}>Mark as Shipped <b>→</b></button></>}
      {order.shippingStatus === "shipped" && <button className="hoa-primary" disabled={busy} onClick={() => void runAction("MARK_DELIVERED")}>Confirm Delivered <b>✓</b></button>}
      {order.shippingStatus === "delivered" && <p className="hoa-order-complete">✓ This order has been delivered. Customer aftercare is now available.</p>}
    </section>
  </aside></div>;
}

export function AdminOrdersPage() {
  const { snapshot, loading, error, refresh } = useOutletContext<AdminOutletContext>();
  const query = new URLSearchParams(location.search);
  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState("ALL");
  const [status, setStatus] = useState(query.get("status") ?? "ALL");
  const [selectedId, setSelectedId] = useState(query.get("open") ?? "");
  const orders = snapshot?.orders ?? [];
  const filtered = useMemo(() => orders.filter(order => {
    const haystack = `${order.orderNumber} ${order.customer.name} ${order.customer.artisanId} ${order.items.map(item => item.creationName).join(" ")}`.toLowerCase();
    return (!search || haystack.includes(search.toLowerCase())) && (payment === "ALL" || order.paymentStatus === payment) && (status === "ALL" || order.productionStatus === status || order.shippingStatus === status);
  }), [orders, search, payment, status]);
  const selected = orders.find(order => order.id === selectedId);
  return <div className="hoa-admin-page"><PageHeader eyebrow="Commerce" title="Orders" copy="Track paid commissions, production, and delivery without changing the customer workflow."/>
    {!snapshot ? <Loading loading={loading} error={error}/> : <><section className="hoa-filter-bar orders"><input aria-label="Search orders" placeholder="Search order, customer, or creation…" value={search} onChange={e => setSearch(e.target.value)}/><label>Payment<select value={payment} onChange={e => setPayment(e.target.value)}><option value="ALL">All payments</option>{[...new Set(orders.map(item => item.paymentStatus))].map(item => <option key={item}>{item}</option>)}</select></label><label>Order status<select value={status} onChange={e => setStatus(e.target.value)}><option value="ALL">All statuses</option>{["not_started", "in_production", "completed", "not_shipped", "shipped", "delivered"].map(item => <option key={item}>{item}</option>)}</select></label></section>
    <section className="hoa-data-card"><table><thead><tr><th>Order</th><th>Customer</th><th>Creations</th><th>Total</th><th>Payment</th><th>Order status</th><th>Updated</th><th/></tr></thead><tbody>{filtered.map(order => <tr key={order.id}><td><strong>{order.orderNumber}</strong><small>{date(order.createdAt)}</small></td><td><strong>{order.customer.name}</strong><small>{order.customer.artisanId}</small></td><td>{order.items.length}</td><td>{money(order.amount, order.currency)}</td><td>{badge(order.paymentStatus)}</td><td>{badge(order.shippingStatus !== "not_shipped" ? order.shippingStatus : order.productionStatus)}</td><td>{date(order.updatedAt)}</td><td><button onClick={() => setSelectedId(order.id)}>Details</button></td></tr>)}</tbody></table>{!filtered.length && <p className="empty-copy">No orders match these filters.</p>}</section></>}
    {selected && <OrderDrawer order={selected} onClose={() => setSelectedId("")} onChanged={refresh}/>} 
  </div>;
}
