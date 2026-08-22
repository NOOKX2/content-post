"use client";

import { useSession } from "next-auth/react";
import { Plus, Search, Users, X } from "lucide-react";
import type { CollaborationChannelItem } from "@/lib/collaboration/types";
import { useCollaborationChannelSidebar } from "@/app/collaboration/_hooks/use-collaboration-channel-sidebar";
import { CreateGroupDialog } from "@/app/collaboration/_components/CreateGroupDialog";
import { PersonAvatar } from "@/app/collaboration/_components/PersonAvatar";
import { translateStoredMessage, useT } from "@/lib/i18n";
import { cn } from "@/lib/shared/utils";

export function CollaborationChannelSidebar({
  activeChannelId,
  onSelect,
  className,
  loading = false,
}: {
  activeChannelId: string | null;
  onSelect: (channel: CollaborationChannelItem) => void;
  className?: string;
  loading?: boolean;
}) {
  const { t } = useT();
  const { data: session } = useSession();
  const {
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
  } = useCollaborationChannelSidebar(onSelect);

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-full shrink-0 flex-col border-r border-stone-200/80 bg-white md:w-[300px]",
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

      <div className="px-4 pt-4 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("team.searchChats")}
            className="h-11 w-full rounded-xl border border-stone-200 bg-white py-2 pr-9 pl-10 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-0.5 text-stone-400 hover:text-stone-600"
              aria-label={t("common.close")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        <button
          type="button"
          onClick={() => setShowCreateGroup(true)}
          className="mb-1 flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-xs font-semibold text-stone-500 transition hover:bg-stone-50 hover:text-stone-800"
        >
          <Plus className="h-4 w-4" />
          {t("team.createGroup")}
        </button>

        {loading ? (
          <div className="animate-pulse space-y-1 px-1 py-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl px-3 py-2.5">
                <div className="h-11 w-11 shrink-0 rounded-full bg-stone-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-2/3 rounded bg-stone-200" />
                  <div className="h-3 w-1/2 rounded bg-stone-100" />
                </div>
              </div>
            ))}
          </div>
        ) : chatRows.length === 0 ? (
          <p className="px-3 py-10 text-center text-xs text-stone-500">
            {query ? t("team.noConversationsFound") : t("team.noConversations")}
          </p>
        ) : (
          chatRows.map((row) => {
            if (row.type === "dm") {
              const selected = row.channel
                ? activeChannelId === row.channel.id
                : false;
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => void openDm(row.member)}
                  className={cn(
                    "mb-0.5 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition",
                    selected ? "bg-blue-50" : "hover:bg-stone-50"
                  )}
                >
                  <PersonAvatar
                    name={row.member.name}
                    imageUrl={row.member.imageUrl}
                    size="lg"
                    letters={2}
                    className="h-11! w-11! text-sm!"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-stone-900">
                        {row.member.name}
                      </p>
                      {row.channel?.unreadCount ? (
                        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {row.channel.unreadCount > 99
                            ? "99+"
                            : row.channel.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-stone-500">
                      {row.channel?.lastMessagePreview
                        ? translateStoredMessage(
                            row.channel.lastMessagePreview,
                            t
                          )
                        : row.member.position || row.member.email}
                    </p>
                  </div>
                </button>
              );
            }

            const { channel } = row;
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => onSelect(channel)}
                className={cn(
                  "mb-0.5 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition",
                  activeChannelId === channel.id
                    ? "bg-blue-50"
                    : "hover:bg-stone-50"
                )}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <Users className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold text-stone-900">
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
            );
          })
        )}
      </div>
    </aside>
  );
}
