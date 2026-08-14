import { DEFAULT_LOCALE, type Locale } from "./config";
import { en, th, type Messages } from "./messages";

const dictionaries: Record<Locale, Messages> = { th, en };

export type TFunction = (
  key: string,
  vars?: Record<string, string | number>
) => string;

function lookup(messages: unknown, key: string): string | undefined {
  let current: unknown = messages;
  for (const part of key.split(".")) {
    if (!current || typeof current !== "object" || !(part in current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>
): string {
  const template =
    lookup(getMessages(locale), key) ??
    lookup(getMessages(DEFAULT_LOCALE), key) ??
    key;

  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    vars[name] === undefined ? `{${name}}` : String(vars[name])
  );
}

export function createTranslator(locale: Locale): TFunction {
  return (key, vars) => translate(locale, key, vars);
}
