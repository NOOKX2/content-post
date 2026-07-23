import type { Content } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { invalidateContentsCache } from "@/lib/content/cache-tags";
import { syncContentWorkflowToCollaboration } from "@/lib/collaboration/service";
import { dispatchApprovedContentToN8n } from "@/lib/n8n/dispatch-approved-content";
import { notifyApprovalApproved } from "@/lib/notifications/events";

function logContentApproved(
  step: string,
  message: string,
  data?: Record<string, unknown>
) {
  const suffix =
    data === undefined ? "" : ` ${JSON.stringify(data, null, 2)}`;
  console.log(`[content-approved] ${step} | ${message}${suffix}`);
}

function getScheduleDebugInfo(
  scheduledDate: string | null,
  scheduledTime: string | null
) {
  if (!scheduledDate) {
    return { isDue: false, scheduledAt: null, now: new Date().toISOString() };
  }

  const time = scheduledTime || "00:00";
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  const scheduledAt = new Date(`${scheduledDate}T${normalizedTime}+07:00`);
  const now = new Date();

  return {
    scheduledAt: scheduledAt.toISOString(),
    now: now.toISOString(),
    isDue: scheduledAt.getTime() <= now.getTime(),
    msUntilDue: scheduledAt.getTime() - now.getTime(),
  };
}

export async function approveContentRecord(
  id: string,
  approverName: string
): Promise<Content> {
  const existing = await prisma.content.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Not found");
  }

  if (
    existing.status === "approved" ||
    existing.status === "scheduled" ||
    existing.status === "posting" ||
    existing.status === "posted"
  ) {
    logContentApproved("app/approve", "skip duplicate approve", {
      id: existing.id,
      contentId: existing.contentId,
      status: existing.status,
    });
    return existing;
  }

  const updated = await prisma.content.updateMany({
    where: { id, status: { in: ["pending", "rejected", "post_failed"] } },
    data: {
      status: "approved",
      approver: approverName,
    },
  });

  if (updated.count === 0) {
    const current = await prisma.content.findUnique({ where: { id } });
    if (!current) {
      throw new Error("Not found");
    }
    logContentApproved("app/approve", "skip concurrent approve", {
      id: current.id,
      contentId: current.contentId,
      status: current.status,
    });
    return current;
  }

  const record = await prisma.content.findUniqueOrThrow({ where: { id } });

  logContentApproved("app/approve", "admin approved", {
    id: record.id,
    contentId: record.contentId,
    previousStatus: existing.status,
    newStatus: record.status,
    scheduledDate: record.scheduledDate,
    scheduledTime: record.scheduledTime,
    channel: record.channel,
    platforms: record.platforms,
    schedule: getScheduleDebugInfo(record.scheduledDate, record.scheduledTime),
  });

  invalidateContentsCache(id);

  await notifyApprovalApproved(record);
  await syncContentWorkflowToCollaboration({
    content: existing,
    actorName: approverName,
    action: "approved",
  });

  const dispatched = await dispatchApprovedContentToN8n(record);
  if (dispatched) {
    const scheduled = await prisma.content.update({
      where: { id },
      data: { status: "scheduled" },
    });
    logContentApproved("app/approve", "status → scheduled (waiting for n8n/Buffer)", {
      id: scheduled.id,
      contentId: scheduled.contentId,
      status: scheduled.status,
      note: "If post time already passed, n8n should post immediately then PATCH posted",
    });
    invalidateContentsCache(id);
    return scheduled;
  }

  logContentApproved("app/approve", "WARN n8n dispatch failed — status stays approved", {
    id: record.id,
    contentId: record.contentId,
    status: record.status,
  });

  return record;
}
