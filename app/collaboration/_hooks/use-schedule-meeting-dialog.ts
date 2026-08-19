"use client";

import { useEffect, useState } from "react";
import type { MeetingDraft } from "@/app/collaboration/_components/ScheduleMeetingDialog";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function toLocalInputValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function useScheduleMeetingDialog(
  open: boolean,
  prefillStart: Date,
  prefillEnd: Date,
  onSubmit: (draft: MeetingDraft) => void
) {
  const [title, setTitle] = useState("");
  const [meetUrl, setMeetUrl] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  useEffect(() => {
    if (open) {
      setTitle("");
      setMeetUrl("");
      setStartsAt(toLocalInputValue(prefillStart));
      setEndsAt(toLocalInputValue(prefillEnd));
    }
  }, [open, prefillStart, prefillEnd]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      title: title.trim(),
      meetUrl: meetUrl.trim(),
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
    });
  };

  return {
    title, setTitle,
    meetUrl, setMeetUrl,
    startsAt, setStartsAt,
    endsAt, setEndsAt,
    handleSubmit,
  };
}
