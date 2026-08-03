import { useEffect, useLayoutEffect, useState } from "react";
import GlobalHeader from "../components/GlobalHeader";
import { orderService } from "../features/orders/orderService";
import type { CommissionPackage } from "../features/orders/types";

const bespokeStyles = [
  "/assets/css/styles.css?v=22",
  "/assets/css/bespoke-redesign.css?v=2",
  "/assets/css/header-consistency.css?v=1"
];

const heroArtwork = "/assets/images/bespoke-atelier-hero.webp";

const creationMethods = [
  {
    image: "/assets/images/atelier-icon-book.webp",
    title: "Describe Your Creation",
    subtitle: "Start with a story",
    description: "Tell us about a memory, place, feeling, person, or imaginary world. No perfume knowledge is required.",
    action: "Describe My Creation",
    href: "/describe-your-creation"
  },
  {
    image: "/assets/images/atelier-icon-bottles.webp",
    title: "Artisan Bench",
    subtitle: "Build with more control",
    description: "Choose materials, concentration, fragrance structure, balance, and the direction you want.",
    action: "Open Artisan Bench",
    href: "/artisan-bench"
  }
] as const;

const processSteps = [
  ["Create", "Build your idea and save it to your account."],
  ["Review Together", "Choose your package, send your creation, and discuss it privately with an artisan."],
  ["Approve and Pay", "Review the artisan's proposal. Payment is made only after you approve it."],
  ["Crafted and Delivered", "Follow production and shipping inside your Project Room."]
] as const;

const goodToKnow = [
  ["Do I need to understand perfume?", "No. You can begin with a story and the artisan will help interpret it."],
  ["When do I pay?", "Only after you review and approve the proposal."],
  ["Can I reorder later?", "Yes. Completed creations remain connected to your account for reorder and adjustment requests."]
] as const;

const fallbackItems = [
  "Personal fragrance development",
  "Private artisan review",
  "Consultation through Project Room",
  "Proposal before payment",
  "One 30 ml fragrance",
  "Project tracking and aftercare"
];

const formatPrice = (price: number, currency: string) => new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency,
  maximumFractionDigits: 0
}).format(price);

const cleanPublicText = (value: string) => value
  .replaceAll("â€“", "–")
  .replaceAll("â€”", "—")
  .replaceAll("Â·", "·");

export default function BespokeAtelierPage() {
  const [activePackage, setActivePackage] = useState<CommissionPackage | null>(null);
  const [packageLoading, setPackageLoading] = useState(true);
  const [packageError, setPackageError] = useState("");

  useLayoutEffect(() => {
    document.title = "Bespoke Atelier | The Hall of Artisans";
    document.body.classList.add("bespoke-body", "redesign-body");

    const links = bespokeStyles.map((href) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.reactLegacyAsset = "bespoke";
      document.head.appendChild(link);
      return link;
    });

    return () => {
      document.body.classList.remove("bespoke-body", "redesign-body");
      links.forEach((link) => link.remove());
    };
  }, []);

  useEffect(() => {
    let current = true;
    void orderService.getCommissionPackages()
      .then((packages) => {
        if (!current) return;
        const preferred = packages.find((item) => item.slug === "personal-bespoke")
          ?? packages.find((item) => item.name.toLowerCase().includes("personal bespoke"))
          ?? packages[0]
          ?? null;
        setActivePackage(preferred);
        setPackageError(preferred ? "" : "Package details are being prepared.");
      })
      .catch(() => {
        if (current) setPackageError("Live package details are temporarily unavailable.");
      })
      .finally(() => {
        if (current) setPackageLoading(false);
      });
    return () => { current = false; };
  }, []);

  const includedItems = activePackage?.includedItems.length ? activePackage.includedItems : fallbackItems;
  const foundingPrice = activePackage?.currency === "IDR" && activePackage.price === 699000;
  const packageName = activePackage?.slug === "essential-commission"
    ? "Personal Bespoke"
    : activePackage?.name ?? "Personal Bespoke";

  return (
    <>
      <GlobalHeader activeLabel="Bespoke Atelier" variant="light" />
      <main className="bespoke-info-page">
        <section className="bespoke-hero" aria-labelledby="atelierTitle">
          <div className="bespoke-hero-copy">
            <p className="bespoke-eyebrow">A Private Fragrance Service</p>
            <h1 id="atelierTitle">Bespoke Atelier</h1>
            <p className="bespoke-hero-subtitle">Your idea, made into a personal fragrance.</p>
            <p className="bespoke-lead">Share a story, memory, or fragrance direction. An artisan will help develop it into a perfume created especially for you.</p>
            <a className="bespoke-primary-button" href="/chamber-of-creation">Begin Your Creation <span aria-hidden="true">→</span></a>
            <small className="bespoke-reassurance">No payment is required when you begin.</small>
          </div>
          <figure className="bespoke-hero-art">
            <img src={heroArtwork} alt="A bright botanical fragrance atelier filled with flowers and artisan perfume tools" />
          </figure>
        </section>

        <section className="bespoke-section bespoke-methods" aria-labelledby="methodsTitle">
          <header className="bespoke-section-heading"><p className="bespoke-eyebrow">Your First Step</p><h2 id="methodsTitle">Choose How to Begin</h2></header>
          <div className="bespoke-method-grid">
            {creationMethods.map((method) => <article className="bespoke-method-card" key={method.title}>
              <img src={method.image} alt="" />
              <div><p>{method.subtitle}</p><h3>{method.title}</h3><span>{method.description}</span></div>
              <a className="bespoke-secondary-button" href={method.href}>{method.action} <span aria-hidden="true">→</span></a>
            </article>)}
          </div>
          <p className="bespoke-method-note">Not sure which one to choose? <a href="/describe-your-creation">Start with Describe Your Creation.</a></p>
        </section>

        <section className="bespoke-section bespoke-process" aria-labelledby="processTitle">
          <header className="bespoke-section-heading"><p className="bespoke-eyebrow">From Idea to Delivery</p><h2 id="processTitle">How It Works</h2></header>
          <ol className="bespoke-timeline">
            {processSteps.map(([title, description], index) => <li key={title}><i>{String(index + 1).padStart(2, "0")}</i><div><h3>{title}</h3><p>{description}</p></div></li>)}
          </ol>
        </section>

        <section className="bespoke-section bespoke-package" aria-labelledby="packageTitle">
          <div className="bespoke-package-art" aria-hidden="true"><img src="/assets/images/atelier-icon-bottles.webp" alt="" /></div>
          <div className="bespoke-package-copy">
            <p className="bespoke-eyebrow">Our Package</p>
            {packageLoading ? <div className="bespoke-package-loading" role="status">Loading the current package…</div> : <>
              <div className="bespoke-package-title"><h2 id="packageTitle">{packageName}</h2>{foundingPrice && <span>Founding Price</span>}</div>
              {activePackage ? <p className="bespoke-package-meta">{cleanPublicText(activePackage.concentration)} · {cleanPublicText(activePackage.bottleSize)} · Estimated production {cleanPublicText(activePackage.estimatedProduction)}</p> : <p className="bespoke-package-meta">A personal fragrance developed privately with an artisan.</p>}
              {activePackage && <strong className="bespoke-package-price">{formatPrice(activePackage.price, activePackage.currency)}</strong>}
              {foundingPrice && <p className="bespoke-regular-price">Regular price Rp899.000 after the introductory period.</p>}
              {packageError && <p className="bespoke-package-error" role="status">{packageError}</p>}
              <ul>{includedItems.map((item) => <li key={item}>{cleanPublicText(item)}</li>)}</ul>
              <a className="bespoke-primary-button" href="/chamber-of-creation">Begin Your Creation <span aria-hidden="true">→</span></a>
              <small className="bespoke-pricing-note">The package price covers the standard scope. If your creation requires materials or services outside the package, any price adjustment will be shown before approval.</small>
            </>}
          </div>
        </section>

        <section className="bespoke-section bespoke-knowledge" aria-labelledby="knowledgeTitle">
          <header className="bespoke-section-heading"><p className="bespoke-eyebrow">A Simple, Guided Process</p><h2 id="knowledgeTitle">Good to Know</h2></header>
          <div>{goodToKnow.map(([question, answer]) => <article key={question}><h3>{question}</h3><p>{answer}</p></article>)}</div>
        </section>

        <section className="bespoke-final-cta" aria-labelledby="finalCtaTitle">
          <div><p className="bespoke-eyebrow">Begin When You Are Ready</p><h2 id="finalCtaTitle">Your fragrance can begin with one simple idea.</h2></div>
          <div><a className="bespoke-primary-button" href="/chamber-of-creation">Begin Your Creation <span aria-hidden="true">→</span></a><a className="bespoke-project-link" href="/my-artisan-id">View My Projects</a></div>
        </section>
      </main>
    </>
  );
}
