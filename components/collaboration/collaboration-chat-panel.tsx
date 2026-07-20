"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useSWR, { useSWRConfig } from "swr";
import { useSession } from "next-auth/react";
import { Check, Pencil, Send, Trash2, Video, X } from "lucide-react";
import type {
  CollaborationChannelItem,
  CollaborationMessageItem,
  ApprovalCardMetadata,
  MeetingCardMetadata,
} from "@/lib/collaboration/types";
import type { TeamMemberItem } from "@/lib/collaboration/team-types";
import {
  deleteChannelMessage,
  editChannelMessage,
  fetchChannelMessages,
  postChannelMeeting,
  postChannelMessage,
} from "@/lib/collaboration/fetch-actions";
import { ApprovalCardMessage } from "@/components/collaboration/approval-card-message";
import { MeetingCardMessage } from "@/components/collaboration/meeting-card-message";
import {
  AvatarStack,
  PersonAvatar,
} from "@/components/collaboration/person-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function fetchMembers() {
  const res = await fetch("/api/team/members");
  const data = (await res.json()) as {
    members?: TeamMemberItem[];
    error?: string;
  };
  if (!res.ok) throw new Error(data.error || "โหลดสมาชิกไม่สำเร็จ");
  return data.members ?? [];
}

export function CollaborationChatPanel({
  channel,
}: {
  channel: CollaborationChannelItem;
}) {
  const { data: session } = useSession();
  const { mutate: mutateGlobal } = useSWRConfig();
  const [text, setText] = useState("");
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetUrl, setMeetUrl] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], mutate } = useSWR<CollaborationMessageItem[]>(
    `collab-messages:${channel.id}`,
    () => fetchChannelMessages(channel.id),
    { refreshInterval: 5000, revalidateOnFocus: true }
  );
  const { data: members = [] } = useSWR("team-members", fetchMembers);

  const headerPeople =
    channel.kind === "dm"
      ? [channel.name]
      : members.map((member) => member.name);
  const memberCount =
    channel.kind === "dm" ? 2 : Math.max(members.length, headerPeople.length);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    void mutateGlobal("collab-channels");
  }, [channel.id, messages.length, mutateGlobal]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      await postChannelMessage(channel.id, text.trim());
      setText("");
      await mutate();
      void mutateGlobal("collab-channels");
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await postChannelMeeting(channel.id, {
        title: meetingTitle.trim(),
        meetUrl: meetUrl.trim(),
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
      });
      setShowMeetingForm(false);
      setMeetingTitle("");
      setMeetUrl("");
      setStartsAt("");
      setEndsAt("");
      await mutate();
      void mutateGlobal("collab-channels");
    } finally {
      setSubmitting(false);
    }
  };

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
          </div>
          {channel.contentCode && (
            <p className="text-xs text-stone-500">#{channel.contentCode}</p>
          )}
          {channel.kind === "dm" && channel.peerEmail && (
            <p className="truncate text-xs text-stone-500">{channel.peerEmail}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center">
          {channel.kind === "dm" ? (
            <PersonAvatar name={channel.name} size="md" />
          ) : (
            <AvatarStack names={headerPeople} max={4} size="sm" />
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isSelf={message.authorId === session?.user?.id}
            onChanged={() => {
              void mutate();
              void mutateGlobal("collab-channels");
            }}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-stone-200 bg-white p-3">
        {showMeetingForm ? (
          <form onSubmit={handleScheduleMeeting} className="mb-3 space-y-2">
            <p className="text-xs font-medium text-stone-700">นัด Google Meet</p>
            <Input
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="หัวข้อประชุม"
              className="h-9 text-sm"
              required
            />
            <Input
              value={meetUrl}
              onChange={(e) => setMeetUrl(e.target.value)}
              placeholder="ลิงก์ Google Meet"
              className="h-9 text-sm"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="h-9 text-sm"
                required
              />
              <Input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowMeetingForm(false)}
              >
                ยกเลิก
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                สร้างนัดประชุม
              </Button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowMeetingForm(true)}
            className="mb-2 flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            <Video className="h-3.5 w-3.5" />
            นัด Google Meet
          </button>
        )}

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="พิมพ์ข้อความ..."
            className="min-w-0 flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <Button type="submit" size="sm" disabled={submitting || !text.trim()}>
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
  onChanged,
}: {
  message: CollaborationMessageItem;
  isSelf: boolean;
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
          metadata={message.metadata as unknown as ApprovalCardMetadata}
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

  const isDeleted = Boolean(message.deletedAt);
  const canManage = isSelf && !isDeleted;

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
          isDeleted
            ? "rounded-bl-md border border-dashed border-stone-300 bg-stone-100 text-stone-500"
            : isSelf
              ? "rounded-br-md bg-blue-600 text-white"
              : "rounded-bl-md bg-white text-stone-800 shadow-sm"
        )}
      >
        {!isSelf && !isDeleted && (
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
            <p
              className={cn(
                "text-sm whitespace-pre-wrap",
                isDeleted && "italic"
              )}
            >
              {isDeleted ? "ข้อความถูกลบ" : message.body}
            </p>
            <div
              className={cn(
                "mt-1 flex items-center gap-2 text-[10px]",
                isDeleted
                  ? "text-stone-400"
                  : isSelf
                    ? "text-blue-100"
                    : "text-stone-400"
              )}
            >
              <span>{formatTime(message.createdAt)}</span>
              {message.editedAt && !isDeleted && <span>· แก้ไขแล้ว</span>}
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
