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
import { useIsMobile } from "@/lib/hooks/use-is-mobile";
import { cn } from "@/lib/utils";

const TEAM_TABS = [
  { id: "chat", label: "แชท" },
  { id: "members", label: "สมาชิก" },
  { id: "meetings", label: "ประชุม" },
  { id: "tasks", label: "มอบหมายงาน" },
] as const;

type TeamTab = (typeof TEAM_TABS)[number]["id"];

export function CollaborationView() {
  const { data: session } = useSession();
  const isMobile = useIsMobile();
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
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
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

  useEffect(() => {
    if (tab !== "chat") {
      setMobileChatOpen(false);
    }
  }, [tab]);

  const activeChannel =
    channels.find((channel) => channel.id === activeChannelId) ?? null;

  const handleSelectChannel = (channelId: string) => {
    setActiveChannelId(channelId);
    if (isMobile) {
      setMobileChatOpen(true);
    }
  };

  const hideTopNavOnMobile = isMobile && tab === "chat" && mobileChatOpen;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className={cn(hideTopNavOnMobile && "hidden")}>
        <Header session={session} title="Team Collaboration" compact />
      </div>
      <div
        className={cn(
          "border-b border-stone-200 bg-white px-3 py-2 sm:px-4",
          hideTopNavOnMobile && "hidden"
        )}
      >
        <Tabs
          tabs={[...TEAM_TABS]}
          activeTab={tab}
          onChange={(id) => setTab(id as TeamTab)}
          className="w-full"
          compact
        />
      </div>

      {tab === "chat" && (
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <CollaborationChannelSidebar
            activeChannelId={activeChannelId}
            onSelect={(channel) => handleSelectChannel(channel.id)}
            className={cn(
              "w-full md:w-72",
              mobileChatOpen && "hidden md:flex"
            )}
          />
          {activeChannel ? (
            <CollaborationChatPanel
              channel={activeChannel}
              className={cn(!mobileChatOpen && "hidden md:flex")}
              onLeave={() => setMobileChatOpen(false)}
            />
          ) : (
            <div className="hidden flex-1 items-center justify-center text-sm text-stone-400 md:flex">
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
