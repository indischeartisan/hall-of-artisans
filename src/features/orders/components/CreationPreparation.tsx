import type { CommissionPackage, ReviewRequest } from "../types";

type CreationPreparationProps = {
  request: ReviewRequest;
  busy: boolean;
  packages: CommissionPackage[];
  selectedPackageId: string | null;
  onEdit: () => void;
  onSelectPackage: (packageId: string) => void;
  onSubmit: () => void;
};

const money = (amount: number, currency: string) => currency === "IDR"
  ? `Rp${amount.toLocaleString("id-ID")}`
  : new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

const journey = [
  { number: "01", title: "Artisan Review", text: "An artisan studies your story, formula, preferences, and creative direction." },
  { number: "02", title: "Consultation", text: "You and the artisan clarify the creation together in one private conversation." },
  { number: "03", title: "Payment & Creation", text: "When the artisan confirms readiness, payment unlocks production." },
  { number: "04", title: "Delivery", text: "Progress and shipment are recorded here until your creation reaches you." }
];

function Tags({ values, empty }: { values: string[]; empty: string }) {
  return values.length
    ? <div className="prep-tags">{values.map((value) => <span key={value}>{value}</span>)}</div>
    : <p className="prep-empty-value">{empty}</p>;
}

export default function CreationPreparation({ request, busy, packages, selectedPackageId, onEdit, onSelectPackage, onSubmit }: CreationPreparationProps) {
  const snapshot = request.previewSnapshot;
  const described = request.creationMode === "described";
  const formula = snapshot?.formulaMaterials ?? [];
  const formulaTotal = snapshot?.formulaMetadata?.total ?? formula.reduce((sum, material) => sum + material.percentage, 0);
  const story = snapshot?.writtenStory || request.fragranceBrief;
  const preferredNotes = snapshot?.preferredNotes ?? request.fragranceDirection;
  const notesToAvoid = snapshot?.notesToAvoid ?? [];
  const additionalNotes = snapshot?.additionalNotes || request.customerNotes;
  const readiness = described ? [
    ["Creation title", Boolean(snapshot?.title?.trim() || request.perfumeName.trim())],
    ["Your story", Boolean(story.trim())],
    ["Preferences reviewed", preferredNotes.length > 0 || notesToAvoid.length > 0],
    ["Private draft linked", Boolean(snapshot?.sourceDraftId)]
  ] as const : [
    ["Perfume name", Boolean(snapshot?.perfumeName?.trim() || request.perfumeName.trim())],
    ["Formula materials", formula.length > 0],
    ["Formula balance", formulaTotal === 100],
    ["Private draft linked", Boolean(snapshot?.sourceDraftId)]
  ] as const;

  return <>
    <section className="prep-notice" aria-label="Preview status">
      <span>Private preparation</span>
      <div><strong>Your creation has not been sent yet.</strong><p>Review everything at your own pace. Sending for review does not charge you.</p></div>
    </section>

    <div className="prep-layout">
      <section className="prep-panel prep-creation">
        <header><p>{described ? "Story Creation" : "Artisan Bench"}</p><h2>Your Creation Preview</h2><span>{described ? "Created from Describe Your Creation" : "Composed at the Artisan Bench"}</span></header>
        {described ? <div className="prep-story">
          <section><h3>Your Story</h3><p>{story || "No story has been recorded yet."}</p></section>
          <div className="prep-two-column"><section><h3>Preferred Notes</h3><Tags values={preferredNotes} empty="No preferred notes recorded." /></section><section><h3>Notes to Avoid</h3><Tags values={notesToAvoid} empty="No notes to avoid recorded." /></section></div>
          {additionalNotes && <section><h3>Additional Notes</h3><p>{additionalNotes}</p></section>}
        </div> : <div className="prep-formula">
          <div className="prep-formula-overview"><div><small>Concentration</small><strong>{snapshot?.concentration || request.concentration}</strong></div><div><small>Formula Balance</small><strong>{formulaTotal}%</strong></div><div><small>Materials</small><strong>{formula.length}</strong></div></div>
          <div className="prep-formula-layers">{(["top", "heart", "base"] as const).map((layer) => <section key={layer}><h3>{layer} notes</h3>{formula.filter((material) => material.layer === layer).length ? formula.filter((material) => material.layer === layer).map((material) => <p key={`${layer}-${material.materialId}`}><span>{material.materialName}</span><b>{material.percentage}%</b></p>) : <p className="prep-empty-value">No {layer} notes selected.</p>}</section>)}</div>
          {story && <section className="prep-bench-brief"><h3>Creative Brief</h3><p>{story}</p></section>}
        </div>}
      </section>

      <aside className="prep-sidebar">
        <section className="prep-panel prep-ready"><p className="prep-kicker">Before You Send</p><h2>Ready for Artisan Review?</h2><ul>{readiness.map(([label, complete]) => <li className={complete ? "is-ready" : "needs-review"} key={label}><i>{complete ? "✓" : "○"}</i><span>{label}<small>{complete ? "Ready" : "Review before sending"}</small></span></li>)}</ul><button className="prep-edit" type="button" onClick={onEdit}>Edit Your Draft</button><button className="prep-submit" type="button" disabled={busy || !selectedPackageId} onClick={onSubmit}>{busy ? "Sending..." : selectedPackageId ? "Send for Review" : "Choose a Package First"}<span>→</span></button><small className="prep-no-charge">No payment is collected at this stage.</small></section>

        <section className="prep-panel prep-packages"><p className="prep-kicker">Choose Your Package</p><h2>One exact price before review.</h2><p>Select the commission that fits your journey. The price is locked when you submit.</p><div>{packages.map(item => <button type="button" className={selectedPackageId === item.id ? "selected" : ""} disabled={busy} onClick={() => onSelectPackage(item.id)} key={item.id}><span><strong>{item.name}</strong><small>{item.concentration} · {item.bottleSize}</small></span><b>{money(item.price, item.currency)}</b><em>{item.description}</em></button>)}</div>{!packages.length && <p className="prep-empty-value">Packages are currently unavailable.</p>}</section>
      </aside>
    </div>

    <section className="prep-journey"><header><p className="prep-kicker">What Happens Next</p><h2>Your journey after submission</h2><span>The entire project will continue in this same Project Room.</span></header><div>{journey.map((step) => <article key={step.number}><i>{step.number}</i><h3>{step.title}</h3><p>{step.text}</p></article>)}</div></section>

    <section className="prep-commitment"><div><p className="prep-kicker">Before Cancelling</p><h2>Let the idea evolve before you let it go.</h2><p>Once submitted, an artisan reserves time to study and develop your creation. If something feels uncertain, edit it now—or later contact the artisan and request a change before cancelling the project.</p></div><button type="button" onClick={onEdit}>Make Changes First</button></section>
  </>;
}
