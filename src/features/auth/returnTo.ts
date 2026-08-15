const DEFAULT_RETURN_TO = "/my-artisan-id";

export function sanitizeReturnTo(value: string | null | undefined, fallback = DEFAULT_RETURN_TO) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f]/.test(value)) return fallback;
  try {
    const parsed = new URL(value, "https://hall.local");
    if (parsed.origin !== "https://hall.local") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export const authPathWithReturnTo = (authPath: "/artisan-login" | "/artisan-register", returnTo: string) =>
  `${authPath}?returnTo=${encodeURIComponent(sanitizeReturnTo(returnTo))}`;
