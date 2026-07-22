import { type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import GlobalHeader from "../components/GlobalHeader";
import { authService } from "../features/auth/authService";
import { MIN_PASSWORD_LENGTH, passwordRequirement } from "../features/auth/passwordPolicy";
import { useLegacyStylesheets } from "../hooks/useLegacyStylesheets";

const artisanProfileStyles = [
  "/assets/css/styles.css?v=18",
  "/assets/css/header-consistency.css?v=1",
  "/assets/css/global-header-light.css?v=3",
  "/assets/css/ornate-panel-bright.css?v=1"
] as const;

export default function ArtisanResetPasswordPage() {
  useLegacyStylesheets("artisan-profile", artisanProfileStyles);
  const navigate = useNavigate();
  const [sessionReady, setSessionReady] = useState<boolean | null>(null);
  const [message, setMessage] = useState("Validating your recovery letter...");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Choose New Password | The Hall of Artisans";
    document.body.classList.add("register-body", "artisan-login-body");
    return () => document.body.classList.remove("register-body", "artisan-login-body");
  }, []);

  useEffect(() => authService.observeSession((session) => {
    setSessionReady(Boolean(session));
    setMessage(session ? "" : "This recovery link is invalid or has expired. Request a new recovery letter.");
  }), []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = new FormData(form);
    const password = String(data.get("password"));
    const confirmation = String(data.get("passwordConfirmation"));
    if (password !== confirmation) { setMessage("The password confirmation does not match."); return; }
    setSubmitting(true);
    setMessage("Sealing your new password...");
    const result = await authService.updatePassword(password);
    if (!result.ok) {
      setMessage(result.error.message);
      setSubmitting(false);
      return;
    }
    setMessage("Your password has been updated securely. Opening your Artisan ID...");
    window.setTimeout(() => navigate("/my-artisan-id", { replace: true }), 900);
  };

  return <><GlobalHeader variant="light" /><main className="login-shell"><form className="register-form login-ledger account-recovery-ledger" noValidate onSubmit={submit}><p className="section-kicker">Secure Recovery</p><h1>Choose a New Password</h1><p>Create a new password for your Artisan account.</p><label><span>New Password</span><input name="password" type="password" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} aria-describedby="reset-password-requirement" disabled={!sessionReady || submitting} required /><small id="reset-password-requirement">{passwordRequirement}</small></label><label><span>Confirm Password</span><input name="passwordConfirmation" type="password" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} disabled={!sessionReady || submitting} required /></label><p className="form-message" role="status" aria-live="polite">{message}</p><button className="register-submit" type="submit" disabled={!sessionReady || submitting}>{submitting ? "Updating Password..." : "Save New Password"}</button>{sessionReady === false && <a className="login-back-link" href="/artisan-forgot-password">Request a New Recovery Letter</a>}</form></main></>;
}
