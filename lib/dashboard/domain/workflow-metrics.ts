import type { ContentItem, ContentStatus, MediaType } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/constants";
import type {
  MediaTypeSlice,
  MemberPerformance,
  UpcomingDeadlineItem,
  WorkflowAnalytics,
  WorkflowStatusSlice,
  WorkflowTrendPoint,
} from "@/lib/dashboard/types";
import type { TaskItem } from "@/lib/collaboration/types/team";
import { formatDateKey } from "@/lib/calendar/data/content";

const MEDIA_COLORS: Record<string, string> = {
  video: "#7c3aed",
  image: "#ec4899",
  graphic: "#f97316",
  other: "#a8a29e",
};

function isInProgress(status: ContentStatus): boolean {
  return [
    "draft",
    "pending",
    "idea_approved",
    "clip_pending",
    "approved",
    "scheduled",
    "posting",
  ].includes(status);
}

function isNearDeadline(content: ContentItem, withinDays = 7): boolean {
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

function isOverdue(content: ContentItem): boolean {
  if (!content.scheduledDate) return false;
  if (content.status === "posted") return false;
  const today = formatDateKey(new Date());
  return content.scheduledDate < today && isInProgress(content.status);
}

function mediaLabel(type: MediaType | string): string {
  if (type === "video") return "วิดีโอ";
  if (type === "image") return "รูปภาพ";
  if (type === "graphic") return "กราฟิก";
  return "อื่นๆ";
}

export function buildWorkflowAnalytics(
  contents: ContentItem[],
  tasks: TaskItem[] = [],
  members: { id: string; name: string }[] = []
): WorkflowAnalytics {
  const summary = {
    total: contents.length,
    inProgress: contents.filter((c) => isInProgress(c.status)).length,
    published: contents.filter((c) => c.status === "posted").length,
    overdue: contents.filter((c) => isOverdue(c)).length,
    nearDeadline: contents.filter((c) => isNearDeadline(c)).length,
    rejected: contents.filter((c) => c.status === "rejected").length,
    todo: tasks.filter((t) => t.status === "todo").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  const statusCounts = new Map<string, number>();
  if (tasks.length > 0) {
    for (const task of tasks) {
      statusCounts.set(task.status, (statusCounts.get(task.status) ?? 0) + 1);
    }
  } else {
    for (const content of contents) {
      const bucket = content.status === "posted"
        ? "done"
        : isInProgress(content.status)
          ? "in_progress"
          : "todo";
      statusCounts.set(bucket, (statusCounts.get(bucket) ?? 0) + 1);
    }
  }

  const statusBreakdown: WorkflowStatusSlice[] = [
    {
      status: "done",
      label: "เสร็จสิ้น",
      count: statusCounts.get("done") ?? 0,
      color: "#10b981",
    },
    {
      status: "in_progress",
      label: "กำลังดำเนินการ",
      count: statusCounts.get("in_progress") ?? 0,
      color: "#f59e0b",
    },
    {
      status: "todo",
      label: "รอดำเนินการ",
      count: statusCounts.get("todo") ?? 0,
      color: "#a8a29e",
    },
  ].filter((item) => item.count > 0);

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

  const mediaCounts = new Map<string, number>();
  for (const content of contents) {
    const key = content.mediaType || "other";
    mediaCounts.set(key, (mediaCounts.get(key) ?? 0) + 1);
  }
  const mediaTotal = contents.length || 1;
  const mediaTypeBreakdown: MediaTypeSlice[] = [...mediaCounts.entries()]
    .map(([key, count]) => ({
      key,
      label: mediaLabel(key),
      count,
      percent: Math.round((count / mediaTotal) * 100),
      color: MEDIA_COLORS[key] ?? MEDIA_COLORS.other,
    }))
    .sort((a, b) => b.count - a.count);

  const memberMap = new Map<string, MemberPerformance>();
  const ensureMember = (id: string, name: string) => {
    if (!memberMap.has(id)) {
      memberMap.set(id, { memberId: id, name, done: 0, inProgress: 0, todo: 0 });
    }
    return memberMap.get(id)!;
  };

  for (const member of members) {
    ensureMember(member.id, member.name);
  }

  if (tasks.length > 0) {
    for (const task of tasks) {
      if (!task.assigneeId) continue;
      const row = ensureMember(task.assigneeId, task.assigneeName || "—");
      if (task.status === "done") row.done += 1;
      else if (task.status === "in_progress") row.inProgress += 1;
      else row.todo += 1;
    }
  } else {
    for (const content of contents) {
      const name =
        content.ideaCreator ||
        content.editor ||
        content.photographer ||
        "ไม่ระบุ";
      const id = content.createdById || name;
      const row = ensureMember(id, name);
      if (content.status === "posted") row.done += 1;
      else if (isInProgress(content.status)) row.inProgress += 1;
      else row.todo += 1;
    }
  }

  const memberPerformance = [...memberMap.values()]
    .filter((m) => m.done + m.inProgress + m.todo > 0)
    .sort(
      (a, b) =>
        b.done + b.inProgress + b.todo - (a.done + a.inProgress + a.todo)
    )
    .slice(0, 8);

  const upcomingFromTasks: UpcomingDeadlineItem[] = tasks
    .filter((task) => task.dueDate && task.status !== "done")
    .map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      statusLabel:
        task.status === "in_progress" ? "กำลังดำเนินการ" : "รอดำเนินการ",
      priority: task.priority,
      dueDate: task.dueDate,
      assigneeName: task.assigneeName || "—",
      assigneeId: task.assigneeId,
    }));

  const upcomingFromContents: UpcomingDeadlineItem[] = contents
    .filter((c) => isNearDeadline(c, 14) || isOverdue(c))
    .map((c) => ({
      id: c.id,
      title: c.name,
      status: c.status,
      statusLabel: STATUS_LABELS[c.status]?.label ?? c.status,
      dueDate: c.scheduledDate,
      assigneeName: c.ideaCreator || c.editor || "—",
      assigneeId: c.createdById ?? null,
    }));

  const upcomingDeadlines = [
    ...(tasks.length > 0 ? upcomingFromTasks : upcomingFromContents),
  ]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 6);

  const trend = buildWeeklyTrend(contents);

  return {
    summary,
    statusBreakdown,
    channelBreakdown,
    mediaTypeBreakdown,
    memberPerformance,
    upcomingDeadlines,
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
