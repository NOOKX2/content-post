"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import type { CollaborationChannelItem } from "@/lib/collaboration/types";
import type { TeamMemberItem } from "@/lib/collaboration/types/team";
import {
  COLLAB_CHANNELS_KEY,
  TEAM_MEMBERS_KEY,
  useCollaborationBootstrap,
} from "@/lib/collaboration/client/collaboration-provider";
import {
  createCollaborationGroup,
  fetchCollaborationChannels,
  openDirectMessage,
} from "@/lib/collaboration/actions/fetch";
import { fetchTeamMembers } from "@/lib/collaboration/actions/team";
import { useT } from "@/lib/i18n";

function matchesQuery(text: string, query: string) {
  return text.toLowerCase().includes(query);
}

export type ChannelListTab = "messages" | "groups";

export function useCollaborationChannelSidebar(
  onSelect: (channel: CollaborationChannelItem) => void
) {
  const { t } = useT();
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [listTab, setListTab] = useState<ChannelListTab>("messages");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const query = search.trim().toLowerCase();

  const bootstrap = useCollaborationBootstrap();
  const { data: channels = [], mutate: mutateChannels } = useSWR(
    COLLAB_CHANNELS_KEY,
    fetchCollaborationChannels,
    {
      fallbackData: bootstrap?.channels,
      revalidateOnMount: !bootstrap,
      refreshInterval: 10000,
      refreshWhenHidden: false,
    }
  );
  const { data: members = [] } = useSWR(TEAM_MEMBERS_KEY, fetchTeamMembers, {
    fallbackData: bootstrap?.members,
    revalidateOnMount: !bootstrap,
  });

  const otherMembers = useMemo(
    () => members.filter((member) => member.id !== session?.user?.id),
    [members, session?.user?.id]
  );

  const dmByPeer = useMemo(() => {
    const map = new Map<string, CollaborationChannelItem>();
    for (const channel of channels) {
      if (channel.kind === "dm" && channel.peerUserId) {
        map.set(channel.peerUserId, channel);
      }
    }
    return map;
  }, [channels]);

  const messageRows = useMemo(() => {
    const list = query
      ? otherMembers.filter(
          (member) =>
            matchesQuery(member.name, query) ||
            matchesQuery(member.email, query)
        )
      : otherMembers;

    return [...list].sort((a, b) => {
      const aAt = dmByPeer.get(a.id)?.lastMessageAt ?? "";
      const bAt = dmByPeer.get(b.id)?.lastMessageAt ?? "";
      return bAt.localeCompare(aAt);
    });
  }, [dmByPeer, otherMembers, query]);

  const groupChannels = useMemo(() => {
    const list = channels.filter(
      (channel) => channel.kind === "team" || channel.kind === "group"
    );
    if (!query) return list;
    return list.filter(
      (channel) =>
        matchesQuery(channel.name, query) ||
        matchesQuery(channel.lastMessagePreview ?? "", query)
    );
  }, [channels, query]);

  const openDm = async (member: TeamMemberItem) => {
    // DM channel มีอยู่แล้ว → สลับทันที ไม่ต้องรอ server
    const existing = dmByPeer.get(member.id);
    if (existing) {
      onSelect(existing);
      setSearch("");
      return;
    }

    // ยังไม่มี DM channel → สร้างใหม่ (ครั้งแรกเท่านั้น)
    try {
      const channel = await openDirectMessage(member.id);
      void mutateChannels(); // fire-and-forget ไม่บล็อก UI
      onSelect(channel);
      setSearch("");
    } catch (error) {
      alert(error instanceof Error ? error.message : t("team.openChatFailed"));
    }
  };

  const handleCreateGroup = async (payload: {
    name: string;
    memberIds: string[];
  }) => {
    setCreatingGroup(true);
    try {
      const channel = await createCollaborationGroup(payload);
      void mutateChannels(); // fire-and-forget ไม่บล็อก UI
      onSelect(channel);
      setShowCreateGroup(false);
      setListTab("groups");
      setSearch("");
    } catch (error) {
      alert(
        error instanceof Error ? error.message : t("team.createGroupFailed")
      );
    } finally {
      setCreatingGroup(false);
    }
  };

  return {
    // data
    channels,
    members,
    messageRows,
    groupChannels,
    dmByPeer,
    currentUserId: session?.user?.id,
    // search
    search,
    setSearch,
    query,
    // tabs
    listTab,
    setListTab,
    // group dialog
    showCreateGroup,
    setShowCreateGroup,
    creatingGroup,
    handleCreateGroup,
    // actions
    openDm,
  };
}
