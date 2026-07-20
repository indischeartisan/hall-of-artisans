import { useLayoutEffect } from "react";
import GlobalHeader from "../components/GlobalHeader";

const bespokeStyles = [
  "/assets/css/styles.css?v=22",
  "/assets/css/ornate-panel-bright.css?v=1",
  "/assets/css/bespoke-redesign.css?v=1",
  "/assets/css/header-consistency.css?v=1"
];

export default function BespokeAtelierPage() {
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

  return (
    <>
      <GlobalHeader activeLabel="Bespoke Atelier" variant="light" />
      <main>
        <section className="commission-hero" aria-labelledby="atelierTitle">
          <div className="hero-copy">
            <p className="eyebrow">Commission Office</p>
            <h1 id="atelierTitle">Bespoke Atelier</h1>
            <p className="hero-subtitle">Create Your Perfume</p>
            <p>Create a fragrance crafted exclusively for you.</p>
            <a className="primary-button" href="#creation-methods">Create My Perfume <i>→</i></a>
          </div>
          <div className="hero-art" aria-hidden="true" />
        </section>

        <section className="creation-section ornate-panel" id="creation-methods" aria-labelledby="creationTitle">
          <div className="section-title">
            <p className="eyebrow">The Atelier Awaits</p>
            <h2 id="creationTitle">How would you like to create your perfume?</h2>
            <div className="ornament" />
          </div>
          <div className="creation-grid">
            <article className="creation-card ornate-panel">
              <img className="card-art" src="/assets/images/atelier-icon-bottles.webp" alt="Botanical perfume bottles" />
              <h3>Build Your Perfume</h3>
              <span className="mode-badge">Artisan Bench</span>
              <span className="status available">Available</span>
              <p>Build your fragrance with full control over materials, notes and structure.</p>
              <a className="primary-button" href="/artisan-bench">Start Building <i>→</i></a>
            </article>
            <article className="creation-card ornate-panel is-muted">
              <img className="card-art" src="/assets/images/atelier-icon-book.webp" alt="Botanical story book" />
              <h3>Tell Your Story</h3>
              <span className="mode-badge">Story Mode</span>
              <span className="status">Coming Soon</span>
              <p>Create a fragrance by sharing your story, memory or imagination.</p>
              <span className="locked-button">Coming Soon</span>
            </article>
            <article className="creation-card ornate-panel is-muted">
              <img className="card-art" src="/assets/images/atelier-icon-story.webp" alt="Artistic story and mood board" />
              <h3>Create with Images</h3>
              <span className="mode-badge">Mood Board Mode</span>
              <span className="status">Coming Soon</span>
              <p>Visualize your fragrance through images, textures, colors and atmosphere.</p>
              <span className="locked-button">Coming Soon</span>
            </article>
            <article className="creation-card ornate-panel is-muted">
              <img className="card-art" src="/assets/images/atelier-icon-map.webp" alt="Botanical map and compass" />
              <h3>Easy Creator</h3>
              <span className="mode-badge">Guided Mode</span>
              <span className="status">Coming Soon</span>
              <p>Answer a few simple questions and we’ll guide you step by step.</p>
              <span className="locked-button">Coming Soon</span>
            </article>
            <article className="creation-card ornate-panel consultation-card">
              <h3>Talk to a Perfumer</h3>
              <p>Not sure where to start? Talk to our perfumer and we’ll help shape your idea into a fragrance.</p>
              <a className="primary-button" href="mailto:atelier@hallofartisans.example?subject=Master%20Artisan%20Consultation">
                Start Consultation <i>→</i>
              </a>
            </article>
          </div>
        </section>

        <section className="package-section ornate-panel" aria-labelledby="packageTitle">
          <div className="bottle-placeholder" aria-label="Bottle artwork placeholder"><span>Artisan<br />Bottle</span></div>
          <div className="package-copy">
            <p className="eyebrow">Your Commission</p>
            <h2 id="packageTitle">Artisan Commission</h2>
            <p className="package-subtitle">Your Bespoke Package</p>
            <ul>
              <li>Story-based fragrance development</li><li>One original fragrance formula</li><li>30ml fragrance</li>
              <li>Personalized fragrance name</li><li>Artisan ID</li><li>Hall Archive Registration</li><li>Digital Story Card</li>
            </ul>
            <p className="package-price">Rp599.000</p>
          </div>
          <fieldset className="design-options">
            <legend>Choose Your Design</legend>
            <label className="design-choice selected">
              <input type="radio" name="design" defaultChecked />
              <span><b>Standard Design</b><small>Timeless design with our signature Hall label.</small></span>
            </label>
            <label className="design-choice disabled">
              <input type="radio" name="design" disabled />
              <span><b>Personalized Design</b><small>Custom label &amp; cap — Coming Soon.</small></span>
            </label>
          </fieldset>
        </section>

        <section className="journey-section ornate-panel" id="hall-archive" aria-labelledby="journeyTitle">
          <div className="section-title"><p className="eyebrow">Your Commission</p><h2 id="journeyTitle">What happens next?</h2><div className="ornament" /></div>
          <ol className="journey-track">
            <li><span>01</span><h3>Create Your Brief</h3><p>Build your fragrance concept with our tools.</p></li>
            <li><span>02</span><h3>Hall Review</h3><p>Our Master Artisans review your brief.</p></li>
            <li><span>03</span><h3>Crafting</h3><p>Your fragrance is blended, matured and refined.</p></li>
            <li><span>04</span><h3>Hall Archive</h3><p>Your creation is registered forever in The Hall.</p></li>
            <li><span>05</span><h3>Receive Your Perfume</h3><p>Your perfume is carefully bottled and delivered.</p></li>
          </ol>
        </section>

        <section className="continue-section ornate-panel">
          <div className="continue-left">
            <p className="eyebrow">After Your Commission</p><h2>Continue Your Journey</h2>
            <p>Your journey doesn’t end here. Explore what you can do next.</p>
            <div className="journey-actions"><a href="#reorder">Reorder Your Creation</a><a href="#reformulation">Reformulation Session</a><a href="#hall-archive">View Your Hall Archive</a></div>
          </div>
          <div className="share-card">
            <p className="eyebrow">Share Your Creation</p><h2>Hall Collaboration Program</h2>
            <p>Outstanding creations may be invited to become part of a future Hall release.</p>
            <strong>Invitation only.</strong><a className="outline-button" href="#collaboration">Learn More <i>→</i></a>
          </div>
        </section>
        <footer className="atelier-footer">Every story has a scent. Let’s create yours.</footer>
      </main>
    </>
  );
}
