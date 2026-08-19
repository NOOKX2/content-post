"use client";

import {
  ArrowLeft,
  CalendarDays,
  MoreHorizontal,
  Send,
  Smile,
} from "lucide-react";
import { sameDay } from "@/app/collaboration/_lib/calendar-utils";
import type { CollaborationChannelItem } from "@/lib/collaboration/types";
import { useCollaborationChatPanel } from "@/app/collaboration/_hooks/use-collaboration-chat-panel";
import { MessageBubble } from "@/app/collaboration/_components/MessageBubble";
import { ChannelCalendarView } from "@/app/collaboration/_components/ChannelCalendarView";
import { GroupMembersDialog } from "@/app/collaboration/_components/GroupMembersDialog";
import { MemberCalendarView } from "@/app/collaboration/_components/MemberCalendarView";
import { PersonAvatar } from "@/app/collaboration/_components/PersonAvatar";
import { dateLocale, useT } from "@/lib/i18n";
import { cn } from "@/lib/shared/utils";

export function CollaborationChatPanel({
  channel,
  onLeave,
  onOpenCalendar,
  className,
}: {
  channel: CollaborationChannelItem;
  onLeave?: () => void;
  onOpenCalendar?: (peerUserId?: string) => void;
  className?: string;
}) {
  const { t, locale } = useT();
  const {
    session,
    messages,
    displayMessages,
    hasMoreOlder,
    loadingOlder,
    loadingInitial,
    scrollRef,
    handleScroll,
    refreshMessages,
    retry,
    text,
    setText,
    handleSend,
    members,
    memberCount,
    peerOnline,
    showMembers,
    setShowMembers,
    handleGroupChanged,
    handleGroupLeft,
    showChannelCalendar,
    setShowChannelCalendar,
    handleOpenCalendar,
  } = useCollaborationChatPanel(channel, onLeave);

  if (showChannelCalendar) {
    if (channel.kind === "dm" && channel.peerUserId) {
      return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <MemberCalendarView
            userId={channel.peerUserId}
            memberName={channel.name}
            channelId={channel.id}
            subtitle={t("team.calendarOverlap")}
            onBack={() => setShowChannelCalendar(false)}
          />
        </div>
      );
    }
    if (channel.kind === "team" || channel.kind === "group") {
      return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <ChannelCalendarView
            channelId={channel.id}
            channelName={channel.name}
            channelKind={channel.kind}
            onBack={() => setShowChannelCalendar(false)}
          />
        </div>
      );
    }
  }

  return (
    <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col bg-stone-50", className)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-200 bg-white px-3 py-3 sm:gap-3 sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {onLeave ? (
            <button
              type="button"
              onClick={onLeave}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 md:hidden"
              aria-label={t("team.backToChats")}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : null}
          <PersonAvatar name={channel.name} size="lg" letters={2} />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-stone-900">
              {channel.name}
            </h2>
            {channel.kind === "dm" ? (
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-500">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    peerOnline ? "bg-emerald-500" : "bg-stone-400"
                  )}
                />
                {peerOnline ? t("team.online") : t("team.busyNow")}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-stone-500">
                {t("team.membersCount", { count: memberCount })}
              </p>
            )}
          </div>
        </div>
        <div className="inline-flex shrink-0 items-center gap-0.5">
          {(channel.kind === "dm" && channel.peerUserId) ||
          channel.kind === "team" ||
          channel.kind === "group" ? (
            <button
              type="button"
              onClick={() => handleOpenCalendar(onOpenCalendar)}
              title={
                channel.kind === "dm"
                  ? t("team.scheduleWith", { name: channel.name })
                  : t("team.scheduleInRoom")
              }
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
            >
              <CalendarDays className="h-4 w-4" />
            </button>
          ) : null}
          {channel.kind === "group" ? (
            <button
              type="button"
              onClick={() => setShowMembers(true)}
              title={t("team.viewGroupMembers")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Group members dialog */}
      {channel.kind === "group" && (
        <GroupMembersDialog
          open={showMembers}
          channelId={channel.id}
          groupName={channel.name}
          teamMembers={members}
          currentUserId={session?.user?.id}
          onClose={() => setShowMembers(false)}
          onMembersChanged={handleGroupChanged}
          onLeft={handleGroupLeft}
        />
      )}

      {/* Message list */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {(loadingOlder || (loadingInitial && !displayMessages.length)) && (
          <div className="flex justify-center py-2">
            <span className="text-xs text-stone-400">
              {loadingInitial ? t("team.loadingMessages") : t("team.loadingOlder")}
            </span>
          </div>
        )}
        {!loadingInitial && hasMoreOlder && displayMessages.length > 0 && (
          <div className="flex justify-center pb-1">
            <span className="text-xs text-stone-400">{t("team.scrollOlder")}</span>
          </div>
        )}
        {displayMessages.map((message, index) => {
          const previous = displayMessages[index - 1];
          const created = new Date(message.createdAt);
          const showDay = !previous || !sameDay(new Date(previous.createdAt), created);
          const isToday = sameDay(created, new Date());
          return (
            <div key={message.id}>
              {showDay ? (
                <div className="flex justify-center py-3">
                  <span className="rounded-full bg-stone-200/80 px-3 py-0.5 text-[11px] font-medium text-stone-500">
                    {isToday
                      ? t("common.today")
                      : created.toLocaleDateString(dateLocale(locale), {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                  </span>
                </div>
              ) : null}
              <MessageBubble
                message={message}
                isSelf={message.authorId === session?.user?.id}
                sendStatus={message.sendStatus}
                onRetry={
                  message.sendStatus === "failed"
                    ? () => retry(message.id)
                    : undefined
                }
                onChanged={handleGroupChanged}
              />
            </div>
          );
        })}
        <div />
      </div>

      {/* Compose bar */}
      <div className="border-t border-stone-200 bg-white px-3 py-3 sm:px-4">
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20"
        >
          <span className="text-stone-400">
            <Smile className="h-4 w-4" />
          </span>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("team.messagePerson", { name: channel.name })}
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-stone-900 placeholder:text-stone-400 outline-none"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-40"
            aria-label={t("team.chat")}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
