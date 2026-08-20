import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import CustomerAftercarePanel from "../../aftercare/CustomerAftercarePanel";
import { isChatAvailable } from "../../../domain/workflow";
import { getProjectRoomPresentation, type ProjectRoomAction, type SimplifiedProjectStatus } from "../projectRoomPresentation";
import type { Order, RequestActivity, RequestMessage, ReviewRequest } from "../types";
import { ActivityPanel, formatDate, money } from "./OrderComponents";
import { EnhancedChatPanel as ChatPanel } from "./EnhancedChatPanel";
import "../../../styles/customer-consultation-stack.css";

type SimplifiedProjectStateProps = {
  request: ReviewRequest & { status: SimplifiedProjectStatus };
  order: Order | null;
  messages: RequestMessage[];
  activity: RequestActivity[];
};

function ConversationDrawer({ request, messages, onClose }: Pick<SimplifiedProjectStateProps, "request" | "messages"> & { onClose: () => void }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeWithEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", closeWithEscape);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", closeWithEscape); };
  }, [onClose]);

  return <div className="simple-project-drawer" role="dialog" aria-modal="true" aria-labelledby="conversationTitle">
    <button className="simple-project-drawer__backdrop" type="button" aria-label="Close conversation" onClick={onClose}/>
    <section>
      <header><div><p>Private Conversation</p><h2 id="conversationTitle">Letters with your artisan</h2></div><button type="button" aria-label="Close conversation" autoFocus onClick={onClose}>×</button></header>
      <ChatPanel requestId={request.id} status={request.status} messages={messages}/>
    </section>
  </div>;
}

function OrderDetails({ request, order, activity }: Pick<SimplifiedProjectStateProps, "request" | "order" | "activity">) {
  const item = order?.items?.find((entry) => entry.reviewRequestId === request.id);
  const tracking = item?.trackingNumber || order?.trackingNumber;
  return <section className="simple-project-details" aria-label="Order and delivery details">
    <div><p>Order Details</p><h2>{order?.orderNumber || request.requestNumber}</h2><dl><div><dt>Package</dt><dd>{request.packageSnapshot?.name || "Bespoke commission"}</dd></div><div><dt>Price</dt><dd>{money(request.finalPrice, request.currency)}</dd></div><div><dt>Estimated crafting</dt><dd>{request.estimatedProduction || "To be confirmed"}</dd></div><div><dt>Payment</dt><dd>{order?.paymentStatus?.replaceAll("_", " ") || (request.status === "PAID" || request.status === "IN_PRODUCTION" || request.status === "SHIPPED" || request.status === "COMPLETED" ? "Paid" : "Pending")}</dd></div><div><dt>Production</dt><dd>{item?.productionStatus?.replaceAll("_", " ") || order?.productionStatus?.replaceAll("_", " ") || "Not recorded"}</dd></div><div><dt>Tracking number</dt><dd>{tracking || "Not available yet"}</dd></div></dl></div>
    <div><p>Recorded Updates</p><ActivityPanel activity={activity}/></div>
  </section>;
}

export default function SimplifiedProjectState({ request, order, messages, activity }: SimplifiedProjectStateProps) {
  const navigate = useNavigate();
  const [conversationOpen, setConversationOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const presentation = getProjectRoomPresentation(request.status);
  const latestArtisanMessage = messages.findLast((message) => message.senderRole === "artisan");
  const canOpenConversation = isChatAvailable(request.status);
  const runAction = (action: ProjectRoomAction | null) => {
    if (action === "conversation") {
      if (request.status === "CONSULTATION") document.querySelector(".customer-consultation-stack")?.scrollIntoView({ behavior: "smooth", block: "start" });
      else setConversationOpen(true);
    }
    if (action === "order-details") setDetailsOpen((current) => !current);
    if (action === "create-another") navigate("/chamber-of-creation");
  };

  return <>
    {request.status !== "CONSULTATION" ? <div className={`simple-project-state simple-status-${request.status.toLowerCase()}`}>
      <section className="simple-project-state__main">
        <p>{presentation.eyebrow}</p>
        <h2>{presentation.title}</h2>
        <span>{presentation.description}</span>
        {request.status === "UNDER_REVIEW" ? <div className="simple-project-state__artisan"><i aria-hidden="true">IA</i><span><strong>{latestArtisanMessage?.senderName || "The Hall artisan team"}</strong><small>{request.assignedReviewerId ? "Assigned artisan" : "Artisan review team"}</small></span></div> : null}
        {request.status === "CONSULTATION" && latestArtisanMessage ? <blockquote><p>{latestArtisanMessage.message}</p><cite>{latestArtisanMessage.senderName} · {formatDate(latestArtisanMessage.createdAt)}</cite></blockquote> : null}
        {presentation.primaryAction ? <button className="simple-project-state__primary" type="button" onClick={() => runAction(presentation.primaryAction)}>{presentation.primaryLabel}<span aria-hidden="true">→</span></button> : null}
        {canOpenConversation && presentation.primaryAction !== "conversation" ? <button className="simple-project-state__secondary" type="button" onClick={() => setConversationOpen(true)}>Open Messages</button> : null}
      </section>
      <aside>
        <p>Current Stage</p>
        <strong>{request.status === "UNDER_REVIEW" ? "Review" : request.status === "CONSULTATION" ? "Consultation" : request.status === "PAID" || request.status === "IN_PRODUCTION" ? "Crafting" : "Delivery"}</strong>
        <span>Last updated {formatDate(request.lastUpdatedAt)}</span>
        {request.status === "SHIPPED" ? <small>{order?.trackingNumber ? `Tracking: ${order.trackingNumber}` : "Tracking details will appear when provided by the courier."}</small> : null}
      </aside>
    </div> : null}
    {request.status === "CONSULTATION" ? <section className="customer-consultation-stack" aria-label="Consultation and proposal">
      <section className="review-room-panel review-conversation">
        <header><p>Private Consultation</p><h2>Letters with your artisan</h2><span>Continue the conversation here while your perfumer prepares the final direction.</span></header>
        <ChatPanel requestId={request.id} status={request.status} messages={messages}/>
      </section>
      <section className="review-room-panel customer-proposal-awaiting" aria-labelledby="simple-customer-proposal-title">
        <div className="customer-proposal-awaiting__status"><i aria-hidden="true">03</i><span>Waiting for perfumer</span></div>
        <div><p>Perfumer Proposal</p><h2 id="simple-customer-proposal-title">Your proposal will appear here.</h2><span>Your perfumer is preparing the final direction from your brief and consultation. Once sent, you can approve it or request an adjustment here.</span></div>
      </section>
    </section> : null}
    {detailsOpen ? <OrderDetails request={request} order={order} activity={activity}/> : null}
    {request.status === "COMPLETED" ? <CustomerAftercarePanel requestId={request.id}/> : null}
    {conversationOpen && request.status !== "CONSULTATION" ? <ConversationDrawer request={request} messages={messages} onClose={() => setConversationOpen(false)}/> : null}
  </>;
}
