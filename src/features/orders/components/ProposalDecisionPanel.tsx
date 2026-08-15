import { useEffect, useState } from "react";
import type { RequestActivity, RequestMessage, ReviewRequest } from "../types";
import { ChatPanel } from "./OrderComponents";

type Props = {
  request: ReviewRequest;
  messages: RequestMessage[];
  activity: RequestActivity[];
  busy: boolean;
  onApprove: () => void;
  onRevision: (note: string) => void;
};

export default function ProposalDecisionPanel({ request, messages, activity, busy, onApprove, onRevision }: Props) {
  const [showProposal, setShowProposal] = useState(false);
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [note, setNote] = useState("");
  const review = request.artisanReview;
  const directions = request.submissionSnapshot?.moodOrDirection?.length
    ? request.submissionSnapshot.moodOrDirection
    : request.fragranceDirection;
  const revisionsUsed = activity.filter(item => item.eventType === "revision_requested").length;
  const revisionsIncluded = request.revisionsIncluded ?? 0;
  const canRequestAdjustment = revisionsUsed < revisionsIncluded;

  useEffect(() => {
    if (!showAdjustment) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setShowAdjustment(false); };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", closeOnEscape); };
  }, [showAdjustment]);

  const consultation = <section className="proposal-consultation">
    <p>Private Consultation</p>
    <h2>Letters with your artisan</h2>
    <span>Your conversation and the perfumer&apos;s proposal now stay together in one Consultation stage.</span>
    <ChatPanel requestId={request.id} status={request.status} messages={messages}/>
  </section>;

  if (request.status === "REVISION_REQUESTED") return <>
    {consultation}
    <section className="proposal-state proposal-state--waiting">
      <p>Proposal Update</p>
      <h2>Your artisan is reviewing your adjustment.</h2>
      <span>The updated proposal will appear below this consultation when it is ready.</span>
    </section>
  </>;

  return <>{consultation}<section className="proposal-state">
    <p>Perfumer Proposal</p>
    <p>Your Creation Is Ready for Review</p>
    <h2>We&apos;ve prepared a fragrance direction for you.</h2>
    <span>Review the artisan&apos;s interpretation based on your brief and conversation.</span>

    <div className="proposal-state__summary">
      <small>Proposal Summary</small>
      {directions.length > 0 ? <div className="proposal-state__tags">{directions.slice(0, 6).map(item => <span key={item}>{item}</span>)}</div> : null}
      <blockquote>{review?.summary || review?.olfactiveDirection || "Your artisan proposal is ready for your decision."}</blockquote>
    </div>

    <div className="proposal-state__actions">
      <button type="button" disabled={busy} onClick={onApprove}>{busy ? "Saving…" : "Approve Creation"}</button>
      {canRequestAdjustment ? <button type="button" className="secondary" disabled={busy} onClick={() => setShowAdjustment(true)}>Request Adjustment</button> : null}
    </div>
    {!canRequestAdjustment ? <small className="proposal-state__limit">All included adjustments have been used. Message your artisan if you need help.</small> : null}
    <button type="button" className="proposal-state__details" onClick={() => setShowProposal(value => !value)}>{showProposal ? "Hide Full Proposal" : "View Full Proposal"}</button>

    {showProposal ? <div className="proposal-state__full">
      <dl>
        <div><dt>Olfactive direction</dt><dd>{review?.olfactiveDirection || "Recorded in the proposal"}</dd></div>
        <div><dt>Drydown</dt><dd>{review?.drydown || "Recorded in the proposal"}</dd></div>
        <div><dt>Adjustments included</dt><dd>{revisionsIncluded}</dd></div>
      </dl>
      {request.recommendedAdjustments.length ? <><h3>Artisan refinements</h3><ul>{request.recommendedAdjustments.map(item => <li key={item}>{item}</li>)}</ul></> : null}
    </div> : null}

    {showAdjustment ? <div className="proposal-adjustment" role="dialog" aria-modal="true" aria-labelledby="adjustmentTitle">
      <form onSubmit={event => { event.preventDefault(); if (note.trim()) onRevision(note.trim()); }}>
        <button type="button" className="proposal-adjustment__close" aria-label="Close adjustment request" onClick={() => setShowAdjustment(false)}>×</button>
        <p>Request Adjustment</p><h2 id="adjustmentTitle">What would you like refined?</h2>
        <textarea autoFocus maxLength={5000} required value={note} onChange={event => setNote(event.target.value)} placeholder="Describe the change in your own words…"/>
        <small>{revisionsIncluded - revisionsUsed} included adjustment{revisionsIncluded - revisionsUsed === 1 ? "" : "s"} remaining</small>
        <button type="submit" disabled={busy || !note.trim()}>{busy ? "Sending…" : "Send Adjustment Request"}</button>
      </form>
    </div> : null}
  </section></>;
}
