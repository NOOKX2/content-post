"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useSWR, { useSWRConfig } from "swr";
import { useSession } from "next-auth/react";
import { Check, CalendarDays, Pencil, Send, Trash2, X } from "lucide-react";
import type {
  CollaborationChannelItem,
  CollaborationMessageItem,
  ApprovalCardMetadata,
  MeetingCardMetadata,
} from "@/lib/collaboration/types";
import type { TeamMemberItem } from "@/lib/collaboration/team-types";
import {
  COLLAB_CHANNELS_KEY,
  collabMessagesKey,
  TEAM_MEMBERS_KEY,
  useCollaborationBootstrap,
} from "@/lib/collaboration/collaboration-provider";
import {
  deleteChannelMessage,
  editChannelMessage,
  fetchChannelMessages,
} from "@/lib/collaboration/fetch-actions";
import {
  isClientMessageId,
} from "@/lib/collaboration/chat-outbox";
import {
  mergeMessagesWithOutbox,
  useChatSendQueue,
  type ChatDisplayMessage,
} from "@/lib/collaboration/use-chat-send-queue";
import { fetchTeamMembers } from "@/lib/collaboration/team-actions";
import { ApprovalCardMessage } from "@/components/collaboration/approval-card-message";
import { ChannelCalendarView } from "@/components/collaboration/channel-calendar-view";
import { GroupMembersDialog } from "@/components/collaboration/group-members-dialog";
import { MemberCalendarView } from "@/components/collaboration/member-calendar-view";
import { MeetingCardMessage } from "@/components/collaboration/meeting-card-message";
import {
  AvatarStack,
  PersonAvatar,
} from "@/components/collaboration/person-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CollaborationChatPanel({
  channel,
  onLeave,
}: {
  channel: CollaborationChannelItem;
  onLeave?: () => void;
}) {
  const { data: session } = useSession();
  const bootstrap = useCollaborationBootstrap();
  const { mutate: mutateGlobal } = useSWRConfig();
  const [text, setText] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [showChannelCalendar, setShowChannelCalendar] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], mutate } = useSWR<CollaborationMessageItem[]>(
    collabMessagesKey(channel.id),
    () => fetchChannelMessages(channel.id),
    {
      fallbackData: bootstrap?.initialMessagesByChannelId[channel.id],
      revalidateOnMount: !bootstrap?.initialMessagesByChannelId[channel.id],
      refreshInterval: 1000,
      revalidateOnFocus: true,
      refreshWhenHidden: false,
    }
  );
  const { data: members = [] } = useSWR(TEAM_MEMBERS_KEY, fetchTeamMembers, {
    fallbackData: bootstrap?.members,
    revalidateOnMount: !bootstrap,
  });

  const onMessageSaved = useCallback(
    (saved: CollaborationMessageItem) => {
      void mutate(
        (current = []) => {
          if (current.some((message) => message.id === saved.id)) {
            return current;
          }
          return [...current, saved];
        },
        { revalidate: false }
      );
      void mutateGlobal(COLLAB_CHANNELS_KEY);
    },
    [mutate, mutateGlobal]
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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  useEffect(() => {
    setShowChannelCalendar(false);
  }, [channel.id]);

  useEffect(() => {
    void mutateGlobal(COLLAB_CHANNELS_KEY);
  }, [channel.id, messages.length, mutateGlobal]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !session?.user?.id) return;

    enqueue(text.trim());
    setText("");
  };

  const scheduleHint =
    channel.kind === "dm"
      ? "นัดประชุม 1:1"
      : channel.kind === "team"
        ? "นัดประชุมทีม"
        : "นัดประชุมกลุ่ม";

  if (showChannelCalendar) {
    if (channel.kind === "dm" && channel.peerUserId) {
      return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <MemberCalendarView
            userId={channel.peerUserId}
            memberName={channel.name}
            channelId={channel.id}
            subtitle="ดูช่วงที่มีนัดร่วมกัน เพื่อเลือกเวลาที่ว่าง"
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
    <div className="flex min-h-0 flex-1 flex-col bg-stone-50">
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 bg-white px-4 py-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-stone-900">
              {channel.name}
            </h2>
            {channel.kind === "team" && (
              <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">
                {memberCount} Members
              </span>
            )}
            {channel.kind === "group" && (
              <button
                type="button"
                onClick={() => setShowMembers(true)}
                className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700 transition-colors hover:bg-violet-100"
              >
                {memberCount} สมาชิก
              </button>
            )}
          </div>
          {channel.contentCode && (
            <p className="text-xs text-stone-500">#{channel.contentCode}</p>
          )}
          {channel.kind === "dm" && channel.peerEmail && (
            <p className="truncate text-xs text-stone-500">{channel.peerEmail}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {(channel.kind === "dm" && channel.peerUserId) ||
          channel.kind === "team" ||
          channel.kind === "group" ? (
            <Button
              type="button"
              size="sm"
              onClick={() => setShowChannelCalendar(true)}
              title={
                channel.kind === "dm"
                  ? `ดูปฏิทินและนัดประชุมกับ ${channel.name}`
                  : `ดูปฏิทินและนัด${scheduleHint}ในห้องนี้`
              }
            >
              <CalendarDays className="h-4 w-4" />
              นัดประชุม
            </Button>
          ) : null}
          {channel.kind === "dm" ? (
            <PersonAvatar name={channel.name} size="md" />
          ) : channel.kind === "group" ? (
            <button
              type="button"
              onClick={() => setShowMembers(true)}
              className="rounded-full transition hover:opacity-80"
              title="ดูสมาชิกในกลุ่ม"
            >
              <AvatarStack names={headerPeople} max={4} size="sm" />
            </button>
          ) : (
            <AvatarStack names={headerPeople} max={4} size="sm" />
          )}
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
            void mutate();
            void mutateGlobal(COLLAB_CHANNELS_KEY);
          }}
          onLeft={() => {
            setShowMembers(false);
            void mutateGlobal(COLLAB_CHANNELS_KEY);
            onLeave?.();
          }}
        />
      )}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {displayMessages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isSelf={message.authorId === session?.user?.id}
            sendStatus={message.sendStatus}
            onRetry={
              message.sendStatus === "failed"
                ? () => retry(message.id)
                : undefined
            }
            onChanged={() => {
              void mutate();
              void mutateGlobal(COLLAB_CHANNELS_KEY);
            }}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-stone-200 bg-white p-3">
        {(channel.kind === "dm" && channel.peerUserId) ||
        channel.kind === "team" ||
        channel.kind === "group" ? (
          <p className="mb-2 flex flex-wrap items-center gap-1 text-xs text-stone-500">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-blue-600" />
            <span>{scheduleHint} → กดปุ่ม</span>
            <button
              type="button"
              onClick={() => setShowChannelCalendar(true)}
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              นัดประชุม
            </button>
            <span>ด้านบนขวา เพื่อดูปฏิทินและเลือกเวลา</span>
          </p>
        ) : null}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="พิมพ์ข้อความ..."
            className="min-w-0 flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <Button type="submit" size="sm" disabled={!text.trim()}>
            <Send className="h-4 w-4" />
          </Button>
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
          {message.body}
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
      alert(error instanceof Error ? error.message : "แก้ไขไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (busy) return;
    if (!confirm("ลบข้อความนี้?")) return;
    setBusy(true);
    try {
      await deleteChannelMessage(message.id);
      onChanged();
    } catch (error) {
      alert(error instanceof Error ? error.message : "ลบไม่สำเร็จ");
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
      {!isSelf && <PersonAvatar name={message.authorName} size="sm" />}
      <div
        onContextMenu={(event) => {
          if (!canManage || editing) return;
          event.preventDefault();
          setMenu({ x: event.clientX, y: event.clientY });
        }}
        className={cn(
          "relative max-w-[85%] rounded-2xl px-3.5 py-2.5 sm:max-w-[70%]",
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
          <p className="mb-0.5 text-[10px] font-medium opacity-70">
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
                aria-label="ยกเลิกการแก้ไข"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => void handleSaveEdit()}
                disabled={busy || !draft.trim()}
                className="rounded-md bg-white p-1.5 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                aria-label="บันทึก"
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
                  ส่งอีกครั้ง
                </button>
              ) : null}
              {message.editedAt && <span>· แก้ไขแล้ว</span>}
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
              แก้ไข
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
              ลบ
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
