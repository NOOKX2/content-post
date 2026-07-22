import type { CollaborationMessage } from "@prisma/client";
import type { CollaborationMessageItem } from "@/lib/collaboration/types";

export function toCollaborationMessageItem(
  message: CollaborationMessage
): CollaborationMessageItem {
  return {
    id: message.id,
    channelId: message.channelId,
    authorId: message.authorId,
    authorName: message.authorName,
    body: message.body,
    messageType: message.messageType,
    metadata: (message.metadata as Record<string, unknown>) ?? {},
    createdAt: message.createdAt.toISOString(),
    editedAt: message.editedAt?.toISOString() ?? null,
    deletedAt: message.deletedAt?.toISOString() ?? null,
  };
}
