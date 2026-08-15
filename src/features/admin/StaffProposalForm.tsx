import { useState } from "react";
import type { ReviewRequest } from "../orders/types";
import type { ArtisanProposalInput } from "./staffService";

type Props = { request: ReviewRequest; busy: boolean; onSubmit: (proposal: ArtisanProposalInput) => void; variant?: "admin" | "perfumer" };

export default function StaffProposalForm({ request, busy, onSubmit, variant = "admin" }: Props) {
  const [summary, setSummary] = useState(request.artisanReview?.summary ?? "");
  const [direction, setDirection] = useState(request.artisanReview?.olfactiveDirection ?? "");
  const [drydown, setDrydown] = useState(request.artisanReview?.drydown ?? "");
  const [production, setProduction] = useState(request.estimatedProduction ?? request.packageSnapshot?.estimatedProduction ?? "");
  const [adjustments, setAdjustments] = useState(request.recommendedAdjustments.join(", "));
  const updated = request.status === "REVISION_REQUESTED";
  return <section className={`admin-panel admin-proposal${variant === "perfumer" ? " perfumer-proposal-document" : ""}`}>
    <header><span>Perfumer Proposal</span><h2>{updated ? "Refine the proposal" : "Prepare the fragrance direction"}</h2><p>Use the customer brief and consultation above as your source. This editable proposal is what the customer will approve.</p></header>
    <form onSubmit={event => { event.preventDefault(); onSubmit({ summary, olfactiveDirection: direction, drydown, finalPrice: request.packageSnapshot?.price ?? request.finalPrice ?? 0, estimatedProduction: production, revisionsIncluded: request.packageSnapshot?.consultationsIncluded ?? request.revisionsIncluded ?? 0, recommendedAdjustments: adjustments.split(",").map(item => item.trim()).filter(Boolean), includedItems: request.packageSnapshot?.includedItems ?? request.includedItems }); }}>
      <label className="proposal-field proposal-field--wide"><span>Proposal summary</span><small>Describe the finished direction in clear customer-facing language.</small><textarea required value={summary} onChange={event => setSummary(event.target.value)}/></label>
      <label className="proposal-field"><span>Olfactive direction</span><small>The central scent character and interpretation.</small><textarea required value={direction} onChange={event => setDirection(event.target.value)}/></label>
      <label className="proposal-field"><span>Drydown</span><small>How the fragrance settles and develops.</small><textarea required value={drydown} onChange={event => setDrydown(event.target.value)}/></label>
      <label className="proposal-field"><span>Production estimate</span><input required value={production} onChange={event => setProduction(event.target.value)}/></label>
      <label className="proposal-field"><span>Recommended refinements</span><small>Separate multiple refinements with commas.</small><input value={adjustments} onChange={event => setAdjustments(event.target.value)}/></label>
      <button disabled={busy}>{busy ? "Publishing…" : updated ? "Publish Updated Proposal" : "Send Proposal for Approval"}</button>
    </form>
  </section>;
}
