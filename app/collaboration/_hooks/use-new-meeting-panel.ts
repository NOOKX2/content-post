"use client";

import { useEffect, useMemo, useState } from "react";
import type { MeetingItem } from "@/lib/collaboration/types";
import type { TeamMemberItem } from "@/lib/collaboration/types/team";
import type { MeetingKind, NewMeetingDraft } from "@/app/collaboration/_components/NewMeetingPanel";
import {
  addDays,
  combineDateAndTime,
  meetingOverlaps,
  startOfMondayWeek,
} from "@/app/collaboration/_lib/calendar-utils";
import { useT } from "@/lib/i18n";

export function useNewMeetingPanel(
  selectedDate: Date,
  prefillStart: Date | null | undefined,
  prefillEnd: Date | null | undefined,
  members: TeamMemberItem[],
  currentUserId: string | undefined,
  defaultAttendeeIds: string[],
  meetingsByMemberId: Record<string, MeetingItem[]>,
  onClose: () => void,
  onSubmit: (draft: NewMeetingDraft) => void
) {
  const { t, locale } = useT();
  const weekStart = startOfMondayWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<MeetingKind>("meeting");
  const [day, setDay] = useState(selectedDate);
  const [startHour, setStartHour] = useState(prefillStart?.getHours() ?? 10);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(
    prefillEnd?.getHours() ?? (prefillStart ? prefillStart.getHours() + 1 : 11)
  );
  const [endMinute, setEndMinute] = useState(0);
  const [attendeeIds, setAttendeeIds] = useState<string[]>(defaultAttendeeIds);
  const [notes, setNotes] = useState("");

  useEffect(() => { setDay(selectedDate); }, [selectedDate]);
  useEffect(() => {
    if (!prefillStart) return;
    setDay(prefillStart);
    setStartHour(prefillStart.getHours());
    setStartMinute(prefillStart.getMinutes() >= 30 ? 30 : 0);
  }, [prefillStart]);
  useEffect(() => {
    if (!prefillEnd || !prefillStart) return;
    setEndHour(prefillEnd.getHours());
    setEndMinute(prefillEnd.getMinutes() >= 30 ? 30 : 0);
  }, [prefillEnd, prefillStart]);
  useEffect(() => { setAttendeeIds(defaultAttendeeIds); }, [defaultAttendeeIds]);

  const startsAt = combineDateAndTime(day, startHour, startMinute);
  const endsAt = combineDateAndTime(day, endHour, endMinute);

  const busyIds = useMemo(() => {
    const busy = new Set<string>();
    for (const member of members) {
      const meetings = meetingsByMemberId[member.id] ?? [];
      if (meetings.some((m) => meetingOverlaps(m, startsAt, endsAt))) busy.add(member.id);
    }
    return busy;
  }, [members, meetingsByMemberId, startsAt, endsAt]);

  const handleStartTimeChange = (value: string) => {
    const [hours, minutes] = value.split(":").map(Number);
    setStartHour(hours);
    setStartMinute(minutes);
    const nextStart = combineDateAndTime(day, hours, minutes);
    const nextEnd = new Date(nextStart);
    nextEnd.setMinutes(nextEnd.getMinutes() + 60);
    setEndHour(nextEnd.getHours());
    setEndMinute(nextEnd.getMinutes() >= 30 ? 30 : 0);
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
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const fallbackTitle =
      kind === "blocked" ? t("team.meetingKindBlocked")
      : kind === "personal" ? t("team.meetingKindPersonal")
      : title.trim();
    const resolved = title.trim() || fallbackTitle;
    if (!resolved) return;
    onSubmit({ title: resolved, kind, startsAt, endsAt, attendeeIds, notes: notes.trim() });
  };

  const kinds: { id: MeetingKind; label: string }[] = [
    { id: "meeting", label: t("team.meetingKindMeeting") },
    { id: "blocked", label: t("team.meetingKindBlocked") },
    { id: "personal", label: t("team.meetingKindPersonal") },
  ];

  return {
    // form state
    title, setTitle,
    kind, setKind,
    day, setDay,
    startHour, startMinute,
    endHour, endMinute,
    attendeeIds,
    notes, setNotes,
    // computed
    weekDays,
    startsAt,
    endsAt,
    busyIds,
    kinds,
    currentUserId,
    // handlers
    handleStartTimeChange,
    handleEndTimeChange,
    toggleAttendee,
    handleSubmit,
    // i18n
    t,
    locale,
  };
}
