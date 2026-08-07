import { prisma } from "@/lib/shared/prisma";
import type { ApprovalCardMetadata } from "@/lib/collaboration/types";
import { COLLAB_MESSAGES_PAGE_SIZE } from "@/lib/collaboration/types";

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

export async function getChannelMessages(
  channelId: string,
  limit = COLLAB_MESSAGES_PAGE_SIZE
) {
  const page = await getChannelMessagesPage(channelId, { limit });
  return page.messages;
}

export async function getChannelMessagesPage(
  channelId: string,
  options?: { limit?: number; before?: string }
) {
  const limit = options?.limit ?? COLLAB_MESSAGES_PAGE_SIZE;
  const before = options?.before
    ? await prisma.collaborationMessage.findFirst({
        where: { id: options.before, channelId },
        select: { createdAt: true },
      })
    : null;

  const messages = await prisma.collaborationMessage.findMany({
    where: {
      channelId,
      ...(before ? { createdAt: { lt: before.createdAt } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
  });

  const hasMore = messages.length > limit;
  const slice = hasMore ? messages.slice(0, limit) : messages;
  const ordered = slice.reverse();

  return {
    messages: await reconcilePendingApprovalCards(ordered),
    hasMore,
  };
}

export async function getChannelMessagesSince(
  channelId: string,
  since: string,
  limit = COLLAB_MESSAGES_PAGE_SIZE
) {
  const sinceDate = new Date(since);
  if (Number.isNaN(sinceDate.getTime())) {
    return [];
  }

  const messages = await prisma.collaborationMessage.findMany({
    where: {
      channelId,
      createdAt: { gt: sinceDate },
    },
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


