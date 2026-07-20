import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import GlobalHeader from "../components/GlobalHeader";
import { authService } from "../features/auth/authService";
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
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { document.title = "Artisan Login | The Hall of Artisans"; document.body.classList.add("register-body", "artisan-login-body"); return () => document.body.classList.remove("register-body", "artisan-login-body"); }, []);
  useEffect(() => { void authService.getSession().then(async result => { const session = (result.ok ? result.data as { session?: unknown } : null)?.session; if (!session) return; const identity = await authService.getArtisanIdentity(); if (identity.ok) navigate("/my-artisan-id", { replace: true }); }); }, [navigate]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = event.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = new FormData(form); const email = String(data.get("email")).trim().toLowerCase(); const password = String(data.get("password"));
    setSubmitting(true); setMessage("Opening your secure Hall ledger...");
    const signedIn = await authService.signIn(email, password);
    if (!signedIn.ok) { setMessage(signedIn.error.message); setSubmitting(false); return; }
    const identity = await authService.getArtisanIdentity();
    if (!identity.ok) { setMessage(identity.error.message); setSubmitting(false); return; }
    navigate("/my-artisan-id");
  };
  return <><GlobalHeader activeLabel="Artisan ID" variant="light" /><main className="login-shell"><form className="register-form login-ledger" noValidate onSubmit={submit}><p className="section-kicker">Returning Artisan</p><h1>I Already Have an ID</h1><p>Sign in to your secure Artisan account.</p><label><span>Email Address</span><input name="email" type="email" autoComplete="email" required /></label><label><span>Password</span><input name="password" type="password" autoComplete="current-password" required /></label><p className="form-message" role="status" aria-live="polite">{message}</p><button className="register-submit" type="submit" disabled={submitting}>{submitting ? "Opening Ledger..." : "Open My Artisan ID"}</button><a className="login-back-link" href="/artisan-register">Create a new Artisan ID</a><p className="password-prototype-note">Authentication is securely handled by Supabase. Passwords are never stored by this website.</p></form></main></>;
}
