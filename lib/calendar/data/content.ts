import type { ContentItem, ContentStatus } from "@/lib/types";
import type { CalendarDateField, CalendarMode } from "@/lib/calendar/domain/filters";

export function getCalendarContents(
  contents: ContentItem[],
  options?: {
    mode?: CalendarMode;
    dateField?: CalendarDateField;
  }
) {
  const mode = options?.mode ?? "post";
  const dateField = options?.dateField ?? "post";

  return contents.filter((c) => {
    if (c.status === "draft") return false;

    if (mode === "post") {
      return !!c.scheduledDate?.trim();
    }

    const value =
      dateField === "ideaFinished"
        ? c.ideaFinishedDate
        : dateField === "shoot"
          ? c.shootDate
          : dateField === "editFinished"
            ? c.editFinishedDate
            : c.scheduledDate;

    return !!value?.trim();
  });
}

export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export const CALENDAR_EVENT_STYLES: Record<ContentStatus, string> = {
  draft: "",
  pending:
    "bg-amber-100 text-amber-900 border border-dashed border-amber-300 hover:bg-amber-200",
  idea_approved:
    "bg-sky-100 text-sky-900 border border-dashed border-sky-300 hover:bg-sky-200",
  clip_pending:
    "bg-orange-100 text-orange-900 border border-dashed border-orange-300 hover:bg-orange-200",
  approved: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  scheduled: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  posting: "bg-amber-100 text-amber-800 hover:bg-amber-200",
  posted: "bg-violet-100 text-violet-800 hover:bg-violet-200",
  post_failed: "bg-red-100 text-red-800 hover:bg-red-200",
  rejected: "bg-red-50 text-red-700 opacity-80 hover:bg-red-100",
};

export const CALENDAR_CELL_STYLES: Record<ContentStatus, string> = {
  draft: "",
  pending: "border-amber-300 bg-amber-50/80",
  idea_approved: "border-sky-300 bg-sky-50/80",
  clip_pending: "border-orange-300 bg-orange-50/80",
  approved: "border-blue-200 bg-blue-50/80",
  scheduled: "border-blue-200 bg-blue-50/80",
  posting: "border-amber-200 bg-amber-50/80",
  posted: "border-violet-200 bg-violet-50/80",
  post_failed: "border-red-200 bg-red-50/80",
  rejected: "border-red-200 bg-red-50/80 opacity-80",
};
