import { dateLocale, type Locale } from "./config";

export function formatLocalizedDate(dateStr: string, locale: Locale): string {
  return new Date(dateStr).toLocaleDateString(dateLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatLocalizedDateTime(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleString(dateLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
