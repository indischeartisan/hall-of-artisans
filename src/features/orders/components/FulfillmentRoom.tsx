import type { Order, RequestActivity, RequestMessage, ReviewRequest } from "../types";
import { ActivityPanel, ChatPanel, formatDate, money } from "./OrderComponents";

type FulfillmentRoomProps = {
  request: ReviewRequest;
  order: Order | null;
  messages: RequestMessage[];
  activity: RequestActivity[];
  busy: boolean;
  onCheckout: () => void;
  onCancel: () => void;
};

const roomPhases = ["Artisan Review", "Your Approval", "Payment & Creation", "Delivery"];
const fulfillmentRank = { READY_FOR_CHECKOUT: 0, PAYMENT_PENDING: 1, PAID: 2, IN_PRODUCTION: 2, SHIPPED: 3, COMPLETED: 4 } as const;

const statusCopy = {
  READY_FOR_CHECKOUT: { eyebrow: "Proposal Approved", title: "Your commission is ready for checkout.", text: "Confirm delivery and payment details when you are ready. Production does not begin until payment is confirmed.", next: "Continue to checkout" },
  PAYMENT_PENDING: { eyebrow: "Checkout Created", title: "Your order is awaiting payment confirmation.", text: "Your approved creation and order details are preserved. Production remains paused until the payment provider confirms the transaction.", next: "Review checkout details" },
  PAID: { eyebrow: "Payment Confirmed", title: "Your commission is entering the atelier.", text: "Payment has been recorded. The production team will schedule formula preparation and update this room when work begins.", next: "Await production scheduling" },
  IN_PRODUCTION: { eyebrow: "Creation in Progress", title: "Your fragrance is being crafted.", text: "Formula development, maturation, finishing, and presentation are handled as one continuous atelier process.", next: "Follow production updates" },
  SHIPPED: { eyebrow: "Dispatched from The Hall", title: "Your creation is on its way.", text: "The finished commission has left the atelier. Shipment details remain available here until delivery is confirmed.", next: "Follow the shipment" },
  COMPLETED: { eyebrow: "Journey Complete", title: "Your creation has arrived.", text: "The commission is complete. Its final record remains preserved in your account and can later join your Hall Archive.", next: "Revisit your finished creation" }
} as const;

export default function FulfillmentRoom({ request, order, messages, activity, busy, onCheckout, onCancel }: FulfillmentRoomProps) {
  const status = statusCopy[request.status as keyof typeof statusCopy] ?? statusCopy.READY_FOR_CHECKOUT;
  const rank = fulfillmentRank[request.status as keyof typeof fulfillmentRank] ?? 0;
  const deliveryActive = rank >= 3;
  const item = order?.items?.find((entry) => entry.reviewRequestId === request.id);
  const tracking = item?.trackingNumber || order?.trackingNumber;
  const canCheckout = request.status === "READY_FOR_CHECKOUT" || request.status === "PAYMENT_PENDING";
  const canCancel = request.status === "READY_FOR_CHECKOUT";
  const steps = [
    ["Approval locked", "Your accepted artisan proposal is preserved."],
    ["Payment confirmation", "Checkout details and payment are confirmed."],
    ["Atelier production", "Formula, maturation, finishing, and presentation."],
    ["Dispatch", "The finished creation begins its journey to you."]
  ] as const;

  return <>
    <nav className="project-room-phases fulfillment-phases" aria-label="Project phases">
      {roomPhases.map((phase, index) => {
        const active = deliveryActive ? index === 3 : index === 2;
        const complete = deliveryActive ? index < 3 : index < 2;
        return <div className={active ? "active" : complete ? "complete" : ""} key={phase}><i>{complete ? "✓" : String(index + 1).padStart(2, "0")}</i><span>{phase}<small>{active ? "Current phase" : complete ? "Complete" : "Later"}</small></span></div>;
      })}
    </nav>

    <section className={`fulfillment-hero ${deliveryActive ? "delivery" : ""}`}>
      <div><p>{status.eyebrow}</p><h1>{status.title}</h1><span>{status.text}</span></div>
      <aside><small>Current focus</small><strong>{status.next}</strong>{canCheckout && <button type="button" disabled={busy} onClick={onCheckout}>{request.status === "READY_FOR_CHECKOUT" ? "Continue to Checkout" : "Open Checkout"}<span>→</span></button>}</aside>
    </section>

    <div className="fulfillment-layout">
      <main>
        <section className="fulfillment-panel fulfillment-commission">
          <header><p>Your Commission</p><h2>{request.perfumeName}</h2><span>{request.concentration} · {request.bottleSize} · {request.requestNumber}</span></header>
          <div className="fulfillment-commission-grid"><div><small>Approved price</small><strong>{money(request.finalPrice, request.currency)}</strong></div><div><small>Production estimate</small><strong>{request.estimatedProduction || "To be confirmed"}</strong></div><div><small>Order number</small><strong>{order?.orderNumber || "Created after checkout"}</strong></div></div>
          <div className="fulfillment-included"><h3>Commission details</h3>{request.includedItems.length ? <ul>{request.includedItems.map((entry) => <li key={entry}><i>✓</i>{entry}</li>)}</ul> : <p>Your approved artisan proposal and submitted creation are preserved with this project.</p>}</div>
        </section>

        <section className="fulfillment-panel fulfillment-conversation">
          <header><p>Project Conversation</p><h2>Letters with The Hall</h2><span>Questions about payment, production, or delivery remain attached to this commission.</span></header>
          <ChatPanel requestId={request.id} status={request.status} messages={messages} />
        </section>
      </main>

      <aside className="fulfillment-sidebar">
        <section className="fulfillment-panel fulfillment-progress"><p>{deliveryActive ? "Delivery Journey" : "Payment & Creation"}</p><h2>Commission progress</h2><ol>{steps.map(([label, description], index) => { const complete = rank > index; const active = rank === index; return <li className={complete ? "done" : active ? "active" : ""} key={label}><i>{complete ? "✓" : String(index + 1).padStart(2, "0")}</i><span>{label}<small>{description}</small></span></li>; })}</ol></section>

        <section className="fulfillment-panel fulfillment-order"><p>Order Record</p><h2>{order?.orderNumber || "Not created yet"}</h2><dl><div><dt>Payment</dt><dd>{order?.paymentStatus?.replaceAll("_", " ") || (request.status === "READY_FOR_CHECKOUT" ? "Not started" : "Pending")}</dd></div><div><dt>Production</dt><dd>{item?.productionStatus?.replaceAll("_", " ") || order?.productionStatus?.replaceAll("_", " ") || "Not started"}</dd></div><div><dt>Shipment</dt><dd>{item?.shippingStatus?.replaceAll("_", " ") || order?.shippingStatus?.replaceAll("_", " ") || "Not shipped"}</dd></div><div><dt>Last update</dt><dd>{formatDate(request.lastUpdatedAt)}</dd></div></dl></section>

        {deliveryActive && <section className="fulfillment-panel fulfillment-shipment"><p>Shipment</p><h2>{request.status === "COMPLETED" ? "Delivered" : "On its way"}</h2><dl><dt>Tracking number</dt><dd>{tracking || "Will appear when provided by the courier"}</dd></dl><span>Keep this Project Room as your single reference until the delivery is complete.</span></section>}

        <section className="fulfillment-panel fulfillment-activity"><p>Project Activity</p><h2>Recorded updates</h2><ActivityPanel activity={activity} /></section>

        {canCancel && <section className="fulfillment-panel fulfillment-cancel"><details><summary>Need to stop before checkout?</summary><p>No payment has been made yet. Consider returning to the artisan conversation before closing the approved project.</p><button type="button" disabled={busy} onClick={onCancel}>Cancel This Project</button></details></section>}
      </aside>
    </div>
  </>;
}
