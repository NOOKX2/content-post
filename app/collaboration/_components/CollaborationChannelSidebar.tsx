"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { Plus, Search, Users, X } from "lucide-react";
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
import { CreateGroupDialog } from "@/app/collaboration/_components/CreateGroupDialog";
import { PersonAvatar } from "@/app/collaboration/_components/PersonAvatar";
import { translateStoredMessage, useT } from "@/lib/i18n";
import { cn } from "@/lib/shared/utils";

function matchesQuery(text: string, query: string) {
  return text.toLowerCase().includes(query);
}

export function CollaborationChannelSidebar({
  activeChannelId,
  onSelect,
  className,
}: {
  activeChannelId: string | null;
  onSelect: (channel: CollaborationChannelItem) => void;
  className?: string;
}) {
  const { t } = useT();
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [listTab, setListTab] = useState<"messages" | "groups">("messages");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const query = search.trim().toLowerCase();

  const bootstrap = useCollaborationBootstrap();
  const { data: channels = [], mutate } = useSWR(
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
    try {
      const channel = await openDirectMessage(member.id);
      await mutate();
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
      await mutate();
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

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-full shrink-0 flex-col border-r border-stone-200 bg-white md:w-[300px]",
        className
      )}
    >
      <CreateGroupDialog
        open={showCreateGroup}
        members={members}
        currentUserId={session?.user?.id}
        submitting={creatingGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreate={(payload) => void handleCreateGroup(payload)}
      />

      <div className="border-b border-stone-200 px-4 pt-4 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("team.searchChats")}
            className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 py-2 pr-8 pl-9 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-0.5 text-stone-400 hover:text-stone-600"
              aria-label={t("common.close")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="mt-3 flex rounded-xl bg-stone-100 p-1">
          {(["messages", "groups"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setListTab(tab)}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-xs font-semibold transition",
                listTab === tab
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
              )}
            >
              {tab === "messages" ? t("team.messagesTab") : t("team.groupsTab")}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {listTab === "messages" ? (
          messageRows.length === 0 ? (
            <p className="px-3 py-10 text-center text-xs text-stone-500">
              {query ? t("team.noMembersFound") : t("team.noMembers")}
            </p>
          ) : (
            messageRows.map((member) => {
              const channel = dmByPeer.get(member.id);
              const selected = channel
                ? activeChannelId === channel.id
                : false;
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => void openDm(member)}
                  className={cn(
                    "mb-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                    selected ? "bg-stone-100" : "hover:bg-stone-50"
                  )}
                >
                  <PersonAvatar
                    name={member.name}
                    imageUrl={member.imageUrl}
                    size="lg"
                    letters={2}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-stone-900">
                        {member.name}
                      </p>
                      {channel?.unreadCount ? (
                        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {channel.unreadCount > 99 ? "99+" : channel.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-stone-500">
                      {channel?.lastMessagePreview
                        ? translateStoredMessage(channel.lastMessagePreview, t)
                        : member.position || member.email}
                    </p>
                  </div>
                </button>
              );
            })
          )
        ) : (
          <>
            <button
              type="button"
              onClick={() => setShowCreateGroup(true)}
              className="mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-stone-500 transition hover:bg-stone-50 hover:text-stone-800"
            >
              <Plus className="h-4 w-4" />
              {t("team.createGroup")}
            </button>
            {groupChannels.length === 0 ? (
              <p className="px-3 py-10 text-center text-xs text-stone-500">
                {query
                  ? t("team.noConversationsFound")
                  : t("team.noConversations")}
              </p>
            ) : (
              groupChannels.map((channel) => (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => onSelect(channel)}
                  className={cn(
                    "mb-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                    activeChannelId === channel.id
                      ? "bg-stone-100"
                      : "hover:bg-stone-50"
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-stone-900">
                        {channel.name}
                      </p>
                      {channel.unreadCount > 0 &&
                        activeChannelId !== channel.id && (
                          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            {channel.unreadCount > 99
                              ? "99+"
                              : channel.unreadCount}
                          </span>
                        )}
                    </div>
                    {channel.lastMessagePreview ? (
                      <p className="mt-0.5 truncate text-xs text-stone-500">
                        {translateStoredMessage(channel.lastMessagePreview, t)}
                      </p>
                    ) : null}
                  </div>
                </button>
              ))
            )}
          </>
        )}
      </div>
    </aside>
  );
}
