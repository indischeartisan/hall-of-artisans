export function formatRouteLabel(value: string | undefined, fallback: string): string {
  if (!value || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) return fallback;
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
