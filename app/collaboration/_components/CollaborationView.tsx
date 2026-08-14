"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR, { useSWRConfig } from "swr";
import { Header } from "@/components/layout/Header";
import { Tabs } from "@/components/ui/Tabs";
import { CollaborationChannelSidebar } from "@/app/collaboration/_components/CollaborationChannelSidebar";
import { CollaborationChatPanel } from "@/app/collaboration/_components/CollaborationChatPanel";
import { MeetingsCalendarPanel } from "@/app/collaboration/_components/MeetingsCalendarPanel";
import { TeamMembersPanel } from "@/app/collaboration/_components/TeamMembersPanel";
import { TeamTasksPanel } from "@/app/collaboration/_components/TeamTasksPanel";
import {
  COLLAB_CHANNELS_KEY,
  patchChannelsUnread,
  useCollaborationBootstrap,
} from "@/lib/collaboration/client/collaboration-provider";
import {
  fetchCollaborationChannels,
  markCollaborationChannelRead,
} from "@/lib/collaboration/actions/fetch";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";
import { cn } from "@/lib/shared/utils";
import { useT } from "@/lib/i18n";

const TEAM_TABS = [
  { id: "chat", label: "แชท" },
  { id: "members", label: "สมาชิก" },
  { id: "meetings", label: "ประชุม" },
  { id: "tasks", label: "มอบหมายงาน" },
] as const;

type TeamTab = (typeof TEAM_TABS)[number]["id"];

export function CollaborationView() {
  const { data: session } = useSession();
  const { t } = useT();
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
        <Header session={session} title={t("team.title")} compact />
      </div>
      <div
        className={cn(
          "border-b border-stone-200 bg-white px-3 py-2 sm:px-4",
          hideTopNavOnMobile && "hidden"
        )}
      >
        <Tabs
          tabs={[
            { id: "chat", label: t("team.chat") },
            { id: "members", label: t("team.members") },
            { id: "meetings", label: t("team.meetings") },
            { id: "tasks", label: t("team.tasks") },
          ]}
          activeTab={tab}
          onChange={(id) => setTab(id as TeamTab)}
          className="w-full"
          compact
        />
      </div>

      {tab === "chat" && (
        <div
          className="flex min-h-0 flex-1 overflow-hidden"
          style={{
            backgroundImage:
              "radial-gradient(circle, #d6d3d1 0.8px, transparent 0.8px)",
            backgroundSize: "18px 18px",
            backgroundColor: "#f5f5f7",
          }}
        >
          <CollaborationChannelSidebar
            activeChannelId={activeChannelId}
            onSelect={(channel) => handleSelectChannel(channel.id)}
            className={cn(
              "w-full",
              mobileChatOpen && "hidden md:flex"
            )}
          />
          {activeChannel ? (
            <CollaborationChatPanel
              channel={activeChannel}
              className={
                mobileChatOpen
                  ? "flex bg-white"
                  : "m-3 hidden overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm md:flex"
              }
              onLeave={() => setMobileChatOpen(false)}
            />
          ) : (
            <div className="m-3 hidden flex-1 items-center justify-center rounded-2xl border border-stone-200/80 bg-white text-sm text-stone-400 shadow-sm md:flex">
              {t("team.selectChat")}
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
