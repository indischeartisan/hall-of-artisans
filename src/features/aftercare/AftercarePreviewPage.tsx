import GlobalHeader from "../../components/GlobalHeader";
import CustomerAftercarePanel from "./CustomerAftercarePanel";

export default function AftercarePreviewPage() {
  return <div className="aftercare-preview-page">
    <GlobalHeader variant="light" />
    <main>
      <section className="aftercare-preview-intro">
        <p>Simulation · Completed Commission</p>
        <h1>Neroli Before Dawn</h1>
        <span>This preview is local only. Nothing you try here will be saved to Supabase.</span>
        <dl><div><dt>Status</dt><dd>Delivered</dd></div><div><dt>Artisan</dt><dd>The Hall Artisan</dd></div><div><dt>Order</dt><dd>HOA-DEMO-2026</dd></div></dl>
      </section>
      <CustomerAftercarePanel requestId="demo-completed-order" demo />
    </main>
  </div>;
}
