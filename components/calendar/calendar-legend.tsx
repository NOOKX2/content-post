import { STATUS_LABELS } from "@/lib/constants";
import type { ContentStatus } from "@/lib/types";
import { CALENDAR_CELL_STYLES } from "@/lib/calendar/content";
import { cn } from "@/lib/utils";

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
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <span className="text-xs font-medium text-stone-500">สถานะ:</span>
      {LEGEND_STATUSES.map((status) => (
        <span
          key={status}
          className={cn(
            "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
            CALENDAR_CELL_STYLES[status]
          )}
        >
          {STATUS_LABELS[status].label}
        </span>
      ))}
    </div>
  );
}
