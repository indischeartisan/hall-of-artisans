export default function BetaBadge() {
  if (import.meta.env.VITE_BETA_MODE !== "true") return null;
  return <aside className="beta-environment-badge" role="status" aria-label="Beta testing environment"><strong>Beta</strong><span>Testing environment · no real payment</span></aside>;
}
