"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR, { useSWRConfig } from "swr";
import { Header } from "@/components/layout/header";
import { Tabs } from "@/components/ui/tabs";
import { CollaborationChannelSidebar } from "@/components/collaboration/collaboration-channel-sidebar";
import { CollaborationChatPanel } from "@/components/collaboration/collaboration-chat-panel";
import { MeetingsCalendarPanel } from "@/components/collaboration/meetings-calendar-panel";
import { TeamMembersPanel } from "@/components/collaboration/team-members-panel";
import { TeamTasksPanel } from "@/components/collaboration/team-tasks-panel";
import {
  COLLAB_CHANNELS_KEY,
  patchChannelsUnread,
  useCollaborationBootstrap,
} from "@/lib/collaboration/collaboration-provider";
import {
  fetchCollaborationChannels,
  markCollaborationChannelRead,
} from "@/lib/collaboration/fetch-actions";

const TEAM_TABS = [
  { id: "chat", label: "แชท" },
  { id: "members", label: "สมาชิก" },
  { id: "meetings", label: "ประชุม" },
  { id: "tasks", label: "มอบหมายงาน" },
] as const;

type TeamTab = (typeof TEAM_TABS)[number]["id"];

export function CollaborationView() {
  const { data: session } = useSession();
  const bootstrap = useCollaborationBootstrap();
  const { mutate: mutateGlobal } = useSWRConfig();
  const { data: channels = [] } = useSWR(
    COLLAB_CHANNELS_KEY,
    fetchCollaborationChannels,
    {
      fallbackData: bootstrap?.channels,
      revalidateOnMount: !bootstrap,
    }
  );
  const [tab, setTab] = useState<TeamTab>("chat");
  const [activeChannelId, setActiveChannelId] = useState<string | null>(
    () => bootstrap?.defaultChannelId ?? null
  );

  useEffect(() => {
    if (
      activeChannelId &&
      channels.some((channel) => channel.id === activeChannelId)
    ) {
      return;
    }

    const teamChannel = channels.find((channel) => channel.kind === "team");
    setActiveChannelId(teamChannel?.id ?? channels[0]?.id ?? null);
  }, [activeChannelId, channels]);

  useEffect(() => {
    if (tab !== "chat" || !activeChannelId) return;

    void mutateGlobal(
      COLLAB_CHANNELS_KEY,
      (current) => patchChannelsUnread(current, activeChannelId, 0),
      { revalidate: false }
    );

    void markCollaborationChannelRead(activeChannelId).then(() => {
      void mutateGlobal(COLLAB_CHANNELS_KEY);
    });
  }, [activeChannelId, tab, mutateGlobal]);

  const activeChannel =
    channels.find((channel) => channel.id === activeChannelId) ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <Header session={session} title="Team Collaboration" />
      <div className="border-b border-stone-200 bg-white px-4 py-2">
        <Tabs
          tabs={[...TEAM_TABS]}
          activeTab={tab}
          onChange={(id) => setTab(id as TeamTab)}
          className="w-fit"
          compact
        />
      </div>

      {tab === "chat" && (
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <CollaborationChannelSidebar
            activeChannelId={activeChannelId}
            onSelect={(channel) => setActiveChannelId(channel.id)}
          />
          {activeChannel ? (
            <CollaborationChatPanel channel={activeChannel} />
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-stone-400">
              เลือกห้องแชทเพื่อเริ่มสนทนา
            </div>
          )}
        </div>
      )}

      {tab === "members" && (
        <div className="min-h-0 flex-1 overflow-hidden bg-[#f5f5f7]">
          <TeamMembersPanel />
        </div>
      )}

      {tab === "meetings" && (
        <div className="min-h-0 flex-1 overflow-hidden bg-[#f5f5f7]">
          <MeetingsCalendarPanel />
        </div>
      )}

      {tab === "tasks" && (
        <div className="min-h-0 flex-1 overflow-hidden bg-[#f5f5f7]">
          <TeamTasksPanel />
        </div>
      )}
    </div>
  );
}
