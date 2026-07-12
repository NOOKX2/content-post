"use client";

import useSWR from "swr";
import { MessageSquare, Users } from "lucide-react";
import type { CollaborationChannelItem } from "@/lib/collaboration/types";
import { fetchCollaborationChannels } from "@/lib/collaboration/fetch-actions";
import { cn } from "@/lib/utils";
import { TEAM_MEMBERS } from "@/lib/constants";

export function CollaborationChannelSidebar({
  activeChannelId,
  onSelect,
}: {
  activeChannelId: string | null;
  onSelect: (channel: CollaborationChannelItem) => void;
}) {
  const { data: channels = [] } = useSWR(
    "collab-channels",
    fetchCollaborationChannels,
    { refreshInterval: 10000 }
  );

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
          {TEAM_MEMBERS.slice(0, 4).map((name) => (
            <div
              key={name}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700"
              title={name}
            >
              {name.charAt(0)}
            </div>
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
              {channel.contentId ? (
                <MessageSquare className="h-4 w-4" />
              ) : (
                <Users className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-stone-900">
                {channel.name}
              </p>
              {channel.contentCode && (
                <p className="text-[11px] text-stone-500">
                  #{channel.contentCode}
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
