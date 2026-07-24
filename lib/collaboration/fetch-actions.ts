"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { approveContent, rejectContent } from "@/lib/content/actions";
import { toCollaborationMessageItem } from "@/lib/collaboration/mappers";
import {
  addGroupMembers,
  assertCanAccessChannel,
  createGroupChannel,
  deleteTextMessage,
  ensureDmChannel,
  getChannelMessages,
  leaveGroupChannel as leaveGroupChannelInService,
  listChannelMeetings,
  listChannels,
  listGroupMembers,
  listSharedMeetings,
  listUserMeetings,
  markChannelAsRead,
  postTextMessage,
  resolveApprovalMessage,
  scheduleChannelMeeting,
  updateTextMessage,
} from "@/lib/collaboration/service";
import type {
  ApprovalCardMetadata,
  CollaborationChannelItem,
  CollaborationMessageItem,
  GroupMemberItem,
  MeetingItem,
} from "@/lib/collaboration/types";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function fetchMeetings(): Promise<MeetingItem[]> {
  const user = await requireUser();
  return listUserMeetings(user.id!);
}

export async function fetchMemberMeetings(
  userId: string
): Promise<MeetingItem[]> {
  const user = await requireUser();
  return listSharedMeetings(user.id!, userId);
}

export async function fetchChannelMeetings(
  channelId: string
): Promise<MeetingItem[]> {
  const user = await requireUser();
  return listChannelMeetings(channelId, user.id!);
}

export async function fetchCollaborationChannels(): Promise<
  CollaborationChannelItem[]
> {
  const user = await requireUser();
  return listChannels(user.id!);
}

export async function openDirectMessage(
  userId: string
): Promise<CollaborationChannelItem> {
  const user = await requireUser();

  const otherUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });
  if (!otherUser) {
    throw new Error("ไม่พบสมาชิก");
  }

  const channel = await ensureDmChannel({
    currentUser: {
      id: user.id!,
      name: user.name ?? "ผู้ใช้",
    },
    otherUser,
  });

  const channels = await listChannels(user.id!);
  const item = channels.find((entry) => entry.id === channel.id);

  return (
    item ?? {
      id: channel.id,
      slug: channel.slug,
      name: otherUser.name,
      kind: "dm" as const,
      contentId: null,
      peerUserId: otherUser.id,
      peerEmail: otherUser.email,
      lastMessageAt: null,
      lastMessagePreview: null,
      unreadCount: 0,
    }
  );
}

export async function createCollaborationGroup(params: {
  name: string;
  memberIds: string[];
}): Promise<CollaborationChannelItem> {
  const user = await requireUser();

  if (!params.name?.trim()) {
    throw new Error("กรุณาตั้งชื่อกลุ่ม");
  }
  if (!Array.isArray(params.memberIds)) {
    throw new Error("กรุณาเลือกสมาชิก");
  }

  const channel = await createGroupChannel({
    name: params.name,
    memberIds: params.memberIds,
    creator: {
      id: user.id!,
      name: user.name ?? "ผู้ใช้",
    },
  });

  const channels = await listChannels(user.id!);
  const item = channels.find((entry) => entry.id === channel.id);

  return (
    item ??
    ({
      id: channel.id,
      slug: channel.slug,
      name: channel.name,
      kind: "group" as const,
      contentId: null,
      memberNames: channel.members.map((member) => member.user.name),
      memberCount: channel.members.length,
      lastMessageAt: null,
      lastMessagePreview: null,
      unreadCount: 0,
    } as CollaborationChannelItem)
  );
}

export async function fetchGroupMembers(
  channelId: string
): Promise<GroupMemberItem[]> {
  const user = await requireUser();
  const allowed = await assertCanAccessChannel(channelId, user.id!);
  if (!allowed) {
    throw new Error("ไม่มีสิทธิ์เข้าถึงห้องนี้");
  }
  return listGroupMembers(channelId);
}

export async function inviteGroupMembers(
  channelId: string,
  memberIds: string[]
): Promise<GroupMemberItem[]> {
  const user = await requireUser();
  const allowed = await assertCanAccessChannel(channelId, user.id!);
  if (!allowed) {
    throw new Error("ไม่มีสิทธิ์เข้าถึงห้องนี้");
  }

  await addGroupMembers({
    channelId,
    memberIds,
    actor: {
      id: user.id!,
      name: user.name ?? "ผู้ใช้",
    },
  });

  return listGroupMembers(channelId);
}

export async function leaveGroupChannel(channelId: string): Promise<void> {
  const user = await requireUser();
  await leaveGroupChannelInService({
    channelId,
    user: {
      id: user.id!,
      name: user.name ?? "ผู้ใช้",
    },
  });
}

export async function markCollaborationChannelRead(
  channelId: string
): Promise<void> {
  const user = await requireUser();
  const allowed = await assertCanAccessChannel(channelId, user.id!);
  if (!allowed) {
    throw new Error("ไม่มีสิทธิ์เข้าถึงห้องนี้");
  }

  await markChannelAsRead(channelId, user.id!);
}

export async function fetchChannelMessages(
  channelId: string
): Promise<CollaborationMessageItem[]> {
  const user = await requireUser();
  const allowed = await assertCanAccessChannel(channelId, user.id!);
  if (!allowed) {
    throw new Error("ไม่มีสิทธิ์เข้าถึงห้องนี้");
  }

  const messages = await getChannelMessages(channelId);
  await markChannelAsRead(channelId, user.id!);
  return messages.map(toCollaborationMessageItem);
}

export async function postChannelMessage(
  channelId: string,
  body: string
): Promise<CollaborationMessageItem> {
  const user = await requireUser();
  const allowed = await assertCanAccessChannel(channelId, user.id!);
  if (!allowed) {
    throw new Error("ไม่มีสิทธิ์เข้าถึงห้องนี้");
  }

  const text = body.trim();
  if (!text) {
    throw new Error("กรุณากรอกข้อความ");
  }

  const message = await postTextMessage({
    channelId,
    authorId: user.id!,
    authorName: user.name ?? "ผู้ใช้",
    body: text,
  });
  await markChannelAsRead(channelId, user.id!);
  return toCollaborationMessageItem(message);
}

export async function postChannelMeeting(
  channelId: string,
  payload: {
    title: string;
    meetUrl: string;
    startsAt: string;
    endsAt: string;
  }
): Promise<CollaborationMessageItem> {
  const user = await requireUser();

  try {
    const message = await scheduleChannelMeeting({
      channelId,
      authorId: user.id!,
      authorName: user.name ?? "ผู้ใช้",
      title: payload.title,
      meetUrl: payload.meetUrl,
      startsAt: payload.startsAt,
      endsAt: payload.endsAt,
    });
    return toCollaborationMessageItem(message);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Google Calendar")) {
      throw error;
    }
    throw new Error(
      error instanceof Error ? error.message : "นัดประชุมไม่สำเร็จ"
    );
  }
}

export async function editChannelMessage(
  messageId: string,
  body: string
): Promise<CollaborationMessageItem> {
  const user = await requireUser();

  const existing = await prisma.collaborationMessage.findUnique({
    where: { id: messageId },
    select: { channelId: true },
  });
  if (!existing) {
    throw new Error("ไม่พบข้อความ");
  }

  const allowed = await assertCanAccessChannel(existing.channelId, user.id!);
  if (!allowed) {
    throw new Error("ไม่มีสิทธิ์เข้าถึงห้องนี้");
  }

  const message = await updateTextMessage({
    messageId,
    userId: user.id!,
    body,
  });
  return toCollaborationMessageItem(message);
}

export async function deleteChannelMessage(
  messageId: string
): Promise<CollaborationMessageItem> {
  const user = await requireUser();

  const existing = await prisma.collaborationMessage.findUnique({
    where: { id: messageId },
    select: { channelId: true },
  });
  if (!existing) {
    throw new Error("ไม่พบข้อความ");
  }

  const allowed = await assertCanAccessChannel(existing.channelId, user.id!);
  if (!allowed) {
    throw new Error("ไม่มีสิทธิ์เข้าถึงห้องนี้");
  }

  const message = await deleteTextMessage({
    messageId,
    userId: user.id!,
  });
  return toCollaborationMessageItem(message);
}

export async function resolveApproval(
  messageId: string,
  action: "approve" | "reject",
  rejectReason?: string
): Promise<void> {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  const message = await prisma.collaborationMessage.findUnique({
    where: { id: messageId },
  });
  if (!message || message.messageType !== "approval_request") {
    throw new Error("Not found");
  }

  const metadata = message.metadata as ApprovalCardMetadata;
  if (metadata.status !== "pending") {
    throw new Error("ดำเนินการแล้ว");
  }

  const content = await prisma.content.findUnique({
    where: { id: metadata.contentId },
  });
  if (!content) {
    throw new Error("Content not found");
  }

  const actorName = user.name ?? "Admin";

  if (action === "approve") {
    const result = await approveContent(content.id);
    if (!result.success) {
      throw new Error(result.error);
    }
  } else {
    if (!rejectReason?.trim()) {
      throw new Error("กรุณาระบุเหตุผลที่ส่งกลับแก้ไข");
    }
    const result = await rejectContent(content.id, rejectReason.trim());
    if (!result.success) {
      throw new Error(result.error);
    }
  }

  await resolveApprovalMessage({
    messageId,
    status: action === "approve" ? "approved" : "rejected",
    resolvedBy: actorName,
    rejectReason: rejectReason?.trim(),
  });
}
