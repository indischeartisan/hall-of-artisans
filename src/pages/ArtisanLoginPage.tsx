import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import GlobalHeader from "../components/GlobalHeader";
import { useLegacyStylesheets } from "../hooks/useLegacyStylesheets";

const artisanProfileStyles = [
  "/assets/css/styles.css?v=18",
  "/assets/css/header-consistency.css?v=1",
  "/assets/css/global-header-light.css?v=3",
  "/assets/css/ornate-panel-bright.css?v=1"
] as const;

export default function ArtisanLoginPage() {
  useLegacyStylesheets("artisan-profile", artisanProfileStyles);
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  useEffect(() => { document.title = "Artisan Login | The Hall of Artisans"; document.body.classList.add("register-body", "artisan-login-body"); return () => document.body.classList.remove("register-body", "artisan-login-body"); }, []);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = event.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const email = String(new FormData(form).get("email")).trim().toLowerCase();
    let profile: { email?: string } | null = null;
    try { profile = JSON.parse(localStorage.getItem("hallArtisanProfile") || "null"); } catch { profile = null; }
    if (!profile || String(profile.email || "").toLowerCase() !== email) { setMessage("No matching Artisan profile is stored in this browser."); return; }
    navigate("/my-artisan-id");
  };
  return <><GlobalHeader activeLabel="Artisan ID" variant="light" /><main className="login-shell"><form className="register-form login-ledger" noValidate onSubmit={submit}><p className="section-kicker">Returning Artisan</p><h1>I Already Have an ID</h1><p>Open the Artisan profile saved in this browser.</p><label><span>Email Address</span><input name="email" type="email" autoComplete="email" required /></label><label><span>Password</span><input name="password" type="password" autoComplete="current-password" required /></label><p className="form-message" role="status" aria-live="polite">{message}</p><button className="register-submit" type="submit">Open My Artisan ID</button><a className="login-back-link" href="/artisan-register">Create a new Artisan ID</a><p className="password-prototype-note">Prototype access checks the profile saved locally in this browser. Passwords are not stored.</p></form></main></>;
}
