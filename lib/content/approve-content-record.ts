import type { Content } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { syncContentWorkflowToCollaboration } from "@/lib/collaboration/service";
import { dispatchApprovedContentToN8n } from "@/lib/n8n/dispatch-approved-content";
import { notifyApprovalApproved } from "@/lib/notifications/events";

export async function approveContentRecord(
  id: string,
  approverName: string
): Promise<Content> {
  const existing = await prisma.content.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Not found");
  }

  const record = await prisma.content.update({
    where: { id },
    data: {
      status: "approved",
      approver: approverName,
    },
  });

  console.log("[content-approved] admin approved", {
    id: record.id,
    contentId: record.contentId,
    scheduledDate: record.scheduledDate,
    scheduledTime: record.scheduledTime,
    channel: record.channel,
    platforms: record.platforms,
  });

  await notifyApprovalApproved(record);
  await syncContentWorkflowToCollaboration({
    content: existing,
    actorName: approverName,
    action: "approved",
  });

  const dispatched = await dispatchApprovedContentToN8n(record);
  if (dispatched) {
    console.log("[content-approved] n8n accepted webhook → status scheduled", {
      id: record.id,
      contentId: record.contentId,
    });
    return prisma.content.update({
      where: { id },
      data: { status: "scheduled" },
    });
  }

  console.warn("[content-approved] n8n dispatch failed — status stays approved", {
    id: record.id,
    contentId: record.contentId,
  });

  return record;
}
