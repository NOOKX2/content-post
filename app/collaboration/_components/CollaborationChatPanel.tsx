"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useSWR, { useSWRConfig } from "swr";
import { useSession } from "next-auth/react";
import {
  Check,
  ArrowLeft,
  CalendarDays,
  MoreHorizontal,
  Pencil,
  Send,
  Smile,
  Trash2,
  X,
} from "lucide-react";
import { sameDay } from "@/app/collaboration/_lib/calendar-utils";
import type {
  CollaborationChannelItem,
  CollaborationMessageItem,
  ApprovalCardMetadata,
  MeetingCardMetadata,
} from "@/lib/collaboration/types";
import { COLLAB_MESSAGES_PAGE_SIZE } from "@/lib/collaboration/types";
import {
  COLLAB_CHANNELS_KEY,
  patchChannelsUnread,
  TEAM_MEMBERS_KEY,
  useCollaborationBootstrap,
} from "@/lib/collaboration/client/collaboration-provider";
import {
  deleteChannelMessage,
  editChannelMessage,
} from "@/lib/collaboration/actions/fetch";
import { usePaginatedChannelMessages } from "@/lib/collaboration/client/use-paginated-channel-messages";
import {
  isClientMessageId,
} from "@/lib/collaboration/data/chat-outbox";
import {
  mergeMessagesWithOutbox,
  useChatSendQueue,
  type ChatDisplayMessage,
} from "@/lib/collaboration/client/use-chat-send-queue";
import { fetchTeamMembers } from "@/lib/collaboration/actions/team";
import { ApprovalCardMessage } from "@/app/collaboration/_components/ApprovalCardMessage";
import { ChannelCalendarView } from "@/app/collaboration/_components/ChannelCalendarView";
import { GroupMembersDialog } from "@/app/collaboration/_components/GroupMembersDialog";
import { MemberCalendarView } from "@/app/collaboration/_components/MemberCalendarView";
import { MeetingCardMessage } from "@/app/collaboration/_components/MeetingCardMessage";
import { PersonAvatar } from "@/app/collaboration/_components/PersonAvatar";
import { cn } from "@/lib/shared/utils";
import { dateLocale, translateStoredMessage, useT } from "@/lib/i18n";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
  const { data: session } = useSession();
  const { t, locale } = useT();
  const bootstrap = useCollaborationBootstrap();
  const { mutate: mutateGlobal } = useSWRConfig();
  const [text, setText] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [showChannelCalendar, setShowChannelCalendar] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    hasMoreOlder,
    loadingOlder,
    loadingInitial,
    scrollRef,
    handleScroll,
    appendMessage,
    refreshMessages,
    scrollToBottom,
  } = usePaginatedChannelMessages(channel.id);
  const { data: members = [] } = useSWR(TEAM_MEMBERS_KEY, fetchTeamMembers, {
    fallbackData: bootstrap?.members,
    revalidateOnMount: !bootstrap,
  });

  const onMessageSaved = useCallback(
    (saved: CollaborationMessageItem) => {
      appendMessage(saved);
      void mutateGlobal(COLLAB_CHANNELS_KEY);
    },
    [appendMessage, mutateGlobal]
  );

  const { outbox, enqueue, retry } = useChatSendQueue({
    channelId: channel.id,
    authorId: session?.user?.id,
    authorName: session?.user?.name ?? "ผู้ใช้",
    serverMessages: messages,
    onMessageSaved,
  });

  const displayMessages = useMemo(
    () =>
      mergeMessagesWithOutbox(messages, outbox).filter(
        (message) => !message.deletedAt
      ),
    [messages, outbox]
  );

  const headerPeople =
    channel.kind === "dm"
      ? [channel.name]
      : channel.kind === "group" && channel.memberNames?.length
        ? channel.memberNames
        : members.map((member) => member.name);
  const memberCount =
    channel.kind === "dm"
      ? 2
      : channel.kind === "group"
        ? (channel.memberCount ?? headerPeople.length)
        : Math.max(members.length, headerPeople.length);

  useEffect(() => {
    scrollToBottom(messages.length <= COLLAB_MESSAGES_PAGE_SIZE ? "auto" : "smooth");
  }, [displayMessages, scrollToBottom, messages.length]);

  useEffect(() => {
    setShowChannelCalendar(false);
  }, [channel.id]);

  useEffect(() => {
    void mutateGlobal(
      COLLAB_CHANNELS_KEY,
      (current) => patchChannelsUnread(current, channel.id, 0),
      { revalidate: false }
    );
  }, [channel.id, messages, mutateGlobal]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !session?.user?.id) return;

    enqueue(text.trim());
    setText("");
  };

  const peerMember = members.find((member) => member.id === channel.peerUserId);
  const peerOnline = channel.kind === "dm" && peerMember && !peerMember.busy;

  const openCalendar = () => {
    if (onOpenCalendar) {
      onOpenCalendar(channel.peerUserId ?? undefined);
      return;
    }
    setShowChannelCalendar(true);
  };

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
          <PersonAvatar
            name={channel.name}
            size="lg"
            letters={2}
          />
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
              onClick={openCalendar}
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

      {channel.kind === "group" && (
        <GroupMembersDialog
          open={showMembers}
          channelId={channel.id}
          groupName={channel.name}
          teamMembers={members}
          currentUserId={session?.user?.id}
          onClose={() => setShowMembers(false)}
          onMembersChanged={() => {
            void refreshMessages();
            void mutateGlobal(COLLAB_CHANNELS_KEY);
          }}
          onLeft={() => {
            setShowMembers(false);
            void mutateGlobal(COLLAB_CHANNELS_KEY);
            onLeave?.();
          }}
        />
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {(loadingOlder || (loadingInitial && !displayMessages.length)) && (
          <div className="flex justify-center py-2">
            <span className="text-xs text-stone-400">
              {loadingInitial
                ? t("team.loadingMessages")
                : t("team.loadingOlder")}
            </span>
          </div>
        )}
        {!loadingInitial && hasMoreOlder && displayMessages.length > 0 && (
          <div className="flex justify-center pb-1">
            <span className="text-xs text-stone-400">
              {t("team.scrollOlder")}
            </span>
          </div>
        )}
        {displayMessages.map((message, index) => {
          const previous = displayMessages[index - 1];
          const created = new Date(message.createdAt);
          const showDay =
            !previous || !sameDay(new Date(previous.createdAt), created);
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
                onChanged={() => {
                  void refreshMessages();
                  void mutateGlobal(COLLAB_CHANNELS_KEY);
                }}
              />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

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

function MessageBubble({
  message,
  isSelf,
  sendStatus,
  onRetry,
  onChanged,
}: {
  message: ChatDisplayMessage;
  isSelf: boolean;
  sendStatus?: ChatDisplayMessage["sendStatus"];
  onRetry?: () => void;
  onChanged: () => void;
}) {
  const { t } = useT();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.body);
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;

    const close = () => setMenu(null);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      close();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("scroll", close, true);
    };
  }, [menu]);

  if (message.messageType === "approval_request") {
    return (
      <div className="flex w-full justify-center">
        <ApprovalCardMessage
          messageId={message.id}
          metadata={message.metadata as unknown as ApprovalCardMetadata}
          createdAt={message.createdAt}
          onResolved={onChanged}
        />
      </div>
    );
  }

  if (message.messageType === "meeting") {
    return (
      <div className="flex w-full justify-center">
        <MeetingCardMessage
          metadata={message.metadata as unknown as MeetingCardMetadata}
        />
      </div>
    );
  }

  if (message.messageType === "system") {
    return (
      <div className="flex justify-center">
        <p className="max-w-2xl rounded-full bg-stone-200/80 px-4 py-1.5 text-center text-xs text-stone-600">
          {translateStoredMessage(message.body, t)}
        </p>
      </div>
    );
  }

  const isUnsent = isClientMessageId(message.id);
  const canManage = isSelf && !isUnsent && !sendStatus;

  const handleSaveEdit = async () => {
    if (!draft.trim() || busy) return;
    setBusy(true);
    try {
      await editChannelMessage(message.id, draft.trim());
      setEditing(false);
      onChanged();
    } catch (error) {
      alert(error instanceof Error ? error.message : t("team.editFailed"));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (busy) return;
    if (!confirm(t("team.confirmDeleteMessage"))) return;
    setBusy(true);
    try {
      await deleteChannelMessage(message.id);
      onChanged();
    } catch (error) {
      alert(error instanceof Error ? error.message : t("team.deleteFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isSelf ? "justify-end" : "justify-start"
      )}
    >
      {!isSelf && (
        <PersonAvatar
          name={message.authorName}
          size="sm"
          letters={2}
        />
      )}
      <div
        onContextMenu={(event) => {
          if (!canManage || editing) return;
          event.preventDefault();
          setMenu({ x: event.clientX, y: event.clientY });
        }}
        className={cn(
          "relative max-w-[85%] rounded-2xl px-3.5 py-2 sm:max-w-[70%]",
          canManage && !editing && "cursor-context-menu",
          isSelf
            ? cn(
                "rounded-br-md bg-blue-600 text-white",
                sendStatus === "failed" && "bg-red-600"
              )
            : "rounded-bl-md bg-white text-stone-800 shadow-sm"
        )}
      >
        {!isSelf && (
          <p className="mb-0.5 text-[10px] font-medium text-stone-500">
            {message.authorName}
          </p>
        )}

        {editing ? (
          <div className="space-y-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              className="w-full min-w-[220px] rounded-lg border border-white/30 bg-white/95 px-2.5 py-2 text-sm text-stone-800 outline-none focus:ring-2 focus:ring-blue-500/30"
              autoFocus
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setDraft(message.body);
                }}
                className="rounded-md bg-white/20 p-1.5 hover:bg-white/30"
                aria-label={t("common.cancel")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => void handleSaveEdit()}
                disabled={busy || !draft.trim()}
                className="rounded-md bg-white p-1.5 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                aria-label={t("common.save")}
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm whitespace-pre-wrap">{message.body}</p>
            <div
              className={cn(
                "mt-1 flex items-center gap-2 text-[10px]",
                isSelf ? "text-blue-100" : "text-stone-400"
              )}
            >
              <span>{formatTime(message.createdAt)}</span>
              {sendStatus === "failed" ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="font-medium underline underline-offset-2"
                >
                  {t("common.retry")}
                </button>
              ) : null}
              {message.editedAt && <span>· {t("team.edited")}</span>}
            </div>
          </>
        )}
      </div>

      {menu &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ left: menu.x, top: menu.y }}
            className="fixed z-100 min-w-[148px] overflow-hidden rounded-lg border border-stone-200 bg-white py-1 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
              onClick={() => {
                setMenu(null);
                setDraft(message.body);
                setEditing(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
              {t("common.edit")}
            </button>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              onClick={() => {
                setMenu(null);
                void handleDelete();
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("common.delete")}
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
