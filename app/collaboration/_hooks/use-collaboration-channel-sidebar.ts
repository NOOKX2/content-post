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

export type UnifiedChatRow =
  | {
      type: "dm";
      id: string;
      member: TeamMemberItem;
      channel: CollaborationChannelItem | undefined;
      sortAt: string;
    }
  | {
      type: "group";
      id: string;
      channel: CollaborationChannelItem;
      sortAt: string;
    };

export function useCollaborationChannelSidebar(
  onSelect: (channel: CollaborationChannelItem) => void
) {
  const { t } = useT();
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
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

  const chatRows = useMemo(() => {
    const rows: UnifiedChatRow[] = [];

    for (const member of otherMembers) {
      if (
        query &&
        !matchesQuery(member.name, query) &&
        !matchesQuery(member.email, query)
      ) {
        continue;
      }
      const channel = dmByPeer.get(member.id);
      rows.push({
        type: "dm",
        id: `dm:${member.id}`,
        member,
        channel,
        sortAt: channel?.lastMessageAt ?? "",
      });
    }

    for (const channel of channels) {
      if (channel.kind !== "team" && channel.kind !== "group") continue;
      if (
        query &&
        !matchesQuery(channel.name, query) &&
        !matchesQuery(channel.lastMessagePreview ?? "", query)
      ) {
        continue;
      }
      rows.push({
        type: "group",
        id: channel.id,
        channel,
        sortAt: channel.lastMessageAt ?? "",
      });
    }

    return rows.sort((a, b) => b.sortAt.localeCompare(a.sortAt));
  }, [channels, dmByPeer, otherMembers, query]);

  const openDm = async (member: TeamMemberItem) => {
    const existing = dmByPeer.get(member.id);
    if (existing) {
      onSelect(existing);
      setSearch("");
      return;
    }

    try {
      const channel = await openDirectMessage(member.id);
      void mutateChannels();
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
      void mutateChannels();
      onSelect(channel);
      setShowCreateGroup(false);
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
    members,
    chatRows,
    search,
    setSearch,
    query,
    showCreateGroup,
    setShowCreateGroup,
    creatingGroup,
    handleCreateGroup,
    openDm,
  };
}
