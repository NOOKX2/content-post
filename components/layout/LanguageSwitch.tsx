"use client";

import { cn } from "@/lib/shared/utils";
import { useT } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitch({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { locale, setLocale, t } = useT();

  return (
    <div
      role="group"
      aria-label={t("header.language")}
      className={cn(
        "flex items-center rounded-xl border border-stone-200 bg-white p-0.5",
        className
      )}
    >
      {(["th", "en"] as const).map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code as Locale)}
            className={cn(
              "rounded-lg font-semibold transition-colors",
              compact
                ? "h-7 min-w-8 px-2 text-[11px]"
                : "h-8 min-w-9 px-2.5 text-xs",
              active
                ? "bg-stone-900 text-white"
                : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
            )}
            aria-pressed={active}
          >
            {code === "th" ? t("header.thai") : t("header.english")}
          </button>
        );
      })}
    </div>
  );
}
