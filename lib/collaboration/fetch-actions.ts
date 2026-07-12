import type {
  CollaborationChannelItem,
  CollaborationMessageItem,
} from "@/lib/collaboration/types";

export async function fetchCollaborationChannels(): Promise<
  CollaborationChannelItem[]
> {
  const res = await fetch("/api/collaboration/channels");
  if (!res.ok) throw new Error("Failed to load channels");
  const data = await res.json();
  return data.channels;
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
  if (!res.ok) throw new Error("Failed to schedule meeting");
  const data = await res.json();
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
