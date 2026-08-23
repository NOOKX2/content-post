import { prisma } from "@/lib/shared/prisma";
import {
  TEAM_CHANNEL_SLUG,
  isDmChannel,
  isGroupChannel,
  isTeamChannel,
  userIsDmParticipant,
} from "@/lib/collaboration/domain/channel-helpers";
import { assertCanAccessChannel } from "@/lib/collaboration/data/channels";
import {
  createCalendarMeeting,
} from "@/lib/integrations/google/calendar";

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


export async function getChannelAttendees(channelId: string) {
  const channel = await prisma.collaborationChannel.findUnique({
    where: { id: channelId },
    select: { slug: true },
  });
  if (!channel) return [];

  type AttendeeRow = { id: string; name: string; email: string };

  let users: AttendeeRow[] = [];

  if (isGroupChannel(channel.slug)) {
    const members = await prisma.collaborationChannelMember.findMany({
      where: { channelId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    users = members.map((member) => ({
      id: member.user.id,
      email: member.user.email,
      name: member.user.name,
    }));
  } else if (isDmChannel(channel.slug)) {
    const [idA, idB] = channel.slug.slice(3).split("-");
    users = await prisma.user.findMany({
      where: { id: { in: [idA, idB].filter(Boolean) } },
      select: { id: true, name: true, email: true },
    });
  } else {
    users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });
  }

  const { listConnectedGoogleEmails } = await import(
    "@/lib/integrations/google/connections"
  );
  const googleEmails = await listConnectedGoogleEmails(users.map((u) => u.id));

  return users.map((user) => ({
    id: user.id,
    email: googleEmails.get(user.id) ?? user.email,
    name: user.name,
    usedGoogleEmail: googleEmails.has(user.id),
  }));
}

export async function scheduleChannelMeeting(params: {
  channelId: string;
  authorId: string;
  authorName: string;
  title: string;
  meetUrl?: string;
  startsAt: string;
  endsAt: string;
  notes?: string;
  kind?: "meeting" | "blocked" | "personal";
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
  let usedUserAuth = false;

  const { canCreateCalendarEventForUser } = await import(
    "@/lib/integrations/google/calendar"
  );
  const canWrite = await canCreateCalendarEventForUser(params.authorId);

  if (canWrite) {
    const attendees = await getChannelAttendees(params.channelId);
    attendeeCount = attendees.length;
    const created = await createCalendarMeeting({
      title,
      description: [
        `นัดประชุมโดย ${params.authorName}`,
        params.notes?.trim(),
      ]
        .filter(Boolean)
        .join("\n\n"),
      startsAt: params.startsAt,
      endsAt: params.endsAt,
      attendees: attendees.map((attendee) => ({
        email: attendee.email,
        displayName: attendee.name,
      })),
      manualMeetUrl: meetUrl || undefined,
      organizerUserId: params.authorId,
    });
    meetUrl = created.meetUrl;
    eventId = created.eventId;
    calendarLink = created.htmlLink;
    usedUserAuth = created.usedUserAuth;
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
    notes: params.notes,
    kind: params.kind,
    usedUserAuth,
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
  notes?: string;
  kind?: "meeting" | "blocked" | "personal";
  usedUserAuth?: boolean;
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
        notes: params.notes ?? "",
        kind: params.kind ?? "meeting",
        usedUserAuth: params.usedUserAuth ?? false,
      },
    },
  });

  await prisma.collaborationChannel.update({
    where: { id: params.channelId },
    data: { updatedAt: new Date() },
  });

  return message;
}


