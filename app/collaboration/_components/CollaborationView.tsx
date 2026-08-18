"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR, { useSWRConfig } from "swr";
import { CollaborationChannelSidebar } from "@/app/collaboration/_components/CollaborationChannelSidebar";
import { CollaborationChatPanel } from "@/app/collaboration/_components/CollaborationChatPanel";
import { TeamCalendarWorkspace } from "@/app/collaboration/_components/TeamCalendarWorkspace";
import { TeamMembersPanel } from "@/app/collaboration/_components/TeamMembersPanel";
import { TeamTasksPanel } from "@/app/collaboration/_components/TeamTasksPanel";
import {
  TeamWorkspaceRail,
  type TeamWorkspaceSection,
} from "@/app/collaboration/_components/TeamWorkspaceRail";
import { CollaborationShell } from "@/app/collaboration/_components/CollaborationShell";
import {
  COLLAB_CHANNELS_KEY,
  patchChannelsUnread,
  useCollaborationBootstrap,
} from "@/lib/collaboration/client/collaboration-provider";
import { prefetchCollaboration } from "@/lib/collaboration/client/prefetch-collaboration";
import {
  fetchCollaborationChannels,
  markCollaborationChannelRead,
  openDirectMessage,
} from "@/lib/collaboration/actions/fetch";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";
import { cn } from "@/lib/shared/utils";
import { useT } from "@/lib/i18n";

export function CollaborationView() {
  const { data: session } = useSession();
  const { t } = useT();
  const isMobile = useIsMobile();
  const bootstrap = useCollaborationBootstrap();
  const { mutate: mutateGlobal } = useSWRConfig();
  const { data: channels = [], isLoading: channelsLoading } = useSWR(
    COLLAB_CHANNELS_KEY,
    fetchCollaborationChannels,
    {
      fallbackData: bootstrap?.channels,
      revalidateOnMount: !bootstrap,
    }
  );
  const [section, setSection] = useState<TeamWorkspaceSection>("chat");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(
    () => bootstrap?.defaultChannelId ?? null
  );
  const [calendarMemberId, setCalendarMemberId] = useState<string | null>(
    () => session?.user?.id ?? null
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
    if (section !== "chat" || !activeChannelId) return;

    void mutateGlobal(
      COLLAB_CHANNELS_KEY,
      (current) => patchChannelsUnread(current, activeChannelId, 0),
      { revalidate: false }
    );

    void markCollaborationChannelRead(activeChannelId).then(() => {
      void mutateGlobal(COLLAB_CHANNELS_KEY);
    });
  }, [activeChannelId, section, mutateGlobal]);

  useEffect(() => {
    if (section !== "chat") {
      setMobileChatOpen(false);
    }
  }, [section]);

  useEffect(() => {
    if (bootstrap || channels.length > 0) {
      return;
    }

    void prefetchCollaboration();
  }, [bootstrap, channels.length]);

  if (channelsLoading && !bootstrap && channels.length === 0) {
    return <CollaborationShell />;
  }

  const activeChannel =
    channels.find((channel) => channel.id === activeChannelId) ?? null;

  const handleSelectChannel = (channelId: string) => {
    setActiveChannelId(channelId);
    if (isMobile) {
      setMobileChatOpen(true);
    }
  };

  const handleMessageMember = async (userId: string) => {
    try {
      const channel = await openDirectMessage(userId);
      setActiveChannelId(channel.id);
      setSection("chat");
      if (isMobile) setMobileChatOpen(true);
      void mutateGlobal(COLLAB_CHANNELS_KEY);
    } catch (error) {
      alert(error instanceof Error ? error.message : t("team.openChatFailed"));
    }
  };

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-stone-50 text-stone-900">
      <TeamWorkspaceRail section={section} onChange={setSection} />

      {section === "chat" && (
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          <CollaborationChannelSidebar
            activeChannelId={activeChannelId}
            onSelect={(channel) => handleSelectChannel(channel.id)}
            className={cn(mobileChatOpen && "hidden md:flex")}
          />
          {activeChannel ? (
            <CollaborationChatPanel
              channel={activeChannel}
              onLeave={() => setMobileChatOpen(false)}
              onOpenCalendar={(peerUserId) => {
                if (peerUserId) setCalendarMemberId(peerUserId);
                setSection("calendar");
              }}
              className={cn(
                mobileChatOpen ? "flex" : "hidden md:flex"
              )}
            />
          ) : (
            <div className="hidden flex-1 items-center justify-center text-sm text-stone-500 md:flex">
              {t("team.selectChat")}
            </div>
          )}
        </div>
      )}

      {section === "calendar" && (
        <TeamCalendarWorkspace
          selectedMemberId={calendarMemberId}
          onSelectMember={setCalendarMemberId}
          onMessageMember={(userId) => void handleMessageMember(userId)}
        />
      )}

      {section === "members" && (
        <div className="min-h-0 flex-1 overflow-hidden bg-stone-50">
          <TeamMembersPanel />
        </div>
      )}

      {section === "tasks" && (
        <div className="min-h-0 flex-1 overflow-hidden bg-stone-50">
          <TeamTasksPanel />
        </div>
      )}
    </div>
  );
}
