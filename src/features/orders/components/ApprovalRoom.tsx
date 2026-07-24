import type { RequestActivity, RequestMessage, ReviewRequest } from "../types";
import { ActivityPanel, ChatPanel, formatDate, money } from "./OrderComponents";

type ApprovalRoomProps = {
  request: ReviewRequest;
  messages: RequestMessage[];
  activity: RequestActivity[];
  busy: boolean;
  onApprove: () => void;
  onRevision: () => void;
  onCancel: () => void;
};

const roomPhases = ["Artisan Review", "Your Approval", "Payment & Creation", "Delivery"];

export default function ApprovalRoom({ request, messages, activity, busy, onApprove, onRevision, onCancel }: ApprovalRoomProps) {
  const review = request.artisanReview;
  const price = request.finalPrice ? money(request.finalPrice, request.currency) : "Awaiting final price";
  const directions = request.submissionSnapshot?.moodOrDirection?.length
    ? request.submissionSnapshot.moodOrDirection
    : request.fragranceDirection;

  return <>
    <nav className="project-room-phases approval-phases" aria-label="Project phases">
      {roomPhases.map((phase, index) => <div className={index === 0 ? "complete" : index === 1 ? "active" : ""} key={phase}><i>{index === 0 ? "✓" : String(index + 1).padStart(2, "0")}</i><span>{phase}<small>{index === 0 ? "Complete" : index === 1 ? "Current phase" : "Later"}</small></span></div>)}
    </nav>

    <section className="approval-hero">
      <div><p>Artisan Proposal Ready</p><h1>Your creation is ready for your decision.</h1><span>Read the interpretation carefully. Nothing is charged until you approve the proposal and continue to checkout.</span></div>
      <aside><small>Decision required</small><strong>Approve the direction or request a revision.</strong><span>{request.revisionsIncluded ?? 1} revision{(request.revisionsIncluded ?? 1) === 1 ? "" : "s"} included</span></aside>
    </section>

    <div className="approval-layout">
      <main>
        <section className="approval-panel approval-interpretation">
          <header><p>Artisan Interpretation</p><h2>{request.perfumeName}</h2><span>Prepared from your submitted creation · Reviewed {formatDate(request.reviewedAt)}</span></header>
          <div className="approval-review-lead"><i>IA</i><blockquote>{review?.summary || "The artisan interpretation is being prepared for your approval."}</blockquote></div>
          <dl><div><dt>Olfactive Direction</dt><dd>{review?.olfactiveDirection || directions.join(" · ") || "To be interpreted"}</dd></div><div><dt>Drydown</dt><dd>{review?.drydown || "The final drydown direction will be recorded by the artisan."}</dd></div></dl>
          {directions.length > 0 && <div className="approval-tags">{directions.map((item) => <span key={item}>{item}</span>)}</div>}
        </section>

        <section className="approval-panel approval-details">
          <div><p>Recommended Adjustments</p><h2>How the idea will be refined</h2>{request.recommendedAdjustments.length ? <ul>{request.recommendedAdjustments.map((item) => <li key={item}><i>✓</i>{item}</li>)}</ul> : <span className="approval-empty">No additional adjustments were proposed.</span>}</div>
          <div><p>Commission Includes</p><h2>What you will receive</h2>{request.includedItems.length ? <ul>{request.includedItems.map((item) => <li key={item}><i>✓</i>{item}</li>)}</ul> : <span className="approval-empty">The included items will appear with the final proposal.</span>}</div>
        </section>

        <section className="approval-panel approval-conversation">
          <header><p>Questions Before Approval</p><h2>Letters with your artisan</h2><span>Review earlier messages here. A revision request will return the project to Artisan Review.</span></header>
          <ChatPanel requestId={request.id} status={request.status} messages={messages} />
        </section>
      </main>

      <aside className="approval-sidebar">
        <section className="approval-panel approval-decision">
          <p>Your Decision</p><h2>{price}</h2><span className="approval-price-note">{request.finalPrice ? "Final proposed price" : `Estimated range ${money(request.estimatedPriceMin, request.currency)} – ${money(request.estimatedPriceMax, request.currency)}`}</span>
          <dl><div><dt>Concentration</dt><dd>{request.concentration}</dd></div><div><dt>Bottle</dt><dd>{request.bottleSize}</dd></div><div><dt>Production estimate</dt><dd>{request.estimatedProduction || "To be confirmed"}</dd></div><div><dt>Payment now</dt><dd>None</dd></div></dl>
          <button className="approval-approve" type="button" disabled={busy || !request.finalPrice} onClick={onApprove}>{busy ? "Processing..." : "Approve & Continue"}<span>→</span></button>
          {!request.finalPrice && <small className="approval-blocked">Approval unlocks after the artisan records a final price.</small>}
          <button className="approval-revise" type="button" disabled={busy} onClick={onRevision}>Request a Revision</button>
          <small>Approval does not charge you. Checkout is the next separate step.</small>
        </section>

        <section className="approval-panel approval-next"><p>After Approval</p><h2>What happens next?</h2><ol><li><i>01</i><span>Proposal is locked<small>Your approved version is preserved.</small></span></li><li><i>02</i><span>Checkout opens<small>Confirm delivery and payment details.</small></span></li><li><i>03</i><span>Creation begins<small>Production starts only after payment confirmation.</small></span></li></ol></section>

        <section className="approval-panel approval-activity"><p>Project Activity</p><h2>Recorded updates</h2><ActivityPanel activity={activity} /></section>

        <section className="approval-panel approval-cancel"><details><summary>Considering cancellation?</summary><p>A revision is usually the better next step. It preserves the artisan's work and gives the idea another chance to become right.</p><button type="button" disabled={busy} onClick={onCancel}>Cancel This Project</button></details></section>
      </aside>
    </div>
  </>;
}
