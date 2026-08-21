import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import GlobalHeader from "../components/GlobalHeader";
import { authService } from "../features/auth/authService";
import { useLegacyStylesheets } from "../hooks/useLegacyStylesheets";
import { useAuth } from "../contexts/AuthContext";
import { authPathWithReturnTo, sanitizeReturnTo } from "../features/auth/returnTo";

const artisanProfileStyles = [
  "/assets/css/styles.css?v=18",
  "/assets/css/header-consistency.css?v=1",
  "/assets/css/global-header-light.css?v=3",
  "/assets/css/ornate-panel-bright.css?v=1"
] as const;

export default function ArtisanLoginPage() {
  useLegacyStylesheets("artisan-profile", artisanProfileStyles);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const returnTo = sanitizeReturnTo(new URLSearchParams(location.search).get("returnTo"));
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => { document.title = "Artisan Login | The Hall of Artisans"; document.body.classList.add("register-body", "artisan-login-body"); return () => document.body.classList.remove("register-body", "artisan-login-body"); }, []);
  useEffect(() => { if (!loading && user) navigate(returnTo, { replace: true }); }, [loading, navigate, returnTo, user]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = event.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = new FormData(form); const email = String(data.get("email")).trim().toLowerCase(); const password = String(data.get("password"));
    setSubmitting(true); setMessage("Opening your secure Hall ledger...");
    const signedIn = await authService.signIn(email, password);
    if (!signedIn.ok) { setMessage(signedIn.error.message); setSubmitting(false); return; }
    const identity = await authService.getArtisanIdentity();
    if (!identity.ok) { setMessage(identity.error.message); setSubmitting(false); return; }
    navigate(returnTo);
  };
  return <><GlobalHeader activeLabel="Artisan ID" variant="light" /><main className="login-shell artisan-login-shell"><form className="login-ledger artisan-login-card" noValidate onSubmit={submit}>
    <header className="artisan-login-intro"><p className="section-kicker"><span aria-hidden="true">✦</span> Returning Artisan <span aria-hidden="true">✦</span></p><h1>I Already<br />Have an ID</h1><div className="login-flourish" aria-hidden="true">◇</div><p>Sign in to your secure Artisan account.</p></header>
    <label className="artisan-login-field"><span>Email Address</span><span className="artisan-login-input"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3.5 6.5h17v12h-17zM4 7l8 6 8-6" /></svg><input name="email" type="email" autoComplete="email" placeholder="your@email.com" required /></span></label>
    <label className="artisan-login-field"><span>Password</span><span className="artisan-login-input"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 10V8a5 5 0 0 1 10 0v2M5 10h14v10H5z" /></svg><input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" required /><button className="password-visibility" type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}><svg aria-hidden="true" viewBox="0 0 24 24"><path d={showPassword ? "M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" : "M3 3l18 18M10.6 6.2A9.7 9.7 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-2.2 2.7M6.2 6.2C3.6 8 2 12 2 12s4 6 10 6a9.8 9.8 0 0 0 3.7-.7M9.8 9.8a3 3 0 0 0 4.4 4.4"} /></svg></button></span></label>
    <a className="login-forgot-link" href="/artisan-forgot-password">Forgot your password?</a>
    <p className="form-message" role="status" aria-live="polite">{message}</p>
    <button className="register-submit artisan-login-submit" type="submit" disabled={submitting}><span>{submitting ? "Opening Ledger..." : "Open My Artisan ID"}</span><span aria-hidden="true">❧</span></button>
    <div className="login-divider" aria-hidden="true"><span>◇</span></div>
    <a className="login-back-link" href={authPathWithReturnTo("/artisan-register", returnTo)}><span aria-hidden="true">♙</span><span>Create a new Artisan ID</span><span aria-hidden="true">›</span></a>
    <p className="password-prototype-note"><span aria-hidden="true">♢</span><span>Authentication is securely handled by Supabase.<br />Passwords are never stored by this website.</span></p>
  </form></main></>;
}
