import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import GlobalHeader from "../components/GlobalHeader";
import { useLegacyStylesheets } from "../hooks/useLegacyStylesheets";

const artisanProfileStyles = [
  "/assets/css/styles.css?v=18",
  "/assets/css/header-consistency.css?v=1",
  "/assets/css/global-header-light.css?v=3",
  "/assets/css/ornate-panel-bright.css?v=1"
] as const;

const groups = [
  { id: "direction", label: "Scent Direction", options: ["Fresh", "Clean", "Green", "Floral", "Gourmand", "Woody", "Powdery", "Dark", "Experimental"] },
  { id: "mood", label: "Scent Mood", options: ["Bright", "Misty", "Warm", "Cold", "Nostalgic", "Elegant", "Mysterious", "Playful"] },
  { id: "style", label: "Artisan Style", options: ["Storyteller", "Explorer", "Collector", "Archivist", "Dreamer", "Composer", "Experimentalist", "Observer"] }
] as const;

function createPrototypeArtisanId() {
  return `PROTO-LOCAL-${globalThis.crypto?.randomUUID?.().slice(0, 8).toUpperCase() ?? Date.now()}`;
}

export default function ArtisanRegisterPage() {
  useLegacyStylesheets("artisan-profile", artisanProfileStyles);
  const navigate = useNavigate();
  const [specialty, setSpecialty] = useState({ direction: "Fresh", mood: "Bright", style: "Storyteller" });
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const specialtyDropdownsRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const specialtyLabel = `${specialty.mood} ${specialty.direction} ${specialty.style}`;

  useEffect(() => {
    document.title = "Artisan Register | The Hall of Artisans";
    document.body.className = "register-body artisan-register-body";
    return () => { document.body.className = ""; };
  }, []);

  useEffect(() => {
    const closeOutside = (event: MouseEvent) => {
      if (!specialtyDropdownsRef.current?.contains(event.target as Node)) setOpenGroup(null);
    };
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenGroup(null);
    };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) { setMessage("Please complete the required register fields first."); form.reportValidity(); return; }
    const data = new FormData(form);
    const fullName = String(data.get("fullName")).trim();
    const email = String(data.get("emailAddress")).trim();
    const profile = { fullName, email, instagramWhatsapp: String(data.get("contactHandle")).trim(), scentDirection: specialty.direction, scentMood: specialty.mood, artisanStyle: specialty.style, specialty: specialtyLabel, artisanId: createPrototypeArtisanId(), status: "Prototype Artisan ID", registeredAt: new Date().toISOString() };
    localStorage.setItem("hallArtisanProfile", JSON.stringify(profile));
    localStorage.setItem("hallOfArtisans.artisanId", JSON.stringify({ name: profile.fullName, artisanId: profile.artisanId }));
    navigate("/my-artisan-id");
  };

  return <>
    <GlobalHeader activeLabel="Artisan ID" variant="light" />
    <main><section className="register-page-shell register-only-shell" id="create-artisan-id" aria-labelledby="registerTitle">
      <img className="register-hero-bg" src="/assets/images/artisan-register-background-v2.webp" alt="A botanical artisan registration hall filled with fragrance desks and flowers." />
      <div className="register-hero-veil" aria-hidden="true" />
      <div className="register-layout">
        <div className="register-left"><div className="register-hero-copy"><p className="section-kicker">Official Hall Desk</p><h1 id="registerTitle">Artisan Register</h1><p className="register-subtitle">Register your name within The Hall.</p><p>Every creation belongs to a creator. Create your Artisan ID to save fragrance drafts, generate shareable story cards, and submit a creation to be crafted into a real perfume.</p><div className="hero-story-note"><span aria-hidden="true">❧</span><p><strong>Every great fragrance begins with a story.</strong><br />Let your journey as an artisan begin here.</p></div></div></div>
        <form className="register-form ornate-panel bright-register-panel" id="artisanRegisterForm" noValidate onSubmit={submit}>
          <div className="register-section-heading"><p className="section-kicker">Create Your Artisan ID</p><h2>Create Your Artisan ID</h2></div>
          <label><span>Full Name</span><input name="fullName" type="text" autoComplete="name" placeholder="Enter your full name" required /></label>
          <label><span>Email Address</span><input name="emailAddress" type="email" autoComplete="email" placeholder="Enter your email address" required /></label>
          <label><span>Password</span><input name="password" type="password" autoComplete="new-password" minLength={6} placeholder="Create a password" required /></label>
          <label><span>Instagram / WhatsApp <small>optional</small></span><input name="contactHandle" type="text" autoComplete="off" placeholder="@username or phone number" /></label>
          <section className="specialty-selectors" aria-label="Artisan specialty"><div className="specialty-dropdowns" ref={specialtyDropdownsRef}>{groups.map(group => { const isOpen = openGroup === group.id; return <div className={`specialty-select${isOpen ? " open" : ""}`} key={group.id}><span className="specialty-select-label">{group.label}</span><button className="specialty-select-toggle" type="button" aria-expanded={isOpen} onClick={() => setOpenGroup(isOpen ? null : group.id)}><span className="specialty-selected">{specialty[group.id]}</span><span className="specialty-caret" aria-hidden="true" /></button><div className="specialty-select-menu" hidden={!isOpen}>{group.options.map(option => <button className={`specialty-option${specialty[group.id] === option ? " active" : ""}`} type="button" data-value={option} key={option} onClick={() => { setSpecialty(current => ({ ...current, [group.id]: option })); setOpenGroup(null); }}>{option}</button>)}</div></div>; })}</div><p className="specialty-summary-label">Specialty Preview</p><p className="specialty-result"><strong>{specialtyLabel}</strong></p></section>
          <p className="form-message" role="status" aria-live="polite">{message}</p><button className="register-submit" type="submit">Register &amp; Create My ID</button><div className="existing-artisan-divider" aria-hidden="true"><span>or</span></div><a className="form-existing-artisan" href="/artisan-login">I Already Have an ID</a><p className="password-prototype-note"><span aria-hidden="true">♙</span>Your information stays in this browser during the prototype phase. Passwords are never stored.</p>
        </form>
        <aside className="id-preview-wrap blank-id-preview ornate-panel bright-preview-panel" aria-label="Blank Artisan ID card preview"><p className="section-kicker">Artisan ID Card Preview</p><p className="card-size-label">Instagram Story Size 1080 × 1920</p><div className="artisan-card artisan-card-template"><img className="artisan-card-template-image" src="/assets/images/artisan-id-card-botanical-v2.webp" alt="" /><span className="id-card-text id-card-name">Your Name</span><span className="id-card-text id-card-artisan-id">HA-YYYY-XXXX</span><span className="id-card-text id-card-specialty">Your Specialty</span><span className="id-card-text id-card-status">Pending Registration</span><span className="id-card-text id-card-registered-within">Indische World</span><span className="id-card-text id-card-registered-since">YYYY</span></div><p className="preview-issue-note">Your official Artisan ID Card will be issued after registration.</p></aside>
      </div>
    </section></main>
  </>;
}
