import type { Content, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ApprovalCardMetadata } from "@/lib/collaboration/types";

const TEAM_CHANNEL_SLUG = "team-content";

function isTeamChannel(slug: string) {
  return slug === TEAM_CHANNEL_SLUG;
}

function isDmChannel(slug: string) {
  return slug.startsWith("dm-");
}

function dmSlug(userIdA: string, userIdB: string) {
  const [a, b] = [userIdA, userIdB].sort();
  return `dm-${a}-${b}`;
}

/** Parse peer user id from slug `dm-{idA}-{idB}` (ids sorted lexicographically). */
function peerIdFromDmSlug(slug: string, userId: string): string | null {
  if (!isDmChannel(slug)) return null;
  const rest = slug.slice(3); // remove "dm-"
  if (rest.startsWith(`${userId}-`)) {
    return rest.slice(userId.length + 1);
  }
  if (rest.endsWith(`-${userId}`)) {
    return rest.slice(0, -(userId.length + 1));
  }
  return null;
}

function userIsDmParticipant(slug: string, userId: string) {
  return peerIdFromDmSlug(slug, userId) !== null;
}

export async function ensureTeamChannel() {
  return prisma.collaborationChannel.upsert({
    where: { slug: TEAM_CHANNEL_SLUG },
    create: {
      slug: TEAM_CHANNEL_SLUG,
      name: "ทีม Content",
    },
    update: {
      name: "ทีม Content",
    },
  });
}

export async function ensureDmChannel(params: {
  currentUser: Pick<User, "id" | "name">;
  otherUser: Pick<User, "id" | "name">;
}) {
  if (params.currentUser.id === params.otherUser.id) {
    throw new Error("ไม่สามารถแชทกับตัวเองได้");
  }

  const slug = dmSlug(params.currentUser.id, params.otherUser.id);

  return prisma.collaborationChannel.upsert({
    where: { slug },
    create: {
      slug,
      name: params.otherUser.name,
    },
    update: {
      name: params.otherUser.name,
    },
  });
}

export async function listChannels(userId: string) {
  await ensureTeamChannel();

  const channels = await prisma.collaborationChannel.findMany({
    where: {
      contentId: null,
      OR: [
        { slug: TEAM_CHANNEL_SLUG },
        { slug: { startsWith: "dm-" } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          body: true,
          messageType: true,
          createdAt: true,
          metadata: true,
        },
      },
    },
  });

  const visible = channels.filter(
    (channel) =>
      isTeamChannel(channel.slug) ||
      (isDmChannel(channel.slug) && userIsDmParticipant(channel.slug, userId))
  );

  const dmPartnerIds = visible
    .map((channel) => peerIdFromDmSlug(channel.slug, userId))
    .filter((id): id is string => Boolean(id));

  const partners = dmPartnerIds.length
    ? await prisma.user.findMany({
        where: { id: { in: [...new Set(dmPartnerIds)] } },
        select: { id: true, name: true, email: true },
      })
    : [];
  const partnerById = new Map(
    partners.map((user) => [user.id, user] as const)
  );

  return visible
    .map((channel) => {
      const last = channel.messages[0];
      let preview = last?.body ?? null;
      if (last?.messageType === "approval_request") {
        preview = "คำขออนุมัติ Content";
      } else if (last?.messageType === "meeting") {
        preview = "นัดประชุม";
      } else if (last?.messageType === "system") {
        preview = last.body;
      }

      const kind = isDmChannel(channel.slug) ? ("dm" as const) : ("team" as const);
      const partnerId = peerIdFromDmSlug(channel.slug, userId);
      const partner = partnerId ? partnerById.get(partnerId) : undefined;

      return {
        id: channel.id,
        slug: channel.slug,
        name: kind === "dm" && partner ? partner.name : channel.name,
        kind,
        contentId: null,
        contentCode: undefined,
        peerUserId: partnerId,
        peerEmail: partner?.email ?? null,
        lastMessageAt: last?.createdAt.toISOString() ?? null,
        lastMessagePreview: preview,
      };
    })
    .sort((a, b) => {
      if (a.kind === "team" && b.kind !== "team") return -1;
      if (b.kind === "team" && a.kind !== "team") return 1;
      return (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? "");
    });
}

export async function getChannelMessages(channelId: string, limit = 80) {
  return prisma.collaborationMessage.findMany({
    where: { channelId },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
}

export async function assertCanAccessChannel(
  channelId: string,
  userId: string
): Promise<boolean> {
  const channel = await prisma.collaborationChannel.findUnique({
    where: { id: channelId },
  });
  if (!channel) return false;
  if (isTeamChannel(channel.slug)) return true;
  if (isDmChannel(channel.slug)) {
    return userIsDmParticipant(channel.slug, userId);
  }
  return false;
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

  const metadata: ApprovalCardMetadata = {
    contentId: content.id,
    contentCode: content.contentId,
    contentName: content.name,
    requesterName,
    channel: content.channel,
    remarks: content.details?.slice(0, 200) || "—",
    status: "pending",
  };

  await prisma.collaborationMessage.create({
    data: {
      channelId: teamChannel.id,
      authorName: "Approval Bot",
      body: `คำขออนุมัติ: ${content.contentId} — ${content.name}`,
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
  const teamChannel = await ensureTeamChannel();

  const messages: Record<typeof action, string> = {
    submitted: `${actorName} ส่งงาน ${content.contentId} เพื่ออนุมัติ`,
    approved: `${actorName} อนุมัติ ${content.contentId} แล้ว`,
    rejected: `${actorName} ส่งกลับแก้ไข ${content.contentId}${note ? `: ${note}` : ""}`,
    updated: `${actorName} อัปเดตรายละเอียด ${content.contentId}`,
  };

  // submitted already posts via postApprovalRequest — skip duplicate system line
  if (action === "submitted") {
    return;
  }

  await postSystemMessage({
    channelId: teamChannel.id,
    body: messages[action],
  });
}
