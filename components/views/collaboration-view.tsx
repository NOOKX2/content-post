"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Header } from "@/components/layout/header";
import { CollaborationChannelSidebar } from "@/components/collaboration/collaboration-channel-sidebar";
import { CollaborationChatPanel } from "@/components/collaboration/collaboration-chat-panel";
import { fetchCollaborationChannels } from "@/lib/collaboration/fetch-actions";
import type { CollaborationChannelItem } from "@/lib/collaboration/types";

export function CollaborationView() {
  const { data: session } = useSession();
  const { data: channels = [] } = useSWR(
    "collab-channels",
    fetchCollaborationChannels
  );
  const [activeChannel, setActiveChannel] =
    useState<CollaborationChannelItem | null>(null);

  useEffect(() => {
    if (!activeChannel && channels.length > 0) {
      setActiveChannel(channels[0]);
    }
  }, [activeChannel, channels]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <Header session={session} title="Team Collaboration" compact />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <CollaborationChannelSidebar
          activeChannelId={activeChannel?.id ?? null}
          onSelect={setActiveChannel}
        />
        {activeChannel ? (
          <CollaborationChatPanel channel={activeChannel} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-stone-400">
            เลือกห้องแชทเพื่อเริ่มสนทนา
          </div>
        )}
      </div>
    </div>
  );
}
