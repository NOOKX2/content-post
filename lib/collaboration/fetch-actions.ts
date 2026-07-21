import type {
  CollaborationChannelItem,
  CollaborationMessageItem,
  GroupMemberItem,
  MeetingItem,
} from "@/lib/collaboration/types";

export async function fetchMeetings(): Promise<MeetingItem[]> {
  const res = await fetch("/api/collaboration/meetings");
  const data = (await res.json().catch(() => ({}))) as {
    meetings?: MeetingItem[];
    error?: string;
  };
  if (!res.ok || !data.meetings) {
    throw new Error(data.error || "โหลดรายการประชุมไม่สำเร็จ");
  }
  return data.meetings;
}

export async function fetchMemberMeetings(
  userId: string
): Promise<MeetingItem[]> {
  const res = await fetch(`/api/collaboration/members/${userId}/meetings`);
  const data = (await res.json().catch(() => ({}))) as {
    meetings?: MeetingItem[];
    error?: string;
  };
  if (!res.ok || !data.meetings) {
    throw new Error(data.error || "โหลดปฏิทินสมาชิกไม่สำเร็จ");
  }
  return data.meetings;
}

export async function fetchChannelMeetings(
  channelId: string
): Promise<MeetingItem[]> {
  const res = await fetch(`/api/collaboration/channels/${channelId}/meetings`);
  const data = (await res.json().catch(() => ({}))) as {
    meetings?: MeetingItem[];
    error?: string;
  };
  if (!res.ok || !data.meetings) {
    throw new Error(data.error || "โหลดปฏิทินห้องไม่สำเร็จ");
  }
  return data.meetings;
}

export async function fetchCollaborationChannels(): Promise<
  CollaborationChannelItem[]
> {
  const res = await fetch("/api/collaboration/channels");
  if (!res.ok) throw new Error("Failed to load channels");
  const data = await res.json();
  return data.channels;
}

export async function openDirectMessage(
  userId: string
): Promise<CollaborationChannelItem> {
  const res = await fetch("/api/collaboration/channels", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  const data = (await res.json()) as {
    channel?: CollaborationChannelItem;
    error?: string;
  };
  if (!res.ok || !data.channel) {
    throw new Error(data.error || "เปิดแชทส่วนตัวไม่สำเร็จ");
  }
  return data.channel;
}

export async function createCollaborationGroup(params: {
  name: string;
  memberIds: string[];
}): Promise<CollaborationChannelItem> {
  const res = await fetch("/api/collaboration/channels", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = (await res.json()) as {
    channel?: CollaborationChannelItem;
    error?: string;
  };
  if (!res.ok || !data.channel) {
    throw new Error(data.error || "สร้างกลุ่มไม่สำเร็จ");
  }
  return data.channel;
}

export async function fetchGroupMembers(
  channelId: string
): Promise<GroupMemberItem[]> {
  const res = await fetch(`/api/collaboration/channels/${channelId}/members`);
  const data = (await res.json()) as {
    members?: GroupMemberItem[];
    error?: string;
  };
  if (!res.ok || !data.members) {
    throw new Error(data.error || "โหลดสมาชิกไม่สำเร็จ");
  }
  return data.members;
}

export async function inviteGroupMembers(
  channelId: string,
  memberIds: string[]
): Promise<GroupMemberItem[]> {
  const res = await fetch(`/api/collaboration/channels/${channelId}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memberIds }),
  });
  const data = (await res.json()) as {
    members?: GroupMemberItem[];
    error?: string;
  };
  if (!res.ok || !data.members) {
    throw new Error(data.error || "เชิญสมาชิกไม่สำเร็จ");
  }
  return data.members;
}

export async function leaveGroupChannel(channelId: string): Promise<void> {
  const res = await fetch(`/api/collaboration/channels/${channelId}/members`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "ออกจากกลุ่มไม่สำเร็จ");
  }
}

export async function fetchChannelMessages(
  channelId: string
): Promise<CollaborationMessageItem[]> {
  const res = await fetch(`/api/collaboration/channels/${channelId}/messages`);
  if (!res.ok) throw new Error("Failed to load messages");
  const data = await res.json();
  return data.messages;
}

export async function postChannelMessage(
  channelId: string,
  body: string
): Promise<CollaborationMessageItem> {
  const res = await fetch(`/api/collaboration/channels/${channelId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  const data = await res.json();
  return data.message;
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
  const res = await fetch(`/api/collaboration/channels/${channelId}/meetings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as {
    message?: CollaborationMessageItem;
    error?: string;
  };
  if (!res.ok || !data.message) {
    throw new Error(data.error || "นัดประชุมไม่สำเร็จ");
  }
  return data.message;
}

export async function editChannelMessage(
  messageId: string,
  body: string
): Promise<CollaborationMessageItem> {
  const res = await fetch(`/api/collaboration/messages/${messageId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  const data = (await res.json()) as {
    message?: CollaborationMessageItem;
    error?: string;
  };
  if (!res.ok || !data.message) {
    throw new Error(data.error || "แก้ไขข้อความไม่สำเร็จ");
  }
  return data.message;
}

export async function deleteChannelMessage(
  messageId: string
): Promise<CollaborationMessageItem> {
  const res = await fetch(`/api/collaboration/messages/${messageId}`, {
    method: "DELETE",
  });
  const data = (await res.json()) as {
    message?: CollaborationMessageItem;
    error?: string;
  };
  if (!res.ok || !data.message) {
    throw new Error(data.error || "ยกเลิกข้อความไม่สำเร็จ");
  }
  return data.message;
}

export async function resolveApproval(
  messageId: string,
  action: "approve" | "reject",
  rejectReason?: string
): Promise<void> {
  const res = await fetch(`/api/collaboration/messages/${messageId}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, rejectReason }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to resolve approval");
  }
}
