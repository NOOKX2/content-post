import type { ContentItem, ContentStatus } from "@/lib/types";

export function getCalendarContents(contents: ContentItem[]) {
  return contents.filter(
    (c) => !!c.scheduledDate && c.status !== "draft"
  );
}

export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export const CALENDAR_EVENT_STYLES: Record<ContentStatus, string> = {
  draft: "",
  pending:
    "bg-amber-100 text-amber-900 border border-dashed border-amber-300 hover:bg-amber-200",
  approved: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  scheduled: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  posted: "bg-violet-100 text-violet-800 hover:bg-violet-200",
  rejected: "bg-red-50 text-red-700 opacity-80 hover:bg-red-100",
};

export const CALENDAR_CELL_STYLES: Record<ContentStatus, string> = {
  draft: "",
  pending: "border-amber-300 bg-amber-50/80",
  approved: "border-blue-200 bg-blue-50/80",
  scheduled: "border-blue-200 bg-blue-50/80",
  posted: "border-violet-200 bg-violet-50/80",
  rejected: "border-red-200 bg-red-50/80 opacity-80",
};
