"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { MeetingDraft } from "@/app/collaboration/_components/ScheduleMeetingDialog";
import { meetingDraftSchema } from "@/lib/content/domain/form-schema";

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
  const form = useForm({
    resolver: zodResolver(meetingDraftSchema),
    defaultValues: {
      title: "",
      meetUrl: "",
      startsAt: toLocalInputValue(prefillStart),
      endsAt: toLocalInputValue(prefillEnd),
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: "",
        meetUrl: "",
        startsAt: toLocalInputValue(prefillStart),
        endsAt: toLocalInputValue(prefillEnd),
      });
    }
  }, [open, prefillStart, prefillEnd, form]);

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({
      title: values.title.trim(),
      meetUrl: values.meetUrl.trim(),
      startsAt: new Date(values.startsAt).toISOString(),
      endsAt: new Date(values.endsAt).toISOString(),
    });
  });

  return {
    register: form.register,
    watch: form.watch,
    handleSubmit,
  };
}
