"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { MeetingItem } from "@/lib/collaboration/types";
import type { TeamMemberItem } from "@/lib/collaboration/types/team";
import type { NewMeetingDraft } from "@/app/collaboration/_components/NewMeetingPanel";
import {
  addDays,
  combineDateAndTime,
  meetingOverlaps,
  startOfMondayWeek,
} from "@/app/collaboration/_lib/calendar-utils";
import { useT } from "@/lib/i18n";

const newMeetingFieldsSchema = z.object({
  title: z.string(),
});

export function useNewMeetingPanel(
  selectedDate: Date,
  prefillStart: Date | null | undefined,
  prefillEnd: Date | null | undefined,
  members: TeamMemberItem[],
  currentUserId: string | undefined,
  defaultAttendeeIds: string[],
  meetingsByMemberId: Record<string, MeetingItem[]>,
  _onClose: () => void,
  onSubmit: (draft: NewMeetingDraft) => void
) {
  const { t, locale } = useT();
  const weekStart = startOfMondayWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const form = useForm({
    resolver: zodResolver(newMeetingFieldsSchema),
    defaultValues: { title: "" },
  });
  const title = form.watch("title");
  const setTitle = (value: string) => form.setValue("title", value);

  const [day, setDay] = useState(selectedDate);
  const [startHour, setStartHour] = useState(prefillStart?.getHours() ?? 10);
  const [startMinute, setStartMinute] = useState(
    prefillStart && prefillStart.getMinutes() >= 30 ? 30 : 0
  );
  const [endHour, setEndHour] = useState(
    prefillEnd?.getHours() ?? (prefillStart ? prefillStart.getHours() + 1 : 11)
  );
  const [endMinute, setEndMinute] = useState(
    prefillEnd && prefillEnd.getMinutes() >= 30 ? 30 : 0
  );
  const [attendeeIds, setAttendeeIds] = useState<string[]>(defaultAttendeeIds);

  useEffect(() => {
    setDay(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (!prefillStart || !prefillEnd) return;
    setDay(new Date(prefillStart));
    setStartHour(prefillStart.getHours());
    setStartMinute(prefillStart.getMinutes() >= 30 ? 30 : 0);
    setEndHour(prefillEnd.getHours());
    setEndMinute(prefillEnd.getMinutes() >= 30 ? 30 : 0);
  }, [prefillStart?.getTime(), prefillEnd?.getTime()]);

  useEffect(() => {
    setAttendeeIds(defaultAttendeeIds);
  }, [defaultAttendeeIds]);

  const startsAt = useMemo(
    () => combineDateAndTime(day, startHour, startMinute),
    [day, startHour, startMinute]
  );
  const endsAt = useMemo(
    () => combineDateAndTime(day, endHour, endMinute),
    [day, endHour, endMinute]
  );

  const busyIds = useMemo(() => {
    const busy = new Set<string>();
    for (const member of members) {
      const meetings = meetingsByMemberId[member.id] ?? [];
      if (meetings.some((m) => meetingOverlaps(m, startsAt, endsAt))) {
        busy.add(member.id);
      }
    }
    return busy;
  }, [members, meetingsByMemberId, startsAt, endsAt]);

  const handleStartTimeChange = (value: string) => {
    const [hours, minutes] = value.split(":").map(Number);
    setStartHour(hours);
    setStartMinute(minutes);
    const nextStart = combineDateAndTime(day, hours, minutes);
    const nextEnd = combineDateAndTime(day, endHour, endMinute);
    if (nextEnd <= nextStart) {
      const fixed = new Date(nextStart);
      fixed.setMinutes(fixed.getMinutes() + 60);
      setEndHour(fixed.getHours());
      setEndMinute(fixed.getMinutes() >= 30 ? 30 : 0);
    }
  };

  const handleEndTimeChange = (value: string) => {
    const [hours, minutes] = value.split(":").map(Number);
    const nextStart = combineDateAndTime(day, startHour, startMinute);
    const nextEnd = combineDateAndTime(day, hours, minutes);
    if (nextEnd <= nextStart) {
      const fixed = new Date(nextStart);
      fixed.setMinutes(fixed.getMinutes() + 60);
      setEndHour(fixed.getHours());
      setEndMinute(fixed.getMinutes() >= 30 ? 30 : 0);
      return;
    }
    setEndHour(hours);
    setEndMinute(minutes);
  };

  const toggleAttendee = (memberId: string) => {
    setAttendeeIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = form.handleSubmit((values) => {
    const resolved = values.title.trim();
    if (!resolved) return;
    onSubmit({
      title: resolved,
      kind: "meeting",
      startsAt,
      endsAt,
      attendeeIds,
      notes: "",
    });
  });

  return {
    title,
    setTitle,
    day,
    setDay,
    startHour,
    startMinute,
    endHour,
    endMinute,
    attendeeIds,
    weekDays,
    startsAt,
    endsAt,
    busyIds,
    currentUserId,
    handleStartTimeChange,
    handleEndTimeChange,
    toggleAttendee,
    handleSubmit,
    t,
    locale,
  };
}
