"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { Send, Video } from "lucide-react";
import type {
  CollaborationChannelItem,
  CollaborationMessageItem,
  ApprovalCardMetadata,
  MeetingCardMetadata,
} from "@/lib/collaboration/types";
import {
  fetchChannelMessages,
  postChannelMeeting,
  postChannelMessage,
} from "@/lib/collaboration/fetch-actions";
import { ApprovalCardMessage } from "@/components/collaboration/approval-card-message";
import { MeetingCardMessage } from "@/components/collaboration/meeting-card-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CollaborationChatPanel({
  channel,
}: {
  channel: CollaborationChannelItem;
}) {
  const { data: session } = useSession();
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      await postChannelMessage(channel.id, text.trim());
      setText("");
      mutate();
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
      mutate();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-stone-50">
      <div className="border-b border-stone-200 bg-white px-4 py-3">
        <h2 className="text-sm font-semibold text-stone-900">{channel.name}</h2>
        {channel.contentCode && (
          <p className="text-xs text-stone-500">#{channel.contentCode}</p>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isSelf={message.authorId === session?.user?.id}
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
}: {
  message: CollaborationMessageItem;
  isSelf: boolean;
}) {
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

  return (
    <div className={cn("flex", isSelf ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 sm:max-w-[70%]",
          isSelf
            ? "rounded-br-md bg-blue-600 text-white"
            : "rounded-bl-md bg-white text-stone-800 shadow-sm"
        )}
      >
        {!isSelf && (
          <p className="mb-0.5 text-[10px] font-medium opacity-70">
            {message.authorName}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap">{message.body}</p>
        <p
          className={cn(
            "mt-1 text-[10px]",
            isSelf ? "text-blue-100" : "text-stone-400"
          )}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
