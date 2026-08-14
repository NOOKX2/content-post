"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { ChevronDown, List, Plus, Search, Users, X } from "lucide-react";
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

const VISIBLE_MEMBER_COUNT = 4;

function matchesQuery(text: string, query: string) {
  return text.toLowerCase().includes(query);
}

function firstName(name: string) {
  const token = name.trim().split(/\s+/)[0] || name;
  return token.length > 10 ? `${token.slice(0, 9)}…` : token;
}

function MemberFace({
  member,
  onClick,
}: {
  member: TeamMemberItem;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-16 shrink-0 flex-col items-center gap-1.5 rounded-xl px-1 py-1 transition hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
      title={`${member.name} (${member.email})`}
    >
      <PersonAvatar
        name={member.name}
        imageUrl={member.imageUrl}
        size="xl"
        className="ring-1 ring-stone-200"
      />
      <span className="w-full truncate text-center text-[11px] font-medium text-stone-500">
        {firstName(member.name)}
      </span>
    </button>
  );
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
  const [expanded, setExpanded] = useState(false);
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

  const filteredMembers = useMemo(() => {
    if (!query) return otherMembers;
    return otherMembers.filter(
      (member) =>
        matchesQuery(member.name, query) || matchesQuery(member.email, query)
    );
  }, [otherMembers, query]);

  const visibleMembers =
    expanded || query
      ? filteredMembers
      : filteredMembers.slice(0, VISIBLE_MEMBER_COUNT);
  const showToggle = filteredMembers.length > 0;

  const filteredChannels = useMemo(() => {
    if (!query) return channels;
    return channels.filter(
      (channel) =>
        matchesQuery(channel.name, query) ||
        matchesQuery(channel.peerEmail ?? "", query) ||
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
        "flex shrink-0 flex-col gap-3 bg-transparent p-3 md:w-80",
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

      <section className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <List className="h-4 w-4 text-stone-500" />
            <h2 className="text-sm font-semibold text-stone-800">
              {t("team.messenger")}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateGroup(true)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
            title={t("team.createGroup")}
          >
            <Plus className="h-4 w-4" />
            {t("team.createGroup")}
          </button>
        </div>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("team.searchMembers")}
            className="h-9 w-full rounded-full border border-stone-200 bg-stone-50 py-2 pr-8 pl-8 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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

        {filteredMembers.length === 0 ? (
          <p className="py-6 text-center text-xs text-stone-400">
            {query ? t("team.noMembersFound") : t("team.noMembers")}
          </p>
        ) : (
          <div className="mt-4 flex items-start gap-1">
            <div
              className={cn(
                "flex min-w-0 flex-1 gap-1",
                expanded ? "flex-wrap" : "overflow-hidden"
              )}
            >
              {visibleMembers.map((member) => (
                <MemberFace
                  key={member.id}
                  member={member}
                  onClick={() => void openDm(member)}
                />
              ))}
            </div>
            {showToggle && (
              <button
                type="button"
                onClick={() => {
                  setExpanded((current) => !current);
                  if (expanded) setSearch("");
                }}
                className="flex w-14 shrink-0 flex-col items-center gap-1.5 rounded-xl px-1 py-1 text-stone-500 transition hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 transition-transform",
                      expanded && "rotate-180"
                    )}
                  />
                </span>
                <span className="text-[11px] font-medium">
                  {expanded ? t("team.hide") : t("team.show")}
                </span>
              </button>
            )}
          </div>
        )}

      </section>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
        <p className="px-4 pt-3 pb-1 text-[11px] font-semibold tracking-wide text-stone-400 uppercase">
          {t("team.conversations")}
        </p>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {filteredChannels.length === 0 ? (
            <p className="px-2 py-8 text-center text-xs text-stone-400">
              {query
                ? t("team.noConversationsFound")
                : t("team.noConversations")}
            </p>
          ) : (
            filteredChannels.map((channel) => (
              <button
                key={channel.id}
                type="button"
                onClick={() => onSelect(channel)}
                className={cn(
                  "mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                  activeChannelId === channel.id
                    ? "bg-stone-100"
                    : "hover:bg-stone-50"
                )}
              >
                {channel.kind === "dm" ? (
                  <PersonAvatar name={channel.name} size="md" />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-600">
                    <Users className="h-4 w-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        "truncate text-sm",
                        channel.unreadCount > 0
                          ? "font-semibold text-stone-900"
                          : "font-medium text-stone-900"
                      )}
                    >
                      {channel.name}
                    </p>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {channel.lastMessageAt && (
                        <span className="text-[10px] text-stone-400">
                          {new Date(channel.lastMessageAt).toLocaleTimeString(
                            "th-TH",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      )}
                      {channel.unreadCount > 0 &&
                        activeChannelId !== channel.id && (
                          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            {channel.unreadCount > 99
                              ? "99+"
                              : channel.unreadCount}
                          </span>
                        )}
                    </div>
                  </div>
                  {channel.kind === "dm" && channel.peerEmail ? (
                    <p className="mt-0.5 block truncate text-[11px] leading-snug text-stone-500">
                      {channel.peerEmail}
                    </p>
                  ) : null}
                  {channel.kind === "group" && channel.memberCount ? (
                    <p className="mt-0.5 truncate text-[11px] text-stone-500">
                      {channel.memberCount}
                    </p>
                  ) : null}
                  {channel.lastMessagePreview && (
                    <p
                      className={cn(
                        "mt-0.5 truncate text-xs",
                        channel.unreadCount > 0 &&
                          activeChannelId !== channel.id
                          ? "font-medium text-stone-700"
                          : "text-stone-400"
                      )}
                    >
                      {translateStoredMessage(
                        channel.lastMessagePreview,
                        t
                      )}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </section>
    </aside>
  );
}
