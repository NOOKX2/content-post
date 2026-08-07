import type { Content } from "@prisma/client";
import { prisma } from "@/lib/shared/prisma";
import type { ApprovalCardMetadata } from "@/lib/collaboration/types";
import { ensureTeamChannel } from "@/lib/collaboration/data/channels";
import { postSystemMessage } from "@/lib/collaboration/data/messages";

async function syncApprovalCardForContent(params: {
  contentId: string;
  status: "approved" | "rejected";
  resolvedBy: string;
  rejectReason?: string;
  resolvedAt?: string;
  approvalRound?: 1 | 2;
}) {
  const teamChannel = await ensureTeamChannel();
  const resolvedAt = params.resolvedAt ?? new Date().toISOString();

  const messages = await prisma.collaborationMessage.findMany({
    where: {
      channelId: teamChannel.id,
      messageType: "approval_request",
    },
  });

  await Promise.all(
    messages
      .filter((message) => {
        const metadata = message.metadata as ApprovalCardMetadata;
        const round = metadata.approvalRound ?? 1;
        const roundMatches =
          params.approvalRound === undefined || round === params.approvalRound;
        return (
          metadata.contentId === params.contentId &&
          metadata.status === "pending" &&
          roundMatches
        );
      })
      .map((message) => {
        const metadata = message.metadata as ApprovalCardMetadata;
        const updatedMetadata: ApprovalCardMetadata = {
          ...metadata,
          status: params.status,
          resolvedBy: params.resolvedBy,
          rejectReason: params.rejectReason,
          resolvedAt,
        };
        return prisma.collaborationMessage.update({
          where: { id: message.id },
          data: { metadata: updatedMetadata },
        });
      })
  );
}


export async function postApprovalRequest(
  content: Content,
  requesterName: string,
  options?: { round?: 1 | 2 }
) {
  const teamChannel = await ensureTeamChannel();
  const round = options?.round ?? 1;
  const roundLabel = round === 1 ? "แนวคิด" : "คลิป";

  const metadata: ApprovalCardMetadata = {
    contentId: content.id,
    contentCode: content.contentId,
    contentName: content.name,
    requesterName,
    channel: content.channel,
    remarks: content.details?.slice(0, 200) || "—",
    status: "pending",
    approvalRound: round,
  };

  await prisma.collaborationMessage.create({
    data: {
      channelId: teamChannel.id,
      authorName: "Approval Bot",
      body: `คำขออนุมัติ${roundLabel}: ${content.contentId} — ${content.name}`,
      messageType: "approval_request",
      metadata,
    },
  });

  await prisma.collaborationChannel.update({
    where: { id: teamChannel.id },
    data: { updatedAt: new Date() },
  });

  await postSystemMessage({
    channelId: teamChannel.id,
    body: `${requesterName} ส่ง${roundLabel} ${content.contentId} เข้าสู่ขั้นตอนอนุมัติ`,
  });
}


export async function resolveApprovalMessage(params: {
  messageId: string;
  status: "approved" | "rejected";
  resolvedBy: string;
  rejectReason?: string;
}) {
  const message = await prisma.collaborationMessage.findUnique({
    where: { id: params.messageId },
  });
  if (!message || message.messageType !== "approval_request") {
    return null;
  }

  const metadata = message.metadata as ApprovalCardMetadata;
  const updatedMetadata: ApprovalCardMetadata = {
    ...metadata,
    status: params.status,
    resolvedBy: params.resolvedBy,
    rejectReason: params.rejectReason,
    resolvedAt: new Date().toISOString(),
  };

  return prisma.collaborationMessage.update({
    where: { id: params.messageId },
    data: { metadata: updatedMetadata },
  });
}

export async function syncContentWorkflowToCollaboration(params: {
  content: Content;
  actorName: string;
  action:
    | "submitted"
    | "clip_submitted"
    | "idea_approved"
    | "approved"
    | "rejected"
    | "updated";
  note?: string;
  approvalRound?: 1 | 2;
}) {
  const { content, actorName, action, note } = params;
  const teamChannel = await ensureTeamChannel();

  const messages: Record<typeof action, string> = {
    submitted: `${actorName} ส่งแนวคิด ${content.contentId} เพื่ออนุมัติ`,
    clip_submitted: `${actorName} ส่งคลิป ${content.contentId} เพื่ออนุมัติ`,
    idea_approved: `${actorName} อนุมัติแนวคิด ${content.contentId} แล้ว — รออัปโหลดคลิป`,
    approved: `${actorName} อนุมัติ ${content.contentId} แล้ว`,
    rejected: `${actorName} ส่งกลับแก้ไข ${content.contentId}${note ? `: ${note}` : ""}`,
    updated: `${actorName} อัปเดตรายละเอียด ${content.contentId}`,
  };

  if (action === "submitted" || action === "clip_submitted") {
    return;
  }

  if (action === "idea_approved") {
    await syncApprovalCardForContent({
      contentId: content.id,
      status: "approved",
      resolvedBy: actorName,
      approvalRound: 1,
    });
  }

  if (action === "approved" || action === "rejected") {
    const approvalRound =
      content.status === "clip_pending"
        ? 2
        : 1;

    await syncApprovalCardForContent({
      contentId: content.id,
      status: action,
      resolvedBy: actorName,
      rejectReason: action === "rejected" ? note : undefined,
      approvalRound,
    });
  }

  await postSystemMessage({
    channelId: teamChannel.id,
    body: messages[action],
  });
}

