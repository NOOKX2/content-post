"use client";

import { useCollaborationView } from "@/app/collaboration/_hooks/use-collaboration-view";
import { CollaborationChannelSidebar } from "@/app/collaboration/_components/CollaborationChannelSidebar";
import { CollaborationChatPanel } from "@/app/collaboration/_components/CollaborationChatPanel";
import { TeamCalendarWorkspace } from "@/app/collaboration/_components/TeamCalendarWorkspace";
import { TeamMembersPanel } from "@/app/collaboration/_components/TeamMembersPanel";
import { TeamTasksPanel } from "@/app/collaboration/_components/TeamTasksPanel";
import { TeamWorkspaceRail } from "@/app/collaboration/_components/TeamWorkspaceRail";
import { cn } from "@/lib/shared/utils";
import { useT } from "@/lib/i18n";

export function CollaborationView() {
  const { t } = useT();
  const {
    channels,
    channelsLoading,
    activeChannel,
    section,
    setSection,
    activeChannelId,
    handleSelectChannel,
    mobileChatOpen,
    setMobileChatOpen,
    calendarMemberId,
    setCalendarMemberId,
    handleMessageMember,
  } = useCollaborationView();

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-stone-50 text-stone-900">
      <TeamWorkspaceRail section={section} onChange={setSection} />

      {section === "chat" && (
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          <CollaborationChannelSidebar
            activeChannelId={activeChannelId}
            onSelect={(channel) => handleSelectChannel(channel.id)}
            className={cn(mobileChatOpen && "hidden md:flex")}
            loading={channelsLoading && channels.length === 0}
          />
          {activeChannel ? (
            <CollaborationChatPanel
              channel={activeChannel}
              onLeave={() => setMobileChatOpen(false)}
              onOpenCalendar={(peerUserId) => {
                if (peerUserId) setCalendarMemberId(peerUserId);
                setSection("calendar");
              }}
              className={cn(mobileChatOpen ? "flex" : "hidden md:flex")}
            />
          ) : channelsLoading && channels.length === 0 ? (
            <div className="hidden flex-1 animate-pulse flex-col gap-3 p-4 md:flex">
              <div className="h-10 w-48 rounded-lg bg-stone-200" />
              <div className="h-32 rounded-2xl bg-stone-200" />
              <div className="h-64 rounded-2xl bg-stone-200" />
            </div>
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
