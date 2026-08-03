export const academyLocales = ["en", "id"] as const;
export type AcademyLocale = (typeof academyLocales)[number];
export type PricingRegion = "ID" | "INTL";

export function isAcademyLocale(value: unknown): value is AcademyLocale {
  return typeof value === "string" && academyLocales.includes(value as AcademyLocale);
}
