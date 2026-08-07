import { NextResponse } from "next/server";
import { prisma } from "@/lib/shared/prisma";
import { requireAdmin, verifyN8nApiKey } from "@/lib/shared/api-auth";
import { parseScheduledAt } from "@/lib/content/posting/scheduled";
import { logPipeline } from "@/lib/content/posting/pipeline-log";

/**
 * Debug stuck "scheduled" content on production.
 * Auth: admin session OR x-api-key (N8N_API_KEY)
 *
 * GET /api/debug/content-pipeline
 * Filter Vercel logs: [content-pipeline]
 */
export async function GET(request: Request) {
  const isN8n = verifyN8nApiKey(request);
  if (!isN8n) {
    const adminResult = await requireAdmin();
    if ("error" in adminResult) return adminResult.error;
  }

  const now = new Date();
  const records = await prisma.content.findMany({
    where: {
      status: { in: ["approved", "scheduled", "posting"] },
    },
    orderBy: [{ scheduledDate: "asc" }, { scheduledTime: "asc" }],
  });

  const items = records.map((record) => {
    const scheduledAt =
      record.scheduledDate && record.scheduledTime
        ? parseScheduledAt(record.scheduledDate, record.scheduledTime)
        : null;
    const msOverdue = scheduledAt
      ? now.getTime() - scheduledAt.getTime()
      : null;
    const isOverdue = msOverdue !== null && msOverdue > 0;

    return {
      id: record.id,
      contentId: record.contentId,
      name: record.name,
      status: record.status,
      channel: record.channel,
      platforms: record.platforms,
      scheduledDate: record.scheduledDate,
      scheduledTime: record.scheduledTime,
      scheduledAt: scheduledAt?.toISOString() ?? null,
      isOverdue,
      minutesOverdue:
        msOverdue !== null && msOverdue > 0
          ? Math.round(msOverdue / 60000)
          : 0,
      hint:
        record.status === "approved"
          ? "n8n webhook not accepted on approve — check N8N_CONTENT_APPROVED_WEBHOOK_URL"
          : record.status === "scheduled" && isOverdue
            ? "Past schedule but n8n never PATCHed posting/posted — check n8n Executions + APP_PUBLIC_URL + re-import workflow"
            : record.status === "posting"
              ? "Buffer step may still be running or Mark Posted failed"
              : "Waiting for scheduled time",
    };
  });

  const overdueScheduled = items.filter(
    (item) => item.status === "scheduled" && item.isOverdue
  );

  logPipeline("debug", "pipeline snapshot", {
    now: now.toISOString(),
    totalInPipeline: items.length,
    overdueScheduledCount: overdueScheduled.length,
    overdueContentIds: overdueScheduled.map((item) => item.contentId),
    items,
    howToReadVercelLogs: {
      approveFlow: "[content-approved]",
      statusFromN8n: "[content-pipeline] PATCH from n8n",
      admin403: "[admin-auth] Forbidden",
      n8nKeyMismatch: "[n8n-auth] Unauthorized",
      note: "If status stuck at scheduled and NO [content-pipeline] PATCH logs appear, n8n never reached Vercel (still calling http://app:3000 or workflow errored).",
    },
  });

  return NextResponse.json({
    now: now.toISOString(),
    totalInPipeline: items.length,
    overdueScheduledCount: overdueScheduled.length,
    items,
  });
}
