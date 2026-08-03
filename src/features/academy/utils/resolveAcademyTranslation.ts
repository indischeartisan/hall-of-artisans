import type { AcademyLocale } from "../types/academyLocale";

export function resolveAcademyTranslation<T extends { locale: string }>(translations: T[], locale: AcademyLocale): T | null {
  return translations.find((item) => item.locale === locale)
    ?? translations.find((item) => item.locale === "en")
    ?? null;
}

export function jsonStringArray(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : [];
}
