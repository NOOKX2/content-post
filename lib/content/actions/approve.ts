import type { Content } from "@prisma/client";
import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/shared/prisma";
import { invalidateContentsCache } from "@/lib/content/data/cache-tags";
import { CONTENTS_CACHE_TAG } from "@/lib/content/data/cache-tags";
import { syncContentWorkflowToCollaboration } from "@/lib/collaboration/data/service";
import { dispatchApprovedContentToN8n } from "@/lib/integrations/n8n/dispatch-approved-content";
import { notifyApprovalApproved, notifyIdeaApproved } from "@/lib/notifications/domain/events";
import { isVideoAttachmentUrl } from "@/lib/content/domain/media-url";

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

function hasFinalVideoAttachment(attachments: string[]): boolean {
  return attachments
    .filter((url) => url.trim())
    .some((url) => isVideoAttachmentUrl(url));
}

async function approveIdeaRecord(
  existing: Content,
  approverName: string
): Promise<Content> {
  const updated = await prisma.content.updateMany({
    where: { id: existing.id, status: { in: ["pending", "rejected"] } },
    data: {
      status: "idea_approved",
      approver: approverName,
    },
  });

  if (updated.count === 0) {
    const current = await prisma.content.findUnique({
      where: { id: existing.id },
    });
    if (!current) {
      throw new Error("Not found");
    }
    return current;
  }

  const record = await prisma.content.findUniqueOrThrow({
    where: { id: existing.id },
  });

  logContentApproved("app/approve", "idea approved (round 1)", {
    id: record.id,
    contentId: record.contentId,
    previousStatus: existing.status,
    newStatus: record.status,
  });

  invalidateContentsCache(record.id);

  await notifyIdeaApproved(record);
  await syncContentWorkflowToCollaboration({
    content: existing,
    actorName: approverName,
    action: "idea_approved",
  });

  return record;
}

async function finalizeApprovalRecord(
  existing: Content,
  approverName: string
): Promise<Content> {
  const updated = await prisma.content.updateMany({
    where: {
      id: existing.id,
      status: { in: ["pending", "clip_pending", "rejected", "post_failed"] },
    },
    data: {
      status: "approved",
      approver: approverName,
    },
  });

  if (updated.count === 0) {
    const current = await prisma.content.findUnique({
      where: { id: existing.id },
    });
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

  const record = await prisma.content.findUniqueOrThrow({
    where: { id: existing.id },
  });

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

  invalidateContentsCache(record.id);

  await notifyApprovalApproved(record);
  await syncContentWorkflowToCollaboration({
    content: existing,
    actorName: approverName,
    action: "approved",
  });

  const dispatched = await dispatchApprovedContentToN8n(record);
  if (dispatched) {
    const scheduled = await prisma.content.update({
      where: { id: existing.id },
      data: { status: "scheduled" },
    });
    logContentApproved("app/approve", "status → scheduled (waiting for n8n/Buffer)", {
      id: scheduled.id,
      contentId: scheduled.contentId,
      status: scheduled.status,
      note: "If post time already passed, n8n should post immediately then PATCH posted",
    });
    invalidateContentsCache(scheduled.id);
    updateTag(CONTENTS_CACHE_TAG);
    return scheduled;
  }

  logContentApproved("app/approve", "WARN n8n dispatch failed — status stays approved", {
    id: record.id,
    contentId: record.contentId,
    status: record.status,
  });

  return record;
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

  if (existing.mediaType === "video") {
    if (existing.status === "pending") {
      if (hasFinalVideoAttachment(existing.attachments)) {
        return finalizeApprovalRecord(existing, approverName);
      }
      return approveIdeaRecord(existing, approverName);
    }

    if (existing.status === "clip_pending") {
      return finalizeApprovalRecord(existing, approverName);
    }

    if (
      existing.status === "idea_approved" &&
      hasFinalVideoAttachment(existing.attachments)
    ) {
      return finalizeApprovalRecord(existing, approverName);
    }
  }

  if (
    existing.status === "pending" ||
    existing.status === "rejected" ||
    existing.status === "post_failed"
  ) {
    return finalizeApprovalRecord(existing, approverName);
  }

  logContentApproved("app/approve", "skip approve for status", {
    id: existing.id,
    contentId: existing.contentId,
    status: existing.status,
  });
  return existing;
}
