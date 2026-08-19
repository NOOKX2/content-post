"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR, { useSWRConfig } from "swr";
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
import { useT } from "@/lib/i18n";
import type { TeamWorkspaceSection } from "@/app/collaboration/_components/TeamWorkspaceRail";

export function useCollaborationView() {
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
  const [calendarMemberId, setCalendarMemberId] = useState<string | null>(null);

  // Sync calendarMemberId to currentUser as soon as session is ready
  useEffect(() => {
    if (session?.user?.id && !calendarMemberId) {
      setCalendarMemberId(session.user.id);
    }
  }, [session?.user?.id, calendarMemberId]);

  // Auto-select team channel when channels load
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

  // Mark channel as read on open
  useEffect(() => {
    if (section !== "chat" || !activeChannelId) return;

    void mutateGlobal(
      COLLAB_CHANNELS_KEY,
      (current) => patchChannelsUnread(current, activeChannelId, 0),
      { revalidate: false }
    );
    // fire-and-forget — ไม่ refetch channels หลัง mark read เพราะ unread badge
    // ถูก clear ด้วย optimistic update ข้างบนแล้ว
    void markCollaborationChannelRead(activeChannelId);
  }, [activeChannelId, section, mutateGlobal]);

  // Close mobile chat when switching sections
  useEffect(() => {
    if (section !== "chat") {
      setMobileChatOpen(false);
    }
  }, [section]);

  // Trigger prefetch if no data yet
  useEffect(() => {
    if (bootstrap || channels.length > 0) return;
    void prefetchCollaboration();
  }, [bootstrap, channels.length]);

  const activeChannel =
    channels.find((channel) => channel.id === activeChannelId) ?? null;

  const handleSelectChannel = (channelId: string) => {
    setActiveChannelId(channelId);
    if (isMobile) setMobileChatOpen(true);
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

  return {
    // data
    channels,
    channelsLoading,
    activeChannel,
    // section nav
    section,
    setSection,
    // channel selection
    activeChannelId,
    handleSelectChannel,
    // mobile chat
    mobileChatOpen,
    setMobileChatOpen,
    // calendar
    calendarMemberId,
    setCalendarMemberId,
    // actions
    handleMessageMember,
  };
}
