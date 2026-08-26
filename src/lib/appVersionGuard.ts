export const APP_VERSION = "2026-08-26.2";
const CANONICAL_ORIGIN = "https://cloudflare-migration.hall-of-artisans.pages.dev";

type VersionManifest = { minimumVersion?: string; canonicalOrigin?: string };

export async function enforceCurrentAppVersion(): Promise<boolean> {
  if (!import.meta.env.PROD) return true;
  try {
    const response = await fetch(`${CANONICAL_ORIGIN}/app-version.json?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return true;
    const manifest = await response.json() as VersionManifest;
    const canonicalOrigin = manifest.canonicalOrigin || CANONICAL_ORIGIN;
    const staleVersion = Boolean(manifest.minimumVersion && manifest.minimumVersion !== APP_VERSION);
    const uniquePagesDeployment = location.hostname.endsWith(".hall-of-artisans.pages.dev") && location.origin !== canonicalOrigin;
    if (!staleVersion && !uniquePagesDeployment) return true;
    location.replace(`${canonicalOrigin}${location.pathname}${location.search}${location.hash}`);
    return false;
  } catch {
    // An offline user may continue with the installed shell; data access remains protected by RLS.
    return true;
  }
}
