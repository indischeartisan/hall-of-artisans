import { useNavigate } from "react-router";
import type { RequestActivity, ReviewRequest } from "../types";
import { ActivityPanel, formatDate } from "./OrderComponents";

export default function ClosedProjectRoom({ request, activity }: { request: ReviewRequest; activity: RequestActivity[] }) {
  const navigate = useNavigate();
  const snapshot = request.submissionSnapshot ?? request.previewSnapshot;
  return <>
    <section className="closed-project-hero">
      <div><p>Closed Project</p><h1>This creation is no longer active.</h1><span>The record is preserved for reference, but it cannot continue to artisan review, approval, checkout, or production.</span></div>
      <i aria-hidden="true">×</i>
    </section>
    <div className="closed-project-layout">
      <main className="closed-project-panel">
        <header><p>Preserved Record</p><h2>{request.perfumeName}</h2><span>{request.creationMode === "described" ? "Describe Your Creation" : "Artisan Bench"}</span></header>
        <dl><div><dt>Request number</dt><dd>{request.requestNumber}</dd></div><div><dt>Submitted</dt><dd>{formatDate(request.submittedAt)}</dd></div><div><dt>Closed / updated</dt><dd>{formatDate(request.lastUpdatedAt)}</dd></div><div><dt>Concentration</dt><dd>{request.concentration}</dd></div></dl>
        <section><h3>Creation summary</h3><p>{snapshot?.writtenStory || request.fragranceBrief || "No creation summary was recorded."}</p></section>
        {request.customerNotes&&<section><h3>Notes</h3><p>{request.customerNotes}</p></section>}
      </main>
      <aside>
        <section className="closed-project-panel closed-project-actions"><p>Begin Again</p><h2>Your previous record remains safe.</h2><span>Start a new creation whenever you are ready. It will receive its own draft and project record.</span><button type="button" onClick={()=>navigate("/chamber-of-creation")}>Start New Creation <b>→</b></button><button type="button" onClick={()=>navigate("/my-artisan-id")}>Return to My Artisan ID</button></section>
        <section className="closed-project-panel closed-project-activity"><p>Record Activity</p><h2>History</h2><ActivityPanel activity={activity}/></section>
      </aside>
    </div>
  </>;
}
