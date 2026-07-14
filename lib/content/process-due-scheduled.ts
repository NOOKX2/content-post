import type { Content } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { dispatchApprovedContentToN8n } from "@/lib/n8n/dispatch-approved-content";
import { isContentDue, parseScheduledAt } from "@/lib/content/scheduled";
import { logPipeline } from "@/lib/content/pipeline-log";

const RETRY_GRACE_MS = 2 * 60 * 1000;

function logProcessDue(message: string, data?: Record<string, unknown>) {
  const suffix =
    data === undefined ? "" : ` ${JSON.stringify(data, null, 2)}`;
  console.log(`[content-approved] app/process-due | ${message}${suffix}`);
}

export function shouldRetryScheduledPost(
  content: Content,
  now = new Date()
): boolean {
  if (content.status !== "scheduled" && content.status !== "posting") {
    return false;
  }
  if (!content.scheduledDate || !content.scheduledTime) return false;
  if (!isContentDue(content, now)) return false;

  const scheduledAt = parseScheduledAt(
    content.scheduledDate,
    content.scheduledTime
  );
  return now.getTime() >= scheduledAt.getTime() + RETRY_GRACE_MS;
}

export async function processDueScheduledContent() {
  const records = await prisma.content.findMany({
    where: { status: { in: ["scheduled", "posting"] } },
    orderBy: [{ scheduledDate: "asc" }, { scheduledTime: "asc" }],
  });

  const dueForRetry = records.filter((record) => shouldRetryScheduledPost(record));

  const overdue = records.filter((record) => {
    if (!record.scheduledDate || !record.scheduledTime) return false;
    return (
      parseScheduledAt(record.scheduledDate, record.scheduledTime).getTime() <
      Date.now()
    );
  });

  logProcessDue("scan complete", {
    scheduledCount: records.length,
    overdueCount: overdue.length,
    retryCount: dueForRetry.length,
    contentIds: dueForRetry.map((r) => r.contentId),
  });
  logPipeline("process-due", "scan", {
    scheduledOrPosting: records.length,
    overdue: overdue.map((r) => ({
      contentId: r.contentId,
      status: r.status,
      scheduledDate: r.scheduledDate,
      scheduledTime: r.scheduledTime,
    })),
    willRetry: dueForRetry.map((r) => r.contentId),
  });

  const results: {
    contentId: string;
    id: string;
    dispatched: boolean;
  }[] = [];

  for (const record of dueForRetry) {
    logProcessDue("retry dispatch", {
      contentId: record.contentId,
      id: record.id,
      scheduledDate: record.scheduledDate,
      scheduledTime: record.scheduledTime,
    });

    const dispatched = await dispatchApprovedContentToN8n(record);
    results.push({
      contentId: record.contentId,
      id: record.id,
      dispatched,
    });
  }

  return {
    scanned: records.length,
    retried: dueForRetry.length,
    results,
  };
}
