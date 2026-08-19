"use client";

import { CalendarDays } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/shared/utils";

export function CalendarMonthlyPlan({
  posted,
  total,
  className,
}: {
  posted: number;
  total: number;
  className?: string;
}) {
  const { t } = useT();
  const pct = total > 0 ? Math.round((posted / total) * 100) : 0;

  return (
    <div className={cn(className)}>
      <div className="flex items-start gap-3 border-b border-stone-200 pb-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-stone-200 bg-stone-50 text-emerald-700">
          <CalendarDays className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-stone-900">
            {t("calendar.monthlyPlan")}
          </p>
          <p className="mt-0.5 text-xs text-stone-500">
            {t("calendar.monthlyPlanHint")}
          </p>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden bg-stone-100">
        <div
          className="h-full bg-emerald-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-stone-500">
        {posted}/{total} {t("calendar.tasksDone")}
      </p>
    </div>
  );
}
