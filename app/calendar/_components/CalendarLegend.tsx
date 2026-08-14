"use client";

import type { ContentStatus } from "@/lib/types";
import { CALENDAR_CELL_STYLES } from "@/lib/calendar/data/content";
import { cn } from "@/lib/shared/utils";
import { statusLabel, useT } from "@/lib/i18n";

const LEGEND_STATUSES: ContentStatus[] = [
  "pending",
  "approved",
  "scheduled",
  "posting",
  "posted",
  "post_failed",
  "rejected",
];

export function CalendarLegend({ className }: { className?: string }) {
  const { t } = useT();

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <span className="text-xs font-medium text-stone-500">
        {t("calendar.statusLabel")}:
      </span>
      {LEGEND_STATUSES.map((status) => (
        <span
          key={status}
          className={cn(
            "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
            CALENDAR_CELL_STYLES[status]
          )}
        >
          {statusLabel(t, status)}
        </span>
      ))}
    </div>
  );
}
