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

const profileLabels: Record<string, string> = {
  freshness: "Fresh", sweetness: "Sweet", warmth: "Warm", green: "Green",
  floral: "Floral", woody: "Woody", powdery: "Powdery", clean: "Clean",
  darkness: "Dark", strangeness: "Unusual", intensity: "Intense", longevity: "Long-lasting"
};

const layerLabels = { top: "Opening", heart: "Heart", base: "Base" } as const;

function Tags({ values, empty }: { values: string[]; empty: string }) {
  return values.length
    ? <div className="prep-tags">{values.map((value) => <span key={value}>{value}</span>)}</div>
    : <p className="prep-empty-value">{empty}</p>;
}

export default function CreationPreparation({ request, busy, packages, selectedPackageId, onEdit, onSelectPackage, onSubmit }: CreationPreparationProps) {
  const snapshot = request.submissionSnapshot ?? request.previewSnapshot;
  const described = request.creationMode === "described";
  const formula = snapshot?.formulaMaterials ?? [];
  const formulaTotal = snapshot?.formulaMetadata?.total ?? formula.reduce((sum, material) => sum + material.percentage, 0);
  const metadata = snapshot?.formulaMetadata;
  const profile = metadata?.profile
    ? Object.entries(metadata.profile).sort((a, b) => b[1] - a[1]).slice(0, 4)
    : [];
  const brief = snapshot?.fragranceBrief;
  const story = snapshot?.writtenStory || request.fragranceBrief;
  const preferredNotes = snapshot?.preferredNotes ?? request.fragranceDirection;
  const notesToAvoid = snapshot?.notesToAvoid ?? [];
  const additionalNotes = described ? "" : snapshot ? snapshot.additionalNotes : request.customerNotes;
  const readiness = described ? [
    ["Creation title", Boolean(snapshot?.title?.trim() || request.perfumeName.trim())],
    ["Your story", Boolean(story.trim())],
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
      <div><strong>Your creation has not been sent yet.</strong><p>Review everything at your own pace. Sending to the artisan does not charge you.</p></div>
    </section>

    <div className="prep-layout">
      <section className="prep-panel prep-creation">
        <header className="prep-review-heading"><p>Review Your Creation</p><h2>This is the direction your artisan will receive.</h2><span>You can still make changes before continuing.</span></header>
        <section className="prep-ready prep-ready-inline"><p className="prep-kicker">Before You Send</p><h2>Ready for Artisan Review?</h2><ul>{readiness.map(([label, complete]) => <li className={complete ? "is-ready" : "needs-review"} key={label}><i>{complete ? "✓" : "○"}</i><span>{label}<small>{complete ? "Ready" : "Review before sending"}</small></span></li>)}</ul><button className="prep-edit" type="button" onClick={onEdit}>Edit Your Draft</button><button className="prep-submit" type="button" disabled={busy || !selectedPackageId} onClick={onSubmit}>{busy ? "Sending..." : selectedPackageId ? "Send to Artisan" : "Choose a Package First"}<span>→</span></button><small className="prep-no-charge">No payment is collected at this stage.</small></section>
        {described ? <div className="prep-story">
          {(snapshot?.ambienceImage?.url || snapshot?.ambienceImage?.dataUrl) && <section className="prep-ambience-reference"><h3>Ambience Reference</h3><img loading="lazy" decoding="async" src={snapshot.ambienceImage.url ?? snapshot.ambienceImage.dataUrl} alt="Customer ambience reference"/><small>{snapshot.ambienceImage.fileName}</small></section>}
          <section><h3>Your Story</h3><p>{story || "No story has been recorded yet."}</p></section>
          <div className="prep-two-column"><section><h3>Preferred Notes</h3><Tags values={preferredNotes} empty="No preferred notes recorded." /></section><section><h3>Notes to Avoid</h3><Tags values={notesToAvoid} empty="No notes to avoid recorded." /></section></div>
        </div> : <div className="prep-formula prep-editorial-review">
          <section className="prep-identity-card">
            <div className="prep-story-card-mini"><span>THE HALL OF</span><strong>ARTISANS</strong><small>CREATION BRIEF</small></div>
            <div><p>Artisan Bench Creation</p><h2>{snapshot?.perfumeName || request.perfumeName}</h2><em>Created with Artisan Bench</em><hr/><strong>{(snapshot?.concentration || request.concentration).toUpperCase()}</strong><span> · Bespoke fragrance concentration</span></div>
          </section>

          {profile.length > 0 && <section className="prep-review-section"><h3><b>1.</b> Scent Profile</h3><div className="prep-profile-grid">{profile.map(([key, value]) => <article key={key}><i>{profileLabels[key]?.slice(0, 1) || "✦"}</i><span>{profileLabels[key] || key}<strong>{value}%</strong></span></article>)}</div></section>}

          <section className="prep-review-section"><h3><b>2.</b> Fragrance Structure</h3><div className="prep-formula-layers">{(["top", "heart", "base"] as const).map((layer) => { const materials = formula.filter((material) => material.layer === layer); const total = metadata?.layerTotals?.[layer] ?? materials.reduce((sum, item) => sum + item.percentage, 0); return <section key={layer}><header><h4>{layerLabels[layer]}</h4><strong>{total}%</strong></header><div className="prep-layer-meter"><span style={{width:`${Math.min(total * 2, 100)}%`}}/></div>{materials.length ? materials.map((material) => <p key={`${layer}-${material.materialId}`}><span>{material.materialName}</span><b>{material.percentage}%</b></p>) : <p className="prep-empty-value">No {layer} notes selected.</p>}</section>})}</div><div className="prep-total-formula"><span>Total formula</span><strong>{formulaTotal}%</strong><small>Top {metadata?.layerTotals?.top ?? 0}% · Heart {metadata?.layerTotals?.heart ?? 0}% · Base {metadata?.layerTotals?.base ?? 0}%</small></div></section>

          <section className="prep-review-section prep-perfumer-notes"><h3><b>3.</b> Notes for Perfumer</h3><p>{additionalNotes || "No notes were added by the customer in Artisan Bench."}</p></section>

          <section className="prep-review-section"><h3><b>5.</b> Creation Check</h3><div className="prep-check-grid">{[...(metadata?.positives ?? []), ...(metadata?.warnings ?? [])].slice(0, 4).map((message, index) => <article className={index < (metadata?.positives?.length ?? 0) ? "is-positive" : "is-warning"} key={`${message}-${index}`}><i>{index < (metadata?.positives?.length ?? 0) ? "✓" : "!"}</i><span>{message}</span></article>)}{!(metadata?.positives?.length || metadata?.warnings?.length) && <article className={formulaTotal === 100 ? "is-positive" : "is-warning"}><i>{formulaTotal === 100 ? "✓" : "!"}</i><span>Formula total is {formulaTotal}%.</span></article>}</div></section>
        </div>}
        <section className="prep-ready prep-ready-after-check"><p className="prep-kicker">Before You Send</p><h2>Ready for Artisan Review?</h2><ul>{readiness.map(([label, complete]) => <li className={complete ? "is-ready" : "needs-review"} key={label}><i>{complete ? "✓" : "○"}</i><span>{label}<small>{complete ? "Ready" : "Review before sending"}</small></span></li>)}</ul><button className="prep-edit" type="button" onClick={onEdit}>Edit Your Draft</button><small className="prep-no-charge">No payment is collected at this stage.</small></section>
      </section>

      <aside className="prep-sidebar">
        <section className="prep-panel prep-ready"><p className="prep-kicker">Before You Send</p><h2>Ready for Artisan Review?</h2><ul>{readiness.map(([label, complete]) => <li className={complete ? "is-ready" : "needs-review"} key={label}><i>{complete ? "✓" : "○"}</i><span>{label}<small>{complete ? "Ready" : "Review before sending"}</small></span></li>)}</ul><button className="prep-edit" type="button" onClick={onEdit}>Edit Your Draft</button><button className="prep-submit" type="button" disabled={busy || !selectedPackageId} onClick={onSubmit}>{busy ? "Sending..." : selectedPackageId ? "Send to Artisan" : "Choose a Package First"}<span>→</span></button><small className="prep-no-charge">No payment is collected at this stage.</small></section>

        <section className="prep-panel prep-packages"><p className="prep-kicker">Choose Your Package</p><h2>One exact price before review.</h2><p>Select the commission that fits your journey. The price is locked when you submit.</p><div>{packages.map(item => <button type="button" className={selectedPackageId === item.id ? "selected" : ""} disabled={busy} onClick={() => onSelectPackage(item.id)} key={item.id}><span><strong>{item.name}</strong><small>{item.concentration} · {item.bottleSize}</small></span><b>{money(item.price, item.currency)}</b><em>{item.description}</em></button>)}</div>{!packages.length && <p className="prep-empty-value">Packages are currently unavailable.</p>}</section>
      </aside>
    </div>

    <section className="prep-journey"><header><p className="prep-kicker">What Happens Next</p><h2>Your journey after submission</h2><span>The entire project will continue in this same Project Room.</span></header><div>{journey.map((step) => <article key={step.number}><i>{step.number}</i><h3>{step.title}</h3><p>{step.text}</p></article>)}</div></section>

    <section className="prep-commitment"><div><p className="prep-kicker">Before Cancelling</p><h2>Let the idea evolve before you let it go.</h2><p>Once submitted, an artisan reserves time to study and develop your creation. If something feels uncertain, edit it now—or later contact the artisan and request a change before cancelling the project.</p></div><button type="button" onClick={onEdit}>Make Changes First</button></section>
  </>;
}
