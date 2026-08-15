import { useEffect, useState, type ReactNode } from "react";
import { WORKFLOW } from "../../../domain/workflow";
import { CUSTOMER_JOURNEY_STAGES, getCustomerJourneyStageIndex } from "../customerJourney";
import type { ReviewRequest } from "../types";
import { CreationIdentity } from "./OrderComponents";
import CreationPreparation from "./CreationPreparation";

type ProjectRoomShellProps = {
  request: ReviewRequest;
  includeDemo?: boolean;
  error?: string;
  children: ReactNode;
};

function ProjectRoomHeader({ request, includeDemo }: Pick<ProjectRoomShellProps, "request" | "includeDemo">) {
  const status = WORKFLOW[request.status];
  return <header className="customer-project-room__header">
    <CreationIdentity request={request} includeDemo={includeDemo}/>
    <div className="customer-project-room__header-copy">
      <p>Project Room</p>
      <h1>{request.perfumeName}</h1>
      <span>Creation {request.requestNumber}</span>
      <strong className={request.status === "CANCELLED" ? "is-closed" : ""}>{status?.label ?? "In preparation"}</strong>
    </div>
    <div className="customer-project-room__art" aria-hidden="true">
      <img src="/assets/images/atelier-icon-bottles.webp" alt="" />
    </div>
  </header>;
}

function CustomerJourneyProgress({ request }: { request: ReviewRequest }) {
  const currentIndex = getCustomerJourneyStageIndex(request.status);
  const delivered = request.status === "COMPLETED";
  const closed = request.status === "CANCELLED";
  return <nav className={`customer-journey${closed ? " is-closed" : ""}`} aria-label={closed ? "Closed project journey" : "Creation journey"}>
    {CUSTOMER_JOURNEY_STAGES.map((stage, index) => {
      const complete = delivered || (!closed && currentIndex > index);
      const current = !closed && !delivered && currentIndex === index;
      return <div className={complete ? "is-complete" : current ? "is-current" : ""} aria-current={current ? "step" : undefined} key={stage.key}>
        <i aria-hidden="true">{complete ? "✓" : index + 1}</i>
        <span className="customer-journey__full-label">{stage.label}</span>
        <span className="customer-journey__compact-label">{stage.compactLabel}</span>
      </div>;
    })}
  </nav>;
}

function CreationSummary({ request }: { request: ReviewRequest }) {
  const [briefOpen, setBriefOpen] = useState(false);
  const snapshot = request.submissionSnapshot ?? request.previewSnapshot;
  const directions = snapshot?.moodOrDirection?.length ? snapshot.moodOrDirection : request.fragranceDirection;
  const summary = request.artisanReview?.olfactiveDirection || request.fragranceBrief || snapshot?.writtenStory || "Your creation brief is being prepared.";
  useEffect(() => {
    if (!briefOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setBriefOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [briefOpen]);

  return <><aside className="customer-creation-summary" aria-labelledby="creationSummaryTitle">
    <div>
      <p>Your Creation</p>
      <h2 id="creationSummaryTitle">{request.perfumeName}</h2>
      {directions.length > 0 ? <div className="customer-creation-summary__tags">{directions.slice(0, 4).map((item) => <span key={item}>{item}</span>)}</div> : null}
      <span className="customer-creation-summary__description">{summary}</span>
    </div>
    <button className="customer-creation-summary__brief-button" type="button" aria-haspopup="dialog" onClick={() => setBriefOpen(true)}>View Brief</button>
  </aside>
  {briefOpen ? <div className="brief-review-modal" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setBriefOpen(false); }}>
    <section className="brief-review-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="briefReviewTitle">
      <button className="brief-review-modal__close" type="button" aria-label="Close brief" onClick={() => setBriefOpen(false)}>&times;</button>
      <span className="brief-review-modal__title" id="briefReviewTitle">Creation Brief</span>
      <CreationPreparation request={request} busy={false} packages={[]} selectedPackageId={null} onEdit={() => undefined} onSelectPackage={() => undefined} onSubmit={() => undefined}/>
    </section>
  </div> : null}</>;
}

export default function ProjectRoomShell({ request, includeDemo=false, error, children }: ProjectRoomShellProps) {
  useEffect(() => {
    if (import.meta.env.DEV && !WORKFLOW[request.status]) console.warn(`[Project Room] Unknown workflow status: ${request.status}`);
  }, [request.status]);

  const isPreview = request.status === "DRAFT_PREVIEW";
  return <main className={`customer-project-room${isPreview ? " is-creation-preview" : ""}`}>
    <ProjectRoomHeader request={request} includeDemo={includeDemo}/>
    <CustomerJourneyProgress request={request}/>
    {error ? <p className="od-action-error" role="alert">{error}</p> : null}
    {!isPreview ? <CreationSummary request={request}/> : null}
    <section className="customer-project-room__current" aria-label="Current project status">{children}</section>
  </main>;
}
