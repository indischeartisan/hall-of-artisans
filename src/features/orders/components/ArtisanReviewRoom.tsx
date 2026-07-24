import type { RequestActivity, RequestMessage, ReviewRequest } from "../types";
import { ActivityPanel, ChatPanel, formatDate, money } from "./OrderComponents";

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
    next: "You will receive an interpretation, recommendations, estimated timing, and final price."
  },
  WAITING_FOR_REPLY: {
    eyebrow: "Your Reply Is Needed",
    title: "The artisan needs one detail from you.",
    text: "Open the conversation below and reply so the interpretation can continue without losing its direction.",
    next: "Review resumes after your message is received."
  },
  REVISION_REQUESTED: {
    eyebrow: "Revision Requested",
    title: "Your requested changes are recorded.",
    text: "The project remains inside the review room while an artisan prepares the next interpretation.",
    next: "The revised proposal will appear here when it is ready."
  }
} as const;

const roomPhases = ["Artisan Review", "Your Approval", "Payment & Creation", "Delivery"];

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
  const waiting = request.status === "WAITING_FOR_REPLY";
  const scrollToConversation = () => document.querySelector<HTMLInputElement>(".review-conversation .od-compose input")?.scrollIntoView({ behavior: "smooth", block: "center" });

  return <>
    <nav className="project-room-phases" aria-label="Project phases">
      {roomPhases.map((phase, index) => <div className={index === 0 ? "active" : ""} key={phase}><i>{String(index + 1).padStart(2, "0")}</i><span>{phase}<small>{index === 0 ? "Current phase" : "Later"}</small></span></div>)}
    </nav>

    <section className={`review-room-status${waiting ? " needs-reply" : ""}`}>
      <div><p>{status.eyebrow}</p><h1>{status.title}</h1><span>{status.text}</span></div>
      <aside><small>What happens next</small><strong>{status.next}</strong>{waiting && <button type="button" onClick={scrollToConversation}>Reply to Artisan</button>}</aside>
    </section>

    <div className="review-room-layout">
      <main>
        <SubmissionSummary request={request} />
        <section className="review-room-panel review-conversation">
          <header><p>Project Conversation</p><h2>Letters with your artisan</h2><span>All questions and updates for this creation stay together here.</span></header>
          <ChatPanel requestId={request.id} status={request.status} messages={messages} />
        </section>
      </main>

      <aside className="review-room-sidebar">
        <section className="review-room-panel review-progress"><p>Inside Artisan Review</p><h2>Review progress</h2><ol><li className="done"><i>✓</i><span>Creation received<small>Your submitted details are locked and preserved.</small></span></li><li className={request.status !== "SUBMITTED" ? "active" : ""}><i>02</i><span>Artisan interpretation<small>Story, formula, and preferences are being studied.</small></span></li><li><i>03</i><span>Proposal prepared<small>Recommendations, timing, and final price follow.</small></span></li></ol></section>

        <section className="review-room-panel review-budget"><p>Budget Guidance</p><h2>{money(request.estimatedPriceMin, request.currency)} – {money(request.estimatedPriceMax, request.currency)}</h2><span>This remains an estimate. No payment is requested until you review and approve the artisan proposal.</span></section>

        <section className="review-room-panel review-activity"><p>Project Activity</p><h2>Recorded updates</h2><ActivityPanel activity={activity} /></section>

        <section className="review-room-panel review-retention"><p>Thinking of Cancelling?</p><h2>Talk to us before closing the story.</h2><span>An artisan may already have reserved time for your creation. A question or adjustment can often preserve the idea without ending the project.</span><button type="button" onClick={scrollToConversation}>Ask or Request a Change</button><details><summary>I still need to cancel</summary><button type="button" disabled={busy} onClick={onCancel}>{busy ? "Closing..." : "Cancel This Project"}</button></details></section>
      </aside>
    </div>
  </>;
}
