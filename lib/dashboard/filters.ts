import type { ContentItem } from "@/lib/types";
import type { DashboardFilters, DashboardPeriod } from "@/lib/dashboard/types";
import { formatDateKey } from "@/lib/calendar/content";

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

  if (period === "day") {
    return { start: end, end };
  }

  if (period === "month") {
    const start = formatDateKey(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );
    return { start, end };
  }

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

    return true;
  });
}
