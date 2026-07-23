"use client";

import { createContext, useContext, useMemo } from "react";
import { SWRConfig } from "swr";
import type { CollaborationBootstrap } from "@/lib/collaboration/queries";

export const COLLAB_CHANNELS_KEY = "collab-channels";
export const TEAM_MEMBERS_KEY = "team-members";

export function collabMessagesKey(channelId: string) {
  return `collab-messages:${channelId}`;
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
