import { type FormEvent, useEffect, useState } from "react";
import GlobalHeader from "../components/GlobalHeader";
import { authService } from "../features/auth/authService";
import { useLegacyStylesheets } from "../hooks/useLegacyStylesheets";

const artisanProfileStyles = [
  "/assets/css/styles.css?v=18",
  "/assets/css/header-consistency.css?v=1",
  "/assets/css/global-header-light.css?v=3",
  "/assets/css/ornate-panel-bright.css?v=1"
] as const;

export default function ArtisanForgotPasswordPage() {
  useLegacyStylesheets("artisan-profile", artisanProfileStyles);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.title = "Recover Artisan Account | The Hall of Artisans";
    document.body.classList.add("register-body", "artisan-login-body");
    return () => document.body.classList.remove("register-body", "artisan-login-body");
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const email = String(new FormData(form).get("email")).trim().toLowerCase();
    setSubmitting(true);
    setMessage("Preparing your recovery letter...");
    const result = await authService.requestPasswordReset(email, `${window.location.origin}/artisan-reset-password`);
    if (!result.ok) {
      setMessage(result.error.message);
      setSubmitting(false);
      return;
    }
    setSent(true);
    setSubmitting(false);
    setMessage("If an Artisan account exists for this email, a recovery letter has been sent. Please also check your spam folder.");
  };

  return <><GlobalHeader variant="light" /><main className="login-shell"><form className="register-form login-ledger account-recovery-ledger" noValidate onSubmit={submit}><p className="section-kicker">Account Recovery</p><h1>Recover Your ID</h1><p>Enter the email connected to your Artisan account. We will send a secure link to choose a new password.</p><label><span>Email Address</span><input name="email" type="email" autoComplete="email" disabled={sent} required /></label><p className={`form-message${sent ? " recovery-success" : ""}`} role="status" aria-live="polite">{message}</p><button className="register-submit" type="submit" disabled={submitting || sent}>{submitting ? "Sending Letter..." : sent ? "Recovery Letter Sent" : "Send Recovery Letter"}</button><a className="login-back-link" href="/artisan-login">Return to Artisan Sign In</a><p className="password-prototype-note">For your privacy, this page does not reveal whether an email is registered.</p></form></main></>;
}
