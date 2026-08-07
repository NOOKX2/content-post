import { NextResponse } from "next/server";
import { requireSession } from "@/lib/shared/api-auth";
import {
  getNotificationsForUser,
  getUnreadCountForUser,
} from "@/lib/notifications/data/service";

export async function GET() {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const userId = authResult.session.user.id;
  const [notifications, unreadCount] = await Promise.all([
    getNotificationsForUser(userId),
    getUnreadCountForUser(userId),
  ]);

  return NextResponse.json({
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      contentId: n.contentId,
      link: n.link,
      readAt: n.readAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
  });
}
