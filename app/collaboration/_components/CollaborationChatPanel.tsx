"use client";

import { ArrowLeft, CalendarDays, Send, Smile } from "lucide-react";
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
    displayMessages,
    hasMoreOlder,
    loadingOlder,
    loadingInitial,
    scrollRef,
    handleScroll,
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

  const canOpenCalendar =
    (channel.kind === "dm" && Boolean(channel.peerUserId)) ||
    channel.kind === "team" ||
    channel.kind === "group";

  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col bg-[#f7f7f8]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-200/80 bg-white px-3 py-3.5 sm:gap-3 sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {onLeave ? (
            <button
              type="button"
              onClick={onLeave}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-600 hover:bg-stone-100 md:hidden"
              aria-label={t("team.backToChats")}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : null}
          <PersonAvatar
            name={channel.name}
            size="lg"
            letters={2}
            className="!h-11 !w-11 text-sm! ring-0!"
          />
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-stone-900">
              {channel.name}
            </h2>
            {channel.kind === "dm" ? (
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-500">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    peerOnline ? "bg-emerald-500" : "bg-stone-400"
                  )}
                />
                {peerOnline ? t("team.online") : t("team.busyNow")}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setShowMembers(true)}
                className="mt-0.5 text-left text-xs text-stone-500 transition hover:text-stone-700"
              >
                {t("team.membersCount", { count: memberCount })}
              </button>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => canOpenCalendar && handleOpenCalendar(onOpenCalendar)}
          disabled={!canOpenCalendar}
          title={
            channel.kind === "dm"
              ? t("team.scheduleWith", { name: channel.name })
              : t("team.scheduleInRoom")
          }
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 disabled:opacity-40"
        >
          <CalendarDays className="h-4 w-4" />
        </button>
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
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6"
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
                <div className="flex justify-center py-2">
                  <span className="text-xs font-medium text-stone-400">
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
      <div className="bg-white px-3 py-3 sm:px-5 sm:py-4">
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2"
        >
          <div className="flex min-w-0 flex-1 items-center rounded-full border border-stone-200 bg-white px-4 py-1 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("team.messagePerson", { name: channel.name })}
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none"
            />
            <span className="shrink-0 text-stone-400" aria-hidden>
              <Smile className="h-5 w-5" />
            </span>
          </div>
          <button
            type="submit"
            disabled={!text.trim()}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-40"
            aria-label={t("team.chat")}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
