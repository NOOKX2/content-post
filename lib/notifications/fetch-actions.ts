export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  contentId: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationsResponse = {
  notifications: NotificationItem[];
  unreadCount: number;
};

export async function fetchNotifications(): Promise<NotificationsResponse> {
  const res = await fetch("/api/notifications");
  if (!res.ok) {
    throw new Error("Failed to fetch notifications");
  }
  return res.json();
}

export async function markAllNotificationsRead(): Promise<void> {
  const res = await fetch("/api/notifications/read", { method: "PATCH" });
  if (!res.ok) {
    throw new Error("Failed to mark notifications read");
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  const res = await fetch(`/api/notifications/${id}/read`, {
    method: "PATCH",
  });
  if (!res.ok) {
    throw new Error("Failed to mark notification read");
  }
}

export type ContentCommentItem = {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  commentType: string;
  taggedName: string | null;
  createdAt: string;
};

export async function fetchContentComments(
  contentId: string
): Promise<ContentCommentItem[]> {
  const res = await fetch(`/api/content/${contentId}/comments`);
  if (!res.ok) {
    throw new Error("Failed to fetch comments");
  }
  const data = await res.json();
  return data.comments;
}

export async function postContentComment(
  contentId: string,
  body: {
    body: string;
    commentType?: "comment" | "edit_request" | "tag";
    taggedName?: string;
  }
): Promise<ContentCommentItem> {
  const res = await fetch(`/api/content/${contentId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to post comment");
  }
  const data = await res.json();
  return data.comment;
}
