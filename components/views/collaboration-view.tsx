"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Header } from "@/components/layout/header";
import { Tabs } from "@/components/ui/tabs";
import { CollaborationChannelSidebar } from "@/components/collaboration/collaboration-channel-sidebar";
import { CollaborationChatPanel } from "@/components/collaboration/collaboration-chat-panel";
import { TeamMembersPanel } from "@/components/collaboration/team-members-panel";
import { TeamTasksPanel } from "@/components/collaboration/team-tasks-panel";
import { fetchCollaborationChannels } from "@/lib/collaboration/fetch-actions";
import type { CollaborationChannelItem } from "@/lib/collaboration/types";

const TEAM_TABS = [
  { id: "chat", label: "แชท" },
  { id: "members", label: "สมาชิก" },
  { id: "tasks", label: "มอบหมายงาน" },
] as const;

type TeamTab = (typeof TEAM_TABS)[number]["id"];

export function CollaborationView() {
  const { data: session } = useSession();
  const { data: channels = [] } = useSWR(
    "collab-channels",
    fetchCollaborationChannels
  );
  const [tab, setTab] = useState<TeamTab>("chat");
  const [activeChannel, setActiveChannel] =
    useState<CollaborationChannelItem | null>(null);

  useEffect(() => {
    if (activeChannel) {
      const stillExists = channels.some(
        (channel) => channel.id === activeChannel.id
      );
      if (stillExists) return;
    }

    const teamChannel = channels.find((channel) => channel.kind === "team");
    setActiveChannel(teamChannel ?? channels[0] ?? null);
  }, [activeChannel, channels]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <Header session={session} title="Team Collaboration" compact />
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
      )}

      {tab === "members" && (
        <div className="min-h-0 flex-1 overflow-hidden bg-[#f5f5f7]">
          <TeamMembersPanel />
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
