import type { ContentItem, ContentStatus } from "@/lib/types";
import { getCalendarContents } from "@/lib/calendar/content";
import { formatDateKey } from "@/lib/calendar/content";

export type CalendarMode = "post" | "prepost";

export type CalendarDateField =
  | "post"
  | "ideaFinished"
  | "shoot"
  | "editFinished";

export type PostStatusFilter = "all" | "waiting" | "posted" | "needsEdit";

export type DateRangePreset = "today" | "7d" | "30d" | "custom";

export const CALENDAR_POST_STATUSES: ContentStatus[] = [
  "approved",
  "scheduled",
  "posting",
  "posted",
  "post_failed",
  "rejected",
];

export const POST_STATUS_FILTERS: {
  id: PostStatusFilter;
  label: string;
}[] = [
  { id: "all", label: "งานทั้งหมด" },
  { id: "waiting", label: "รอลงโพสต์" },
  { id: "posted", label: "ลงโพสต์แล้ว" },
  { id: "needsEdit", label: "รอแก้ไข" },
];

export const PREPOST_DATE_FIELD_OPTIONS: {
  value: CalendarDateField;
  label: string;
}[] = [
  { value: "ideaFinished", label: "คอนเทนต์คิดเสร็จ" },
  { value: "shoot", label: "นัดวันถ่าย" },
  { value: "editFinished", label: "ตัดเสร็จ" },
];

export function getContentCalendarDate(
  content: ContentItem,
  dateField: CalendarDateField
): string | null {
  const value =
    dateField === "post"
      ? content.scheduledDate
      : dateField === "ideaFinished"
        ? content.ideaFinishedDate
        : dateField === "shoot"
          ? content.shootDate
          : content.editFinishedDate;

  return value?.trim() ? value : null;
}

export function isWaitingToPost(status: ContentStatus): boolean {
  return (
    status === "approved" || status === "scheduled" || status === "posting"
  );
}

export function isPosting(status: ContentStatus): boolean {
  return status === "posting";
}

export function isPosted(status: ContentStatus): boolean {
  return status === "posted";
}

export function isNeedsEdit(status: ContentStatus): boolean {
  return status === "rejected";
}

export function matchesPostStatusFilter(
  status: ContentStatus,
  filter: PostStatusFilter
): boolean {
  if (filter === "all") return CALENDAR_POST_STATUSES.includes(status);
  if (filter === "waiting") return isWaitingToPost(status);
  if (filter === "posted") return isPosted(status);
  return isNeedsEdit(status);
}

export function getPostStatusDotClass(status: ContentStatus): string {
  if (isPosted(status)) return "bg-emerald-500";
  if (status === "post_failed") return "bg-red-500";
  if (isPosting(status)) return "bg-amber-500";
  if (isNeedsEdit(status)) return "bg-red-500";
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
  startDate.setDate(today.getDate() - (preset === "7d" ? 6 : 29));

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
    mode: CalendarMode;
    search: string;
    dateField: CalendarDateField;
    rangeStart?: string;
    rangeEnd?: string;
    statusFilter?: PostStatusFilter;
  }
): ContentItem[] {
  return getCalendarContents(contents, {
    mode: options.mode,
    dateField: options.dateField,
  }).filter((content) => {
    if (options.mode === "post") {
      const statusFilter = options.statusFilter ?? "all";
      if (!matchesPostStatusFilter(content.status, statusFilter)) {
        return false;
      }
    }

    if (!matchesCalendarSearch(content, options.search)) return false;

    const date = getContentCalendarDate(content, options.dateField);
    if (!date) return false;

    return isDateInRange(date, options.rangeStart, options.rangeEnd);
  });
}

export function getCalendarSummary(contents: ContentItem[]) {
  const waiting = contents.filter((c) => isWaitingToPost(c.status)).length;
  const posted = contents.filter((c) => isPosted(c.status)).length;
  const needsEdit = contents.filter((c) => isNeedsEdit(c.status)).length;

  return {
    total: contents.length,
    waiting,
    posted,
    needsEdit,
  };
}
