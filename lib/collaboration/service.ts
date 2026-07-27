import { randomUUID } from "crypto";
import type { Content, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ApprovalCardMetadata } from "@/lib/collaboration/types";
import {
  createCalendarMeeting,
  isGoogleCalendarConfigured,
} from "@/lib/google/calendar";

const TEAM_CHANNEL_SLUG = "team-content";

function isTeamChannel(slug: string) {
  return slug === TEAM_CHANNEL_SLUG;
}

function isDmChannel(slug: string) {
  return slug.startsWith("dm-");
}

function isGroupChannel(slug: string) {
  return slug.startsWith("group-");
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

export async function createGroupChannel(params: {
  name: string;
  memberIds: string[];
  creator: Pick<User, "id" | "name">;
}) {
  const name = params.name.trim();
  if (!name) {
    throw new Error("กรุณาตั้งชื่อกลุ่ม");
  }

  const memberIds = [
    ...new Set(
      [params.creator.id, ...params.memberIds].filter(
        (id): id is string => Boolean(id)
      )
    ),
  ];

  if (memberIds.length < 2) {
    throw new Error("กรุณาเลือกสมาชิกอย่างน้อย 1 คน");
  }

  const existingUsers = await prisma.user.findMany({
    where: { id: { in: memberIds } },
    select: { id: true },
  });
  if (existingUsers.length !== memberIds.length) {
    throw new Error("มีสมาชิกบางคนไม่พบในระบบ");
  }

  const channel = await prisma.collaborationChannel.create({
    data: {
      slug: `group-${randomUUID()}`,
      name,
      createdById: params.creator.id,
      members: {
        create: memberIds.map((userId) => ({ userId })),
      },
    },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  await postSystemMessage({
    channelId: channel.id,
    body: `${params.creator.name} สร้างกลุ่ม "${name}"`,
  });

  return channel;
}

export async function listGroupMembers(channelId: string) {
  const channel = await prisma.collaborationChannel.findUnique({
    where: { id: channelId },
    select: { slug: true, createdById: true },
  });
  if (!channel || !isGroupChannel(channel.slug)) {
    throw new Error("ไม่พบกลุ่ม");
  }

  const members = await prisma.collaborationChannelMember.findMany({
    where: { channelId },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return members.map((member) => ({
    id: member.user.id,
    name: member.user.name,
    email: member.user.email,
    isCreator: member.user.id === channel.createdById,
    joinedAt: member.createdAt.toISOString(),
  }));
}

export async function addGroupMembers(params: {
  channelId: string;
  memberIds: string[];
  actor: Pick<User, "id" | "name">;
}) {
  const channel = await prisma.collaborationChannel.findUnique({
    where: { id: params.channelId },
    select: { slug: true },
  });
  if (!channel || !isGroupChannel(channel.slug)) {
    throw new Error("ไม่พบกลุ่ม");
  }

  const requestedIds = [...new Set(params.memberIds.filter(Boolean))];
  if (requestedIds.length === 0) {
    throw new Error("กรุณาเลือกสมาชิกที่ต้องการเชิญ");
  }

  const existingMembers = await prisma.collaborationChannelMember.findMany({
    where: { channelId: params.channelId, userId: { in: requestedIds } },
    select: { userId: true },
  });
  const alreadyMemberIds = new Set(existingMembers.map((m) => m.userId));
  const newIds = requestedIds.filter((id) => !alreadyMemberIds.has(id));

  if (newIds.length === 0) {
    throw new Error("สมาชิกที่เลือกอยู่ในกลุ่มแล้ว");
  }

  const newUsers = await prisma.user.findMany({
    where: { id: { in: newIds } },
    select: { id: true, name: true },
  });
  if (newUsers.length !== newIds.length) {
    throw new Error("มีสมาชิกบางคนไม่พบในระบบ");
  }

  await prisma.collaborationChannelMember.createMany({
    data: newIds.map((userId) => ({ channelId: params.channelId, userId })),
    skipDuplicates: true,
  });

  await postSystemMessage({
    channelId: params.channelId,
    body: `${params.actor.name} เพิ่ม ${newUsers
      .map((user) => user.name)
      .join(", ")} เข้ากลุ่ม`,
  });

  return newUsers;
}

export async function leaveGroupChannel(params: {
  channelId: string;
  user: Pick<User, "id" | "name">;
}) {
  const channel = await prisma.collaborationChannel.findUnique({
    where: { id: params.channelId },
    select: { slug: true },
  });
  if (!channel || !isGroupChannel(channel.slug)) {
    throw new Error("ไม่พบกลุ่ม");
  }

  const membership = await prisma.collaborationChannelMember.findUnique({
    where: {
      channelId_userId: { channelId: params.channelId, userId: params.user.id },
    },
  });
  if (!membership) {
    throw new Error("คุณไม่ได้อยู่ในกลุ่มนี้");
  }

  await prisma.collaborationChannelMember.delete({
    where: {
      channelId_userId: { channelId: params.channelId, userId: params.user.id },
    },
  });

  await prisma.collaborationChannelRead.deleteMany({
    where: { channelId: params.channelId, userId: params.user.id },
  });

  const remaining = await prisma.collaborationChannelMember.count({
    where: { channelId: params.channelId },
  });

  if (remaining === 0) {
    await prisma.collaborationChannel.delete({
      where: { id: params.channelId },
    });
    return;
  }

  await postSystemMessage({
    channelId: params.channelId,
    body: `${params.user.name} ออกจากกลุ่ม`,
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
        {
          slug: { startsWith: "group-" },
          members: { some: { userId } },
        },
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
          deletedAt: true,
        },
      },
      reads: {
        where: { userId },
        take: 1,
        select: { lastReadAt: true },
      },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  const visible = channels.filter(
    (channel) =>
      isTeamChannel(channel.slug) ||
      isGroupChannel(channel.slug) ||
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

  const unreadCounts = await Promise.all(
    visible.map(async (channel) => {
      const lastReadAt = channel.reads[0]?.lastReadAt;
      const count = await prisma.collaborationMessage.count({
        where: {
          channelId: channel.id,
          ...(lastReadAt
            ? { createdAt: { gt: lastReadAt } }
            : {}),
          OR: [{ authorId: null }, { authorId: { not: userId } }],
        },
      });
      return [channel.id, count] as const;
    })
  );
  const unreadByChannelId = new Map(unreadCounts);

  return visible
    .map((channel) => {
      const last = channel.messages[0];
      let preview = last?.body ?? null;
      if (last?.deletedAt) {
        preview = "ข้อความถูกยกเลิก";
      } else if (last?.messageType === "approval_request") {
        preview = "คำขออนุมัติ Content";
      } else if (last?.messageType === "meeting") {
        preview = "นัดประชุม";
      } else if (last?.messageType === "system") {
        preview = last.body;
      }

      const kind = isDmChannel(channel.slug)
        ? ("dm" as const)
        : isGroupChannel(channel.slug)
          ? ("group" as const)
          : ("team" as const);
      const partnerId = peerIdFromDmSlug(channel.slug, userId);
      const partner = partnerId ? partnerById.get(partnerId) : undefined;
      const memberNames = channel.members.map((member) => member.user.name);

      return {
        id: channel.id,
        slug: channel.slug,
        name: kind === "dm" && partner ? partner.name : channel.name,
        kind,
        contentId: null,
        contentCode: undefined,
        peerUserId: partnerId,
        peerEmail: partner?.email ?? null,
        memberNames: kind === "group" ? memberNames : undefined,
        memberCount: kind === "group" ? memberNames.length : undefined,
        lastMessageAt: last?.createdAt.toISOString() ?? null,
        lastMessagePreview: preview,
        unreadCount: unreadByChannelId.get(channel.id) ?? 0,
      };
    })
    .sort((a, b) => {
      const aTime = a.lastMessageAt ?? "";
      const bTime = b.lastMessageAt ?? "";
      if (aTime && bTime) return bTime.localeCompare(aTime);
      if (aTime) return -1;
      if (bTime) return 1;
      return a.name.localeCompare(b.name, "th");
    });
}

export async function listUserMeetings(userId: string) {
  const channels = await prisma.collaborationChannel.findMany({
    where: {
      contentId: null,
      OR: [
        { slug: TEAM_CHANNEL_SLUG },
        { slug: { startsWith: "dm-" } },
        {
          slug: { startsWith: "group-" },
          members: { some: { userId } },
        },
      ],
    },
    select: { id: true, slug: true, name: true },
  });

  const visible = channels.filter(
    (channel) =>
      isTeamChannel(channel.slug) ||
      isGroupChannel(channel.slug) ||
      (isDmChannel(channel.slug) && userIsDmParticipant(channel.slug, userId))
  );
  const channelById = new Map(visible.map((channel) => [channel.id, channel]));

  const messages = await prisma.collaborationMessage.findMany({
    where: {
      channelId: { in: visible.map((channel) => channel.id) },
      messageType: "meeting",
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  return messages.map((message) => {
    const metadata = (message.metadata ?? {}) as Record<string, unknown>;
    const channel = channelById.get(message.channelId);
    const kind = channel
      ? isDmChannel(channel.slug)
        ? "dm"
        : isGroupChannel(channel.slug)
          ? "group"
          : "team"
      : "team";

    return {
      id: message.id,
      channelId: message.channelId,
      channelName: channel?.name ?? "",
      channelKind: kind as "team" | "dm" | "group",
      title: String(metadata.title ?? message.body),
      meetUrl: String(metadata.meetUrl ?? ""),
      startsAt: String(metadata.startsAt ?? message.createdAt.toISOString()),
      endsAt: String(metadata.endsAt ?? message.createdAt.toISOString()),
      calendarLink: String(metadata.calendarLink ?? ""),
      attendeeCount: Number(metadata.attendeeCount ?? 0),
      authorName: message.authorName,
    };
  });
}

export async function listSharedMeetings(
  viewerId: string,
  targetUserId: string
) {
  const channels = await prisma.collaborationChannel.findMany({
    where: {
      contentId: null,
      OR: [
        { slug: TEAM_CHANNEL_SLUG },
        { slug: { startsWith: "dm-" } },
        {
          slug: { startsWith: "group-" },
          members: { some: { userId: viewerId } },
        },
      ],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      members: { select: { userId: true } },
    },
  });

  const participates = (
    channel: { slug: string; members: { userId: string }[] },
    userId: string
  ) =>
    isTeamChannel(channel.slug) ||
    (isGroupChannel(channel.slug) &&
      channel.members.some((member) => member.userId === userId)) ||
    (isDmChannel(channel.slug) && userIsDmParticipant(channel.slug, userId));

  const shared = channels.filter(
    (channel) =>
      participates(channel, viewerId) && participates(channel, targetUserId)
  );
  const channelById = new Map(shared.map((channel) => [channel.id, channel]));

  const messages = await prisma.collaborationMessage.findMany({
    where: {
      channelId: { in: shared.map((channel) => channel.id) },
      messageType: "meeting",
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  return messages.map((message) => {
    const metadata = (message.metadata ?? {}) as Record<string, unknown>;
    const channel = channelById.get(message.channelId);
    const kind = channel
      ? isDmChannel(channel.slug)
        ? "dm"
        : isGroupChannel(channel.slug)
          ? "group"
          : "team"
      : "team";

    return {
      id: message.id,
      channelId: message.channelId,
      channelName: channel?.name ?? "",
      channelKind: kind as "team" | "dm" | "group",
      title: String(metadata.title ?? message.body),
      meetUrl: String(metadata.meetUrl ?? ""),
      startsAt: String(metadata.startsAt ?? message.createdAt.toISOString()),
      endsAt: String(metadata.endsAt ?? message.createdAt.toISOString()),
      calendarLink: String(metadata.calendarLink ?? ""),
      attendeeCount: Number(metadata.attendeeCount ?? 0),
      authorName: message.authorName,
    };
  });
}

export async function listChannelMeetings(channelId: string, userId: string) {
  const allowed = await assertCanAccessChannel(channelId, userId);
  if (!allowed) {
    throw new Error("ไม่มีสิทธิ์เข้าถึงห้องนี้");
  }

  const channel = await prisma.collaborationChannel.findUnique({
    where: { id: channelId },
    select: { id: true, slug: true, name: true },
  });
  if (!channel) {
    throw new Error("ไม่พบห้อง");
  }

  const kind = isDmChannel(channel.slug)
    ? ("dm" as const)
    : isGroupChannel(channel.slug)
      ? ("group" as const)
      : ("team" as const);

  const messages = await prisma.collaborationMessage.findMany({
    where: {
      channelId,
      messageType: "meeting",
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  return messages.map((message) => {
    const metadata = (message.metadata ?? {}) as Record<string, unknown>;
    return {
      id: message.id,
      channelId: message.channelId,
      channelName: channel.name,
      channelKind: kind,
      title: String(metadata.title ?? message.body),
      meetUrl: String(metadata.meetUrl ?? ""),
      startsAt: String(metadata.startsAt ?? message.createdAt.toISOString()),
      endsAt: String(metadata.endsAt ?? message.createdAt.toISOString()),
      calendarLink: String(metadata.calendarLink ?? ""),
      attendeeCount: Number(metadata.attendeeCount ?? 0),
      authorName: message.authorName,
    };
  });
}

export async function markChannelAsRead(channelId: string, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) {
    return;
  }

  const now = new Date();
  await prisma.collaborationChannelRead.upsert({
    where: {
      channelId_userId: { channelId, userId },
    },
    create: {
      channelId,
      userId,
      lastReadAt: now,
    },
    update: {
      lastReadAt: now,
    },
  });
}

export async function getChannelMessages(channelId: string, limit = 80) {
  const messages = await prisma.collaborationMessage.findMany({
    where: { channelId },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  return reconcilePendingApprovalCards(messages);
}

const APPROVED_CONTENT_STATUSES = new Set([
  "approved",
  "scheduled",
  "posting",
  "posted",
]);

async function reconcilePendingApprovalCards(
  messages: Awaited<
    ReturnType<typeof prisma.collaborationMessage.findMany>
  >
) {
  const pendingApprovals = messages.filter((message) => {
    if (message.messageType !== "approval_request") return false;
    const metadata = message.metadata as ApprovalCardMetadata;
    return metadata.status === "pending";
  });
  if (!pendingApprovals.length) return messages;

  const contentIds = [
    ...new Set(
      pendingApprovals.map(
        (message) => (message.metadata as ApprovalCardMetadata).contentId
      )
    ),
  ];

  const contents = await prisma.content.findMany({
    where: { id: { in: contentIds } },
    select: { id: true, status: true, approver: true, updatedAt: true },
  });
  const contentById = new Map(contents.map((content) => [content.id, content]));

  return Promise.all(
    messages.map(async (message) => {
      if (message.messageType !== "approval_request") return message;

      const metadata = message.metadata as ApprovalCardMetadata;
      if (metadata.status !== "pending") return message;

      const content = contentById.get(metadata.contentId);
      if (!content) return message;

      const isApproved = APPROVED_CONTENT_STATUSES.has(content.status);
      const isRejected = content.status === "rejected";
      if (!isApproved && !isRejected) return message;

      const updatedMetadata: ApprovalCardMetadata = {
        ...metadata,
        status: isApproved ? "approved" : "rejected",
        resolvedBy: content.approver ?? "Admin",
        resolvedAt: content.updatedAt.toISOString(),
      };

      return prisma.collaborationMessage.update({
        where: { id: message.id },
        data: { metadata: updatedMetadata },
      });
    })
  );
}

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

export async function assertCanAccessChannel(
  channelId: string,
  userId: string
): Promise<boolean> {
  const channel = await prisma.collaborationChannel.findUnique({
    where: { id: channelId },
  });
  if (!channel) return false;
  if (isTeamChannel(channel.slug)) return true;
  if (isGroupChannel(channel.slug)) {
    const membership = await prisma.collaborationChannelMember.findUnique({
      where: {
        channelId_userId: { channelId, userId },
      },
    });
    return Boolean(membership);
  }
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

export async function updateTextMessage(params: {
  messageId: string;
  userId: string;
  body: string;
}) {
  const message = await prisma.collaborationMessage.findUnique({
    where: { id: params.messageId },
  });
  if (!message) {
    throw new Error("ไม่พบข้อความ");
  }
  if (message.messageType !== "text") {
    throw new Error("แก้ไขได้เฉพาะข้อความแชทเท่านั้น");
  }
  if (message.deletedAt) {
    throw new Error("ไม่สามารถแก้ไขข้อความที่ถูกยกเลิกแล้ว");
  }
  if (message.authorId !== params.userId) {
    throw new Error("แก้ไขได้เฉพาะข้อความของตนเอง");
  }

  const text = params.body.trim();
  if (!text) {
    throw new Error("กรุณากรอกข้อความ");
  }

  const updated = await prisma.collaborationMessage.update({
    where: { id: params.messageId },
    data: {
      body: text,
      editedAt: new Date(),
    },
  });

  await prisma.collaborationChannel.update({
    where: { id: updated.channelId },
    data: { updatedAt: new Date() },
  });

  return updated;
}

export async function deleteTextMessage(params: {
  messageId: string;
  userId: string;
}) {
  const message = await prisma.collaborationMessage.findUnique({
    where: { id: params.messageId },
  });
  if (!message) {
    throw new Error("ไม่พบข้อความ");
  }
  if (message.messageType !== "text") {
    throw new Error("ยกเลิกได้เฉพาะข้อความแชทเท่านั้น");
  }
  if (message.deletedAt) {
    throw new Error("ข้อความนี้ถูกยกเลิกแล้ว");
  }
  if (message.authorId !== params.userId) {
    throw new Error("ยกเลิกได้เฉพาะข้อความของตนเอง");
  }

  const deleted = await prisma.collaborationMessage.update({
    where: { id: params.messageId },
    data: {
      deletedAt: new Date(),
      body: "",
    },
  });

  await prisma.collaborationChannel.update({
    where: { id: deleted.channelId },
    data: { updatedAt: new Date() },
  });

  return deleted;
}

export async function postSystemMessage(params: {
  channelId: string;
  body: string;
}) {
  const message = await prisma.collaborationMessage.create({
    data: {
      channelId: params.channelId,
      authorName: "ระบบ",
      body: params.body,
      messageType: "system",
    },
  });

  await prisma.collaborationChannel.update({
    where: { id: params.channelId },
    data: { updatedAt: new Date() },
  });

  return message;
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

export async function getChannelAttendees(channelId: string) {
  const channel = await prisma.collaborationChannel.findUnique({
    where: { id: channelId },
    select: { slug: true },
  });
  if (!channel) return [];

  if (isGroupChannel(channel.slug)) {
    const members = await prisma.collaborationChannelMember.findMany({
      where: { channelId },
      include: { user: { select: { name: true, email: true } } },
    });
    return members.map((member) => ({
      email: member.user.email,
      name: member.user.name,
    }));
  }

  if (isDmChannel(channel.slug)) {
    const [idA, idB] = channel.slug.slice(3).split("-");
    const users = await prisma.user.findMany({
      where: { id: { in: [idA, idB].filter(Boolean) } },
      select: { name: true, email: true },
    });
    return users.map((user) => ({ email: user.email, name: user.name }));
  }

  const users = await prisma.user.findMany({
    select: { name: true, email: true },
  });
  return users.map((user) => ({ email: user.email, name: user.name }));
}

export async function scheduleChannelMeeting(params: {
  channelId: string;
  authorId: string;
  authorName: string;
  title: string;
  meetUrl?: string;
  startsAt: string;
  endsAt: string;
}) {
  const allowed = await assertCanAccessChannel(params.channelId, params.authorId);
  if (!allowed) {
    throw new Error("ไม่มีสิทธิ์เข้าถึงห้องนี้");
  }

  const title = params.title.trim();
  if (!title) {
    throw new Error("กรุณากรอกหัวข้อประชุม");
  }
  if (!params.startsAt || !params.endsAt) {
    throw new Error("กรุณาเลือกเวลาเริ่มและสิ้นสุด");
  }

  let meetUrl = params.meetUrl?.trim() ?? "";
  let eventId = "";
  let calendarLink = "";
  let attendeeCount = 0;

  if (isGoogleCalendarConfigured()) {
    const attendees = await getChannelAttendees(params.channelId);
    attendeeCount = attendees.length;
    const created = await createCalendarMeeting({
      title,
      description: `นัดประชุมโดย ${params.authorName}`,
      startsAt: params.startsAt,
      endsAt: params.endsAt,
      attendees: attendees.map((attendee) => ({
        email: attendee.email,
        displayName: attendee.name,
      })),
      manualMeetUrl: meetUrl || undefined,
    });
    meetUrl = created.meetUrl;
    eventId = created.eventId;
    calendarLink = created.htmlLink;
  }

  return postMeetingMessage({
    channelId: params.channelId,
    authorId: params.authorId,
    authorName: params.authorName,
    title,
    meetUrl,
    startsAt: params.startsAt,
    endsAt: params.endsAt,
    eventId,
    calendarLink,
    attendeeCount,
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
  eventId?: string;
  calendarLink?: string;
  attendeeCount?: number;
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
        eventId: params.eventId ?? "",
        calendarLink: params.calendarLink ?? "",
        attendeeCount: params.attendeeCount ?? 0,
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
