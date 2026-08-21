const normalizeOrigin = (value: string) => {
  try {
    const url = new URL(value);
    return url.origin;
  } catch {
    return "";
  }
};

export function authRedirectUrl(path: string) {
  const configuredOrigin = normalizeOrigin(import.meta.env.VITE_SITE_URL?.trim() ?? "");
  const runtimeOrigin = typeof window === "undefined" ? "" : window.location.origin;
  const origin = configuredOrigin || runtimeOrigin;
  if (!origin) throw new Error("The application site URL is not configured.");
  return new URL(path, `${origin}/`).toString();
}
