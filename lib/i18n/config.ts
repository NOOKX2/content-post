export const LOCALES = ["th", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "th";

export const LOCALE_COOKIE = "idea_locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "th" || value === "en";
}

export function dateLocale(locale: Locale): string {
  return locale === "en" ? "en-US" : "th-TH";
}
