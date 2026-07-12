import type { Content } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ApprovalCardMetadata } from "@/lib/collaboration/types";

const TEAM_CHANNEL_SLUG = "team-content";

export async function ensureTeamChannel() {
  return prisma.collaborationChannel.upsert({
    where: { slug: TEAM_CHANNEL_SLUG },
    create: {
      slug: TEAM_CHANNEL_SLUG,
      name: "ทีม Content",
    },
    update: {},
  });
}

export async function ensureContentChannel(content: Pick<Content, "id" | "contentId" | "name">) {
  const slug = `content-${content.contentId.toLowerCase()}`;
  return prisma.collaborationChannel.upsert({
    where: { slug },
    create: {
      slug,
      name: content.name,
      contentId: content.id,
    },
    update: {
      name: content.name,
    },
  });
}

export async function listChannels() {
  await ensureTeamChannel();

  const channels = await prisma.collaborationChannel.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      content: { select: { contentId: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, messageType: true, createdAt: true, metadata: true },
      },
    },
  });

  return channels.map((channel) => {
    const last = channel.messages[0];
    let preview = last?.body ?? null;
    if (last?.messageType === "approval_request") {
      preview = "คำขออนุมัติ Content";
    } else if (last?.messageType === "meeting") {
      preview = "นัดประชุม";
    } else if (last?.messageType === "system") {
      preview = last.body;
    }

    return {
      id: channel.id,
      slug: channel.slug,
      name: channel.name,
      contentId: channel.contentId,
      contentCode: channel.content?.contentId,
      lastMessageAt: last?.createdAt.toISOString() ?? null,
      lastMessagePreview: preview,
    };
  });
}

export async function getChannelMessages(channelId: string, limit = 80) {
  return prisma.collaborationMessage.findMany({
    where: { channelId },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
}

export async function postTextMessage(params: {
  channelId: string;
  authorId: string;
  authorName: string;
  body: string;
}) {
  const message = await prisma.collaborationMessage.create({
    data: {
      channelId: params.channelId,
      authorId: params.authorId,
      authorName: params.authorName,
      body: params.body.trim(),
      messageType: "text",
    },
  });

  await prisma.collaborationChannel.update({
    where: { id: params.channelId },
    data: { updatedAt: new Date() },
  });

  return message;
}

export async function postSystemMessage(params: {
  channelId: string;
  body: string;
}) {
  return prisma.collaborationMessage.create({
    data: {
      channelId: params.channelId,
      authorName: "ระบบ",
      body: params.body,
      messageType: "system",
    },
  });
}

export async function postApprovalRequest(
  content: Content,
  requesterName: string
) {
  const teamChannel = await ensureTeamChannel();
  const contentChannel = await ensureContentChannel(content);

  const metadata: ApprovalCardMetadata = {
    contentId: content.id,
    contentCode: content.contentId,
    contentName: content.name,
    requesterName,
    channel: content.channel,
    remarks: content.details?.slice(0, 200) || "—",
    status: "pending",
  };

  const cardData = {
    channelId: "",
    authorName: "Approval Bot",
    body: `คำขออนุมัติ: ${content.contentId} — ${content.name}`,
    messageType: "approval_request" as const,
    metadata,
  };

  for (const channelId of [teamChannel.id, contentChannel.id]) {
    await prisma.collaborationMessage.create({
      data: { ...cardData, channelId, metadata },
    });
    await prisma.collaborationChannel.update({
      where: { id: channelId },
      data: { updatedAt: new Date() },
    });
  }

  await postSystemMessage({
    channelId: teamChannel.id,
    body: `${requesterName} ส่งงาน ${content.contentId} เข้าสู่ขั้นตอนอนุมัติ`,
  });
}

export async function postMeetingMessage(params: {
  channelId: string;
  authorId: string;
  authorName: string;
  title: string;
  meetUrl: string;
  startsAt: string;
  endsAt: string;
}) {
  const message = await prisma.collaborationMessage.create({
    data: {
      channelId: params.channelId,
      authorId: params.authorId,
      authorName: params.authorName,
      body: `นัดประชุม: ${params.title}`,
      messageType: "meeting",
      metadata: {
        title: params.title,
        meetUrl: params.meetUrl,
        startsAt: params.startsAt,
        endsAt: params.endsAt,
      },
    },
  });

  await prisma.collaborationChannel.update({
    where: { id: params.channelId },
    data: { updatedAt: new Date() },
  });

  return message;
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
  };

  return prisma.collaborationMessage.update({
    where: { id: params.messageId },
    data: { metadata: updatedMetadata },
  });
}

export async function syncContentWorkflowToCollaboration(params: {
  content: Content;
  actorName: string;
  action: "submitted" | "approved" | "rejected" | "updated";
  note?: string;
}) {
  const { content, actorName, action, note } = params;
  const contentChannel = await ensureContentChannel(content);
  const teamChannel = await ensureTeamChannel();

  const messages: Record<typeof action, string> = {
    submitted: `${actorName} ส่งงาน ${content.contentId} เพื่ออนุมัติ`,
    approved: `${actorName} อนุมัติ ${content.contentId} แล้ว`,
    rejected: `${actorName} ส่งกลับแก้ไข ${content.contentId}${note ? `: ${note}` : ""}`,
    updated: `${actorName} อัปเดตรายละเอียด ${content.contentId}`,
  };

  for (const channelId of [contentChannel.id, teamChannel.id]) {
    await postSystemMessage({ channelId, body: messages[action] });
  }
}
