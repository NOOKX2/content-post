"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Pencil, Trash2, X } from "lucide-react";
import type { ApprovalCardMetadata, MeetingCardMetadata } from "@/lib/collaboration/types";
import { isClientMessageId } from "@/lib/collaboration/data/chat-outbox";
import type { ChatDisplayMessage } from "@/lib/collaboration/client/use-chat-send-queue";
import { ApprovalCardMessage } from "@/app/collaboration/_components/ApprovalCardMessage";
import { MeetingCardMessage } from "@/app/collaboration/_components/MeetingCardMessage";
import { PersonAvatar } from "@/app/collaboration/_components/PersonAvatar";
import {
  deleteChannelMessage,
  editChannelMessage,
} from "@/lib/collaboration/actions/fetch";
import { dateLocale, translateStoredMessage, useT } from "@/lib/i18n";
import { cn } from "@/lib/shared/utils";

function formatTime(iso: string, locale: "th" | "en") {
  return new Date(iso).toLocaleTimeString(dateLocale(locale), {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({
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
  const { t, locale } = useT();
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
      <div className="flex w-full items-start gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2"/>
            <circle cx="12" cy="5" r="2"/>
            <path d="M12 7v4"/>
            <path d="M8 15h.01M12 15h.01M16 15h.01"/>
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1.5 text-xs text-stone-500">
            <span className="font-semibold text-stone-700">Approval Bot</span>
            <span className="mx-1.5">·</span>
            {formatTime(message.createdAt, locale)}
          </p>
          <ApprovalCardMessage
            messageId={message.id}
            metadata={message.metadata as unknown as ApprovalCardMetadata}
            createdAt={message.createdAt}
            onResolved={onChanged}
          />
        </div>
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
        <p className="max-w-2xl px-2 py-1 text-center text-xs text-stone-500">
          {translateStoredMessage(message.body, t)}
        </p>
      </div>
    );
  }

  const isUnsent = isClientMessageId(message.id);
  const canManage = isSelf && !isUnsent && !sendStatus;
  const timeLabel = formatTime(message.createdAt, locale);

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
        "flex items-end gap-2.5",
        isSelf ? "flex-row-reverse" : "flex-row"
      )}
    >
      <PersonAvatar
        name={message.authorName}
        size="md"
        letters={2}
        className="mb-0.5 ring-0!"
      />

      <div
        className={cn(
          "flex min-w-0 max-w-[85%] flex-col sm:max-w-[70%]",
          isSelf ? "items-end" : "items-start"
        )}
      >
        <p
          className={cn(
            "mb-1 flex items-center gap-1.5 text-xs text-stone-500",
            isSelf && "flex-row-reverse"
          )}
        >
          <span className="font-semibold text-stone-700">
            {isSelf ? t("common.you") : message.authorName}
          </span>
          <span>{timeLabel}</span>
          {message.editedAt ? <span>· {t("team.edited")}</span> : null}
        </p>

        <div
          onContextMenu={(event) => {
            if (!canManage || editing) return;
            event.preventDefault();
            setMenu({ x: event.clientX, y: event.clientY });
          }}
          className={cn(
            "relative rounded-2xl px-3.5 py-2.5",
            canManage && !editing && "cursor-context-menu",
            isSelf
              ? cn(
                  "rounded-br-md bg-blue-600 text-white",
                  sendStatus === "failed" && "bg-red-600"
                )
              : "rounded-bl-md border border-stone-200 bg-white text-stone-800"
          )}
        >
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
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.body}
              </p>
              {sendStatus === "failed" ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-1 text-[11px] font-medium text-white/90 underline underline-offset-2"
                >
                  {t("common.retry")}
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>

      {menu &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ left: menu.x, top: menu.y }}
            className="fixed z-100 min-w-[148px] overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg"
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
