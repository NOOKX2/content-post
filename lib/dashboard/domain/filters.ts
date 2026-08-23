import type { ContentItem } from "@/lib/types";
import type { DashboardFilters, DashboardPeriod } from "@/lib/dashboard/types";
import { formatDateKey } from "@/lib/calendar/data/content";

export function getDateRangeForPeriod(
  period: DashboardPeriod,
  customStart?: string,
  customEnd?: string
): { start: string; end: string } {
  const today = new Date();
  const end = formatDateKey(today);

  if (period === "custom" && customStart && customEnd) {
    return { start: customStart, end: customEnd };
  }

  if (period === "7d") {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return { start: formatDateKey(start), end };
  }

  if (period === "30d") {
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    return { start: formatDateKey(start), end };
  }

  if (period === "90d") {
    const start = new Date(today);
    start.setDate(start.getDate() - 89);
    return { start: formatDateKey(start), end };
  }

  // year — calendar year to date
  const start = formatDateKey(new Date(today.getFullYear(), 0, 1));
  return { start, end };
}

export function toUtcIsoRange(startDate: string, endDate: string) {
  return {
    startDateTime: `${startDate}T00:00:00Z`,
    endDateTime: `${endDate}T23:59:59Z`,
  };
}

export function filterContentsForDashboard(
  contents: ContentItem[],
  filters: DashboardFilters
): ContentItem[] {
  const { start, end } = getDateRangeForPeriod(
    filters.period,
    filters.startDate,
    filters.endDate
  );

  return contents.filter((content) => {
    const date = content.scheduledDate || content.createdAt.slice(0, 10);
    if (date < start || date > end) return false;

    if (filters.channel && filters.channel !== "all") {
      if (content.channel !== filters.channel) return false;
    }

    if (filters.mediaType && filters.mediaType !== "all") {
      if (content.mediaType !== filters.mediaType) return false;
    }

    if (filters.platform && filters.platform !== "all") {
      if (!content.platforms.includes(filters.platform)) return false;
    }

    if (filters.memberId && filters.memberId !== "all") {
      const members = [
        content.createdById,
        content.ideaCreator,
        content.photographer,
        content.editor,
        ...(content.team ?? []).map((row) => row.participant),
      ]
        .filter(Boolean)
        .map(String);
      if (!members.includes(filters.memberId)) return false;
    }

    return true;
  });
}
