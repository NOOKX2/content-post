"use client";

import { createContext, useContext, useMemo } from "react";
import useSWR, { SWRConfig } from "swr";
import { fetchCollaborationChannels } from "@/lib/collaboration/actions/fetch";
import type { CollaborationBootstrap } from "@/lib/collaboration/data/queries";
import type { CollaborationChannelItem } from "@/lib/collaboration/types";

export const COLLAB_CHANNELS_KEY = "collab-channels";
export const TEAM_MEMBERS_KEY = "team-members";

export function collabMessagesKey(channelId: string) {
  return `collab-messages:${channelId}`;
}

export function patchChannelsUnread(
  channels: CollaborationChannelItem[] | undefined,
  channelId: string,
  unreadCount: number
): CollaborationChannelItem[] | undefined {
  if (!channels) return channels;
  return channels.map((channel) =>
    channel.id === channelId ? { ...channel, unreadCount } : channel
  );
}

const CollaborationBootstrapContext =
  createContext<CollaborationBootstrap | null>(null);

export function CollaborationProvider({
  children,
  bootstrap,
}: {
  children: React.ReactNode;
  bootstrap?: CollaborationBootstrap;
}) {
  const swrConfig = useMemo(() => {
    if (!bootstrap) {
      return {};
    }

    const fallback: Record<string, unknown> = {
      [COLLAB_CHANNELS_KEY]: bootstrap.channels,
      [TEAM_MEMBERS_KEY]: bootstrap.members,
    };

    for (const [channelId, messages] of Object.entries(
      bootstrap.initialMessagesByChannelId
    )) {
      fallback[collabMessagesKey(channelId)] = messages;
    }

    return { fallback };
  }, [bootstrap]);

  return (
    <CollaborationBootstrapContext.Provider value={bootstrap ?? null}>
      <SWRConfig value={swrConfig}>{children}</SWRConfig>
    </CollaborationBootstrapContext.Provider>
  );
}

export function useCollaborationBootstrap() {
  return useContext(CollaborationBootstrapContext);
}

export function useCollaborationUnreadCount() {
  const bootstrap = useCollaborationBootstrap();
  const { data: channels = [] } = useSWR(
    COLLAB_CHANNELS_KEY,
    fetchCollaborationChannels,
    {
      fallbackData: bootstrap?.channels,
      revalidateOnMount: !bootstrap,
      refreshInterval: 10000,
      refreshWhenHidden: false,
    }
  );

  return useMemo(
    () => channels.reduce((total, channel) => total + channel.unreadCount, 0),
    [channels]
  );
}
