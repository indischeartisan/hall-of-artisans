import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { authService } from "../auth/authService";
import { staffService, type StaffAccess, type StaffRole } from "./staffService";

type StaffLoginKind = "admin" | "perfumer";

interface StaffLoginPageProps {
  kind: StaffLoginKind;
}

const copy = {
  admin: {
    eyebrow: "Administrative Access",
    title: "Admin Portal",
    description: "Manage operations, staff assignments, catalog content, and official Hall records.",
    button: "Enter Admin Portal",
    alternate: "Sign in as Perfumer",
    alternatePath: "/perfumer/login"
  },
  perfumer: {
    eyebrow: "Artisan Review Access",
    title: "Perfumer Workspace",
    description: "Open assigned fragrance briefs, communicate with customers, and prepare artisan proposals.",
    button: "Enter Review Workspace",
    alternate: "Sign in as Administrator",
    alternatePath: "/admin/login"
  }
} as const;

const roleIsAllowed = (kind: StaffLoginKind, role: StaffRole | null) =>
  kind === "admin" ? role === "admin" || role === "super_admin" : role === "reviewer";

const destinationFor = (kind: StaffLoginKind, requested: string | null) => {
  if (requested?.startsWith("/admin") && !requested.startsWith("//")) return requested;
  return "/admin";
};

export default function StaffLoginPage({ kind }: StaffLoginPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const content = copy[kind];
  const destination = useMemo(() => destinationFor(kind, searchParams.get("returnTo")), [kind, searchParams]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentAccess, setCurrentAccess] = useState<StaffAccess | null>(null);

  useEffect(() => {
    document.title = `${content.title} | The Hall of Artisans`;
    document.body.classList.add("staff-login-body");
    return () => document.body.classList.remove("staff-login-body");
  }, [content.title]);

  useEffect(() => {
    let active = true;
    void staffService.getAccess().then(access => {
      if (!active) return;
      setCurrentAccess(access);
      if (roleIsAllowed(kind, access.role)) navigate(destination, { replace: true });
    }).catch(() => { if (active) setCurrentAccess({ signedIn: false, role: null, email: "", userId: "" }); });
    return () => { active = false; };
  }, [destination, kind, navigate]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const values = new FormData(form);
    const email = String(values.get("email") ?? "").trim().toLowerCase();
    const password = String(values.get("password") ?? "");
    setSubmitting(true);
    setMessage("Verifying your staff credentials...");

    const signedIn = await authService.signIn(email, password);
    if (!signedIn.ok) {
      setMessage("Email or password is incorrect.");
      setSubmitting(false);
      return;
    }

    try {
      const access = await staffService.getAccess();
      if (!roleIsAllowed(kind, access.role)) {
        await authService.signOut();
        setCurrentAccess(null);
        setMessage(kind === "admin"
          ? "This account does not have administrator access."
          : "This account is not registered as a perfumer or reviewer.");
        setSubmitting(false);
        return;
      }
      navigate(destination, { replace: true });
    } catch {
      await authService.signOut();
      setMessage("Staff authorization could not be verified. Please try again.");
      setSubmitting(false);
    }
  };

  const signOutCurrent = async () => {
    await authService.signOut();
    setCurrentAccess(null);
    setMessage("Previous session closed. You can now sign in with a staff account.");
  };

  return <main className={`staff-login-shell staff-login-${kind}`}>
    <Link className="staff-login-brand" to="/" aria-label="Return to The Hall of Artisans">
      <img src="/assets/images/hall-artisans-logo-gold.webp" alt="" />
      <span><strong>The Hall of Artisans</strong><small>Indische World</small></span>
    </Link>
    <section className="staff-login-panel">
      <div className="staff-login-intro">
        <span>{content.eyebrow}</span>
        <h1>{content.title}</h1>
        <p>{content.description}</p>
        <dl>
          <div><dt>Protected</dt><dd>Supabase authentication</dd></div>
          <div><dt>Restricted</dt><dd>Verified staff roles only</dd></div>
        </dl>
      </div>
      <form onSubmit={submit} noValidate>
        <header><span>Staff Sign In</span><h2>Welcome back.</h2><p>Use the email assigned to your Hall staff account.</p></header>
        {currentAccess?.signedIn && !roleIsAllowed(kind, currentAccess.role) && <aside className="staff-session-note">
          <p><strong>{currentAccess.email}</strong> is currently signed in without access to this workspace.</p>
          <button type="button" onClick={() => void signOutCurrent()}>Close this session</button>
        </aside>}
        <label><span>Email address</span><input name="email" type="email" autoComplete="email" required /></label>
        <label><span>Password</span><input name="password" type="password" autoComplete="current-password" required /></label>
        <Link className="staff-forgot-link" to="/artisan-forgot-password">Forgot password?</Link>
        <p className="staff-login-message" role="status" aria-live="polite">{message}</p>
        <button className="staff-login-submit" disabled={submitting}>{submitting ? "Verifying Access..." : content.button}</button>
        <footer><Link to={content.alternatePath}>{content.alternate}</Link><Link to="/artisan-login">Customer sign in</Link></footer>
      </form>
    </section>
  </main>;
}
