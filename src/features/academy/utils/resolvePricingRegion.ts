import type { PricingRegion } from "../types/academyLocale";

export function resolvePricingRegion(countryCode: string | null | undefined): PricingRegion {
  return countryCode?.trim().toUpperCase() === "ID" ? "ID" : "INTL";
}
