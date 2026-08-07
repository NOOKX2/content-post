import { randomUUID } from "crypto";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/shared/prisma";
import { postSystemMessage } from "@/lib/collaboration/data/messages";
import {
  TEAM_CHANNEL_SLUG,
  dmSlug,
  isDmChannel,
  isGroupChannel,
  isTeamChannel,
  peerIdFromDmSlug,
  userIsDmParticipant,
} from "@/lib/collaboration/domain/channel-helpers";

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


