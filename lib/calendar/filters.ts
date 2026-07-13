import type { ContentItem, ContentStatus } from "@/lib/types";
import { getCalendarContents } from "@/lib/calendar/content";
import { formatDateKey } from "@/lib/calendar/content";

export type CalendarDateField = "post" | "shoot";

export type DateRangePreset = "today" | "7d" | "30d" | "custom";

export const CALENDAR_POST_STATUSES: ContentStatus[] = [
  "approved",
  "scheduled",
  "posting",
  "posted",
];

export function getContentCalendarDate(
  content: ContentItem,
  dateField: CalendarDateField
): string | null {
  if (!content.scheduledDate) return null;
  if (dateField === "shoot" && content.mediaType !== "video") return null;
  return content.scheduledDate;
}

export function isWaitingToPost(status: ContentStatus): boolean {
  return status === "approved" || status === "scheduled";
}

export function isPosting(status: ContentStatus): boolean {
  return status === "posting";
}

export function isPosted(status: ContentStatus): boolean {
  return status === "posted";
}

export function getPostStatusDotClass(status: ContentStatus): string {
  if (isPosted(status)) return "bg-emerald-500";
  if (isPosting(status)) return "bg-amber-500";
  if (isWaitingToPost(status)) return "bg-orange-500";
  return "bg-stone-300";
}

export function getDateRangeForPreset(
  preset: Exclude<DateRangePreset, "custom">
): { start: string; end: string } {
  const today = new Date();
  const end = formatDateKey(today);

  if (preset === "today") {
    return { start: end, end };
  }

  const startDate = new Date(today);
  startDate.setDate(
    today.getDate() - (preset === "7d" ? 6 : 29)
  );

  return { start: formatDateKey(startDate), end };
}

function isDateInRange(
  date: string,
  rangeStart?: string,
  rangeEnd?: string
): boolean {
  if (!rangeStart && !rangeEnd) return true;
  if (rangeStart && date < rangeStart) return false;
  if (rangeEnd && date > rangeEnd) return false;
  return true;
}

export function matchesCalendarSearch(
  content: ContentItem,
  search: string
): boolean {
  const keyword = search.trim().toLowerCase();
  if (!keyword) return true;

  return (
    content.name.toLowerCase().includes(keyword) ||
    content.contentId.toLowerCase().includes(keyword) ||
    content.channel.toLowerCase().includes(keyword)
  );
}

export function filterCalendarContents(
  contents: ContentItem[],
  options: {
    search: string;
    dateField: CalendarDateField;
    rangeStart?: string;
    rangeEnd?: string;
    postingOnly?: boolean;
  }
): ContentItem[] {
  const base = getCalendarContents(contents).filter((content) => {
    if (options.postingOnly && !CALENDAR_POST_STATUSES.includes(content.status)) {
      return false;
    }

    if (!matchesCalendarSearch(content, options.search)) return false;

    const date = getContentCalendarDate(content, options.dateField);
    if (!date) return false;

    return isDateInRange(date, options.rangeStart, options.rangeEnd);
  });

  return base;
}

export function getCalendarSummary(contents: ContentItem[]) {
  const waiting = contents.filter((c) => isWaitingToPost(c.status)).length;
  const posted = contents.filter((c) => isPosted(c.status)).length;

  return {
    total: contents.length,
    waiting,
    posted,
  };
}
