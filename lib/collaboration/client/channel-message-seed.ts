"use client";

import type { CollaborationMessageItem } from "@/lib/collaboration/types";
import { getPrefetchedCollaborationBootstrap } from "@/lib/collaboration/client/prefetch-collaboration";

export function getCachedChannelMessages(
  channelId: string
): CollaborationMessageItem[] | undefined {
  const bootstrap = getPrefetchedCollaborationBootstrap();
  if (!bootstrap) {
    return undefined;
  }
  if (!(channelId in bootstrap.initialMessagesByChannelId)) {
    return undefined;
  }
  return bootstrap.initialMessagesByChannelId[channelId];
}

export function resolveChannelMessageSeed(
  channelId: string,
  bootstrapMessages?: CollaborationMessageItem[]
): CollaborationMessageItem[] | undefined {
  if (bootstrapMessages !== undefined) {
    return bootstrapMessages;
  }
  return getCachedChannelMessages(channelId);
}
