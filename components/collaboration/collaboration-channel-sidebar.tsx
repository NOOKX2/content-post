"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import { MessageSquare, Users } from "lucide-react";
import type { CollaborationChannelItem } from "@/lib/collaboration/types";
import type { TeamMemberItem } from "@/lib/collaboration/team-types";
import {
  fetchCollaborationChannels,
  openDirectMessage,
} from "@/lib/collaboration/fetch-actions";
import { cn } from "@/lib/utils";

async function fetchMembers() {
  const res = await fetch("/api/team/members");
  const data = (await res.json()) as {
    members?: TeamMemberItem[];
    error?: string;
  };
  if (!res.ok) throw new Error(data.error || "โหลดสมาชิกไม่สำเร็จ");
  return data.members ?? [];
}

export function CollaborationChannelSidebar({
  activeChannelId,
  onSelect,
}: {
  activeChannelId: string | null;
  onSelect: (channel: CollaborationChannelItem) => void;
}) {
  const { data: session } = useSession();
  const { data: channels = [], mutate } = useSWR(
    "collab-channels",
    fetchCollaborationChannels,
    { refreshInterval: 10000 }
  );
  const { data: members = [] } = useSWR("team-members", fetchMembers);

  const otherMembers = members.filter(
    (member) => member.id !== session?.user?.id
  );

  const openDm = async (member: TeamMemberItem) => {
    try {
      const channel = await openDirectMessage(member.id);
      await mutate();
      onSelect(channel);
    } catch (error) {
      alert(error instanceof Error ? error.message : "เปิดแชทไม่สำเร็จ");
    }
  };

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-stone-200 bg-white">
      <div className="border-b border-stone-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-semibold text-stone-900">Messenger</h2>
        </div>
      </div>

      <div className="border-b border-stone-100 px-4 py-3">
        <p className="mb-2 text-[11px] font-medium text-stone-500">ทีมงาน</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {otherMembers.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => void openDm(member)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700"
              title={`${member.name} (${member.email})`}
            >
              {member.name.charAt(0)}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {channels.map((channel) => (
          <button
            key={channel.id}
            type="button"
            onClick={() => onSelect(channel)}
            className={cn(
              "mb-1 flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
              activeChannelId === channel.id
                ? "bg-blue-50"
                : "hover:bg-stone-50"
            )}
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
              {channel.kind === "dm" ? (
                <MessageSquare className="h-4 w-4" />
              ) : (
                <Users className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-stone-900">
                {channel.name}
              </p>
              {channel.kind === "dm" && channel.peerEmail && (
                <p className="truncate text-[11px] text-stone-500">
                  {channel.peerEmail}
                </p>
              )}
              {channel.lastMessagePreview && (
                <p className="mt-0.5 truncate text-xs text-stone-400">
                  {channel.lastMessagePreview}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
