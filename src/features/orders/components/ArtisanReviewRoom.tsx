import type { RequestActivity, RequestMessage, ReviewRequest } from "../types";
import { ActivityPanel, ChatPanel, formatDate, money } from "./OrderComponents";
import "../../../styles/customer-proposal-awaiting.css";

type ArtisanReviewRoomProps = {
  request: ReviewRequest;
  messages: RequestMessage[];
  activity: RequestActivity[];
  busy: boolean;
  onCancel: () => void;
};

const phaseStatuses = {
  SUBMITTED: {
    eyebrow: "Submission Received",
    title: "Your creation is safely inside The Hall.",
    text: "Your story, formula, and preferences are recorded. An artisan will open the review before beginning the interpretation.",
    next: "The next update will confirm that artisan review has begun."
  },
  UNDER_REVIEW: {
    eyebrow: "Artisan Review in Progress",
    title: "An artisan is studying your creation.",
    text: "The atmosphere, materials, structure, and details you shared are being translated into an olfactive direction.",
    next: "When the internal review is complete, your private consultation will open."
  },
  CONSULTATION: {
    eyebrow: "Private Consultation",
    title: "Shape the final direction with your artisan.",
    text: "Use the conversation below to answer questions and refine the creation before production.",
    next: "When the direction is complete, your perfumer will send a proposal for your approval."
  }
} as const;

const roomPhases = ["Artisan Review", "Consultation", "Payment & Creation", "Delivery"];

function SubmissionSummary({ request }: { request: ReviewRequest }) {
  const snapshot = request.submissionSnapshot ?? request.previewSnapshot;
  const described = request.creationMode === "described";
  const directions = snapshot?.moodOrDirection?.length ? snapshot.moodOrDirection : request.fragranceDirection;
  return <section className="review-room-panel review-submission">
    <header><p>Submitted Creation</p><h2>{request.perfumeName}</h2><span>{described ? "Describe Your Creation" : "Artisan Bench"} · {request.concentration}</span></header>
    <div className="review-submission-facts"><span><small>Request</small>{request.requestNumber}</span><span><small>Submitted</small>{formatDate(request.submittedAt)}</span><span><small>Region</small>{request.pricingRegion}</span></div>
    {directions.length > 0 && <div className="review-direction"><h3>Creative Direction</h3><div>{directions.map((item) => <span key={item}>{item}</span>)}</div></div>}
    <div className="review-brief"><h3>{described ? "Your Story" : "Fragrance Brief"}</h3><p>{request.fragranceBrief || "Your submitted creation is awaiting artisan interpretation."}</p></div>
    {request.customerNotes && <details><summary>Notes sent with this creation</summary><p>{request.customerNotes}</p></details>}
  </section>;
}

export default function ArtisanReviewRoom({ request, messages, activity, busy, onCancel }: ArtisanReviewRoomProps) {
  const status = phaseStatuses[request.status as keyof typeof phaseStatuses] ?? phaseStatuses.SUBMITTED;
  const consulting = request.status === "CONSULTATION";
  const scrollToConversation = () => document.querySelector<HTMLInputElement>(".review-conversation .od-compose input")?.scrollIntoView({ behavior: "smooth", block: "center" });

  return <>
    <nav className="project-room-phases" aria-label="Project phases">
      {roomPhases.map((phase, index) => <div className={index === 0 ? "active" : ""} key={phase}><i>{String(index + 1).padStart(2, "0")}</i><span>{phase}<small>{index === 0 ? "Current phase" : "Later"}</small></span></div>)}
    </nav>

    <section className={`review-room-status${consulting ? " needs-reply" : ""}`}>
      <div><p>{status.eyebrow}</p><h1>{status.title}</h1><span>{status.text}</span></div>
      <aside><small>What happens next</small><strong>{status.next}</strong>{consulting && <button type="button" onClick={scrollToConversation}>Open Consultation</button>}</aside>
    </section>

    <div className="review-room-layout">
      <main>
        <SubmissionSummary request={request} />
        <section className="review-room-panel review-conversation">
          <header><p>{consulting ? "Consultation Open" : "Project Conversation"}</p><h2>Letters with your artisan</h2><span>{consulting ? "Ask questions and refine the brief here before production." : "Conversation opens after the artisan completes the internal review."}</span></header>
          <ChatPanel requestId={request.id} status={request.status} messages={messages} />
        </section>
        {consulting && <section className="review-room-panel customer-proposal-awaiting" aria-labelledby="customer-proposal-title">
          <div className="customer-proposal-awaiting__status"><i aria-hidden="true">03</i><span>Waiting for perfumer</span></div>
          <div>
            <p>Perfumer Proposal</p>
            <h2 id="customer-proposal-title">Your proposal will appear here.</h2>
            <span>Your perfumer is preparing the final direction from your brief and consultation. Once sent, you can review it, approve it, or request an adjustment here.</span>
          </div>
        </section>}
      </main>

      <aside className="review-room-sidebar">
        <section className="review-room-panel review-progress"><p>Inside The Hall</p><h2>Project progress</h2><ol><li className="done"><i>✓</i><span>Creation received<small>Your submitted details and package are preserved.</small></span></li><li className={request.status === "UNDER_REVIEW" ? "active" : consulting ? "done" : ""}><i>{consulting ? "✓" : "02"}</i><span>Artisan review<small>Story, formula, and preferences are being studied.</small></span></li><li className={consulting ? "active" : ""}><i>03</i><span>Consultation<small>Customer and artisan confirm the complete direction.</small></span></li></ol></section>

        <section className="review-room-panel review-budget"><p>Selected Package</p><h2>{request.packageSnapshot?.name || "Commission package"}</h2><strong>{money(request.finalPrice, request.currency)}</strong><span>{request.concentration} · {request.bottleSize}. Payment opens only after consultation is complete.</span></section>

        <section className="review-room-panel review-activity"><p>Project Activity</p><h2>Recorded updates</h2><ActivityPanel activity={activity} /></section>

        <section className="review-room-panel review-retention"><p>Thinking of Cancelling?</p><h2>Talk to us before closing the story.</h2><span>An artisan may already have reserved time for your creation. A question or adjustment can often preserve the idea without ending the project.</span><button type="button" onClick={scrollToConversation}>Ask or Request a Change</button><details><summary>I still need to cancel</summary><button type="button" disabled={busy} onClick={onCancel}>{busy ? "Closing..." : "Cancel This Project"}</button></details></section>
      </aside>
    </div>
  </>;
}
