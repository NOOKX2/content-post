import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/shared/prisma";

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  contentId?: string;
  link?: string;
  dedupeKey?: string;
};

export async function createNotification(
  input: CreateNotificationInput
): Promise<void> {
  try {
    if (input.dedupeKey) {
      await prisma.notification.upsert({
        where: { dedupeKey: input.dedupeKey },
        create: input,
        update: {},
      });
      return;
    }

    await prisma.notification.create({ data: input });
  } catch {
    // Ignore duplicate or race errors for notifications.
  }
}

export async function createNotifications(
  userIds: string[],
  input: Omit<CreateNotificationInput, "userId">
): Promise<void> {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  await Promise.all(
    uniqueIds.map((userId) => createNotification({ ...input, userId }))
  );
}

export async function getNotificationsForUser(userId: string, limit = 30) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCountForUser(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}

export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
