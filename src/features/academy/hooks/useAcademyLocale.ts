import { useMemo } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { isAcademyLocale, type AcademyLocale } from "../types/academyLocale";
import { translateAcademy, type AcademyMessageKey } from "../services/academyDictionary";

function browserLocale(): AcademyLocale {
  return typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("id") ? "id" : "en";
}

export function useAcademyLocale() {
  const { profile } = useAuth();
  const locale = isAcademyLocale(profile?.preferred_locale) ? profile.preferred_locale : browserLocale();
  return useMemo(() => ({
    locale,
    t: (key: AcademyMessageKey) => translateAcademy(locale, key)
  }), [locale]);
}
