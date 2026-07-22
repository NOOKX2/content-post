"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { MessageSquare, Plus, Search, Users, X } from "lucide-react";
import type { CollaborationChannelItem } from "@/lib/collaboration/types";
import type { TeamMemberItem } from "@/lib/collaboration/team-types";
import {
  createCollaborationGroup,
  fetchCollaborationChannels,
  openDirectMessage,
} from "@/lib/collaboration/fetch-actions";
import { fetchTeamMembers } from "@/lib/collaboration/team-actions";
import { CreateGroupDialog } from "@/components/collaboration/create-group-dialog";
import { PersonAvatar } from "@/components/collaboration/person-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function matchesQuery(text: string, query: string) {
  return text.toLowerCase().includes(query);
}

export function CollaborationChannelSidebar({
  activeChannelId,
  onSelect,
}: {
  activeChannelId: string | null;
  onSelect: (channel: CollaborationChannelItem) => void;
}) {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const query = search.trim().toLowerCase();

  const { data: channels = [], mutate } = useSWR(
    "collab-channels",
    fetchCollaborationChannels,
    { refreshInterval: 10000, refreshWhenHidden: false }
  );
  const { data: members = [] } = useSWR("team-members", fetchTeamMembers);

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
      alert(error instanceof Error ? error.message : "เปิดแชทไม่สำเร็จ");
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
      alert(error instanceof Error ? error.message : "สร้างกลุ่มไม่สำเร็จ");
    } finally {
      setCreatingGroup(false);
    }
  };

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-stone-200 bg-white">
      <CreateGroupDialog
        open={showCreateGroup}
        members={members}
        currentUserId={session?.user?.id}
        submitting={creatingGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreate={(payload) => void handleCreateGroup(payload)}
      />
      <div className="border-b border-stone-200 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-stone-900">Messenger</h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-stone-600"
            onClick={() => setShowCreateGroup(true)}
            title="สร้างกลุ่ม"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">สร้างกลุ่ม</span>
          </Button>
        </div>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาสมาชิก..."
            className="h-9 w-full rounded-lg border border-stone-200 bg-stone-50 py-2 pr-8 pl-8 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-stone-400 hover:text-stone-600"
              aria-label="ล้างการค้นหา"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="border-b border-stone-100 px-4 py-3">
        <p className="mb-2 text-[11px] font-semibold tracking-wide text-stone-500 uppercase">
          ทีมงาน
        </p>
        {filteredMembers.length === 0 ? (
          <p className="py-2 text-center text-xs text-stone-400">
            {query ? "ไม่พบสมาชิก" : "ยังไม่มีสมาชิก"}
          </p>
        ) : query ? (
          <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
            {filteredMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => void openDm(member)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <PersonAvatar name={member.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-900">
                    {member.name}
                  </p>
                  <p className="truncate text-[11px] text-stone-500">
                    {member.email}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filteredMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => void openDm(member)}
                className="shrink-0 rounded-full transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                title={`${member.name} (${member.email})`}
              >
                <PersonAvatar name={member.name} size="md" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        <p className="mb-1.5 px-2 text-[11px] font-semibold tracking-wide text-stone-500 uppercase">
          กลุ่มสนทนา
        </p>
        {filteredChannels.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-stone-400">
            {query ? "ไม่พบกลุ่มสนทนา" : "ยังไม่มีกลุ่มสนทนา"}
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
                  ? "bg-blue-50"
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
                {channel.kind === "dm" && channel.peerEmail && (
                  <p className="truncate text-[11px] text-stone-500">
                    {channel.peerEmail}
                  </p>
                )}
                {channel.kind === "group" && channel.memberCount && (
                  <p className="truncate text-[11px] text-stone-500">
                    {channel.memberCount} สมาชิก
                  </p>
                )}
                {channel.lastMessagePreview && (
                  <p
                    className={cn(
                      "mt-0.5 truncate text-xs",
                      channel.unreadCount > 0 && activeChannelId !== channel.id
                        ? "font-medium text-stone-700"
                        : "text-stone-400"
                    )}
                  >
                    {channel.lastMessagePreview}
                  </p>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
