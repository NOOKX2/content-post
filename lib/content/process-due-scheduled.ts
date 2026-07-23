import type { Content } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { dispatchApprovedContentToN8n } from "@/lib/n8n/dispatch-approved-content";
import { isContentDue, parseScheduledAt } from "@/lib/content/scheduled";
import { logPipeline } from "@/lib/content/pipeline-log";
import { markPostFailedRecord } from "@/lib/content/mark-post-failed";

const RETRY_GRACE_MS = 2 * 60 * 1000;
/** After scheduled time + this window, stuck scheduled/posting is marked failed. */
const POST_STUCK_TIMEOUT_MS = 30 * 60 * 1000;

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

export function shouldMarkPostStuckFailed(
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
  return now.getTime() >= scheduledAt.getTime() + POST_STUCK_TIMEOUT_MS;
}

export async function processDueScheduledContent() {
  const records = await prisma.content.findMany({
    where: { status: { in: ["scheduled", "posting"] } },
    orderBy: [{ scheduledDate: "asc" }, { scheduledTime: "asc" }],
  });

  const dueForRetry = records.filter((record) => shouldRetryScheduledPost(record));

  const stuckFailed = records.filter((record) =>
    shouldMarkPostStuckFailed(record)
  );

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
    stuckFailedCount: stuckFailed.length,
    contentIds: dueForRetry.map((r) => r.contentId),
    stuckFailedIds: stuckFailed.map((r) => r.contentId),
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
    willMarkFailed: stuckFailed.map((r) => ({
      contentId: r.contentId,
      status: r.status,
    })),
  });

  const failedResults: { contentId: string; id: string }[] = [];

  for (const record of stuckFailed) {
    const minutesPastDue = Math.round(
      (Date.now() -
        parseScheduledAt(record.scheduledDate!, record.scheduledTime!).getTime()) /
        60000
    );

    logProcessDue("mark stuck post as failed", {
      contentId: record.contentId,
      id: record.id,
      status: record.status,
      minutesPastDue,
    });

    await markPostFailedRecord(record.id, {
      postError: `โพสต์ค้างสถานะ "${record.status}" เกิน ${minutesPastDue} นาทีหลังเวลาที่กำหนด — ระบบหยุด retry อัตโนมัติ กรุณาตรวจสอบ n8n / Buffer logs`,
      source: "process-due",
      step: "timeout",
      details: {
        minutesPastDue,
        stuckStatus: record.status,
        timeoutMs: POST_STUCK_TIMEOUT_MS,
      },
    });

    failedResults.push({ contentId: record.contentId, id: record.id });
  }

  const retryCandidates = dueForRetry.filter(
    (record) => !stuckFailed.some((stuck) => stuck.id === record.id)
  );

  const results: {
    contentId: string;
    id: string;
    dispatched: boolean;
  }[] = [];

  for (const record of retryCandidates) {
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
    retried: retryCandidates.length,
    markedFailed: failedResults.length,
    results,
    failedResults,
  };
}
