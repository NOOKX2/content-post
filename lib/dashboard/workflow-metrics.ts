import type { ContentItem, ContentStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/constants";
import type {
  WorkflowAnalytics,
  WorkflowStatusSlice,
  WorkflowTrendPoint,
} from "@/lib/dashboard/types";
import { formatDateKey } from "@/lib/calendar/content";

const STATUS_COLORS: Record<ContentStatus, string> = {
  draft: "#a8a29e",
  pending: "#f59e0b",
  approved: "#3b82f6",
  scheduled: "#8b5cf6",
  posting: "#f59e0b",
  posted: "#10b981",
  post_failed: "#ef4444",
  rejected: "#ef4444",
};

function isInProgress(status: ContentStatus): boolean {
  return ["draft", "pending", "approved", "scheduled", "posting"].includes(
    status
  );
}

function isNearDeadline(content: ContentItem, withinDays = 1): boolean {
  if (!content.scheduledDate) return false;
  if (!isInProgress(content.status) && content.status !== "rejected") {
    return false;
  }

  const today = new Date();
  const deadline = new Date(`${content.scheduledDate}T12:00:00`);
  const diffMs = deadline.getTime() - today.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= withinDays;
}

export function buildWorkflowAnalytics(
  contents: ContentItem[]
): WorkflowAnalytics {
  const summary = {
    total: contents.length,
    inProgress: contents.filter((c) => isInProgress(c.status)).length,
    published: contents.filter((c) => c.status === "posted").length,
    nearDeadline: contents.filter((c) => isNearDeadline(c)).length,
    rejected: contents.filter((c) => c.status === "rejected").length,
  };

  const statusCounts = new Map<ContentStatus, number>();
  for (const content of contents) {
    statusCounts.set(content.status, (statusCounts.get(content.status) ?? 0) + 1);
  }

  const statusBreakdown: WorkflowStatusSlice[] = (
    Object.keys(STATUS_LABELS) as ContentStatus[]
  )
    .map((status) => ({
      status,
      label: STATUS_LABELS[status].label,
      count: statusCounts.get(status) ?? 0,
      color: STATUS_COLORS[status],
    }))
    .filter((item) => item.count > 0);

  const channelCounts = new Map<string, number>();
  for (const content of contents) {
    channelCounts.set(
      content.channel,
      (channelCounts.get(content.channel) ?? 0) + 1
    );
  }

  const channelBreakdown = [...channelCounts.entries()]
    .map(([channel, count]) => ({ channel, count }))
    .sort((a, b) => b.count - a.count);

  const trend = buildWeeklyTrend(contents);

  return {
    summary,
    statusBreakdown,
    channelBreakdown,
    trend,
  };
}

function buildWeeklyTrend(contents: ContentItem[]): WorkflowTrendPoint[] {
  const buckets = new Map<string, { created: number; published: number }>();

  for (const content of contents) {
    const createdKey = formatDateKey(new Date(content.createdAt));
    const bucket = buckets.get(createdKey) ?? { created: 0, published: 0 };
    bucket.created += 1;
    buckets.set(createdKey, bucket);

    if (content.status === "posted" && content.scheduledDate) {
      const publishedKey = content.scheduledDate;
      const publishedBucket = buckets.get(publishedKey) ?? {
        created: 0,
        published: 0,
      };
      publishedBucket.published += 1;
      buckets.set(publishedKey, publishedBucket);
    }
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([label, values]) => ({ label, ...values }));
}
