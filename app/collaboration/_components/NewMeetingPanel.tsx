"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import type { MeetingItem } from "@/lib/collaboration/types";
import type { TeamMemberItem } from "@/lib/collaboration/types/team";
import { PersonAvatar } from "@/app/collaboration/_components/PersonAvatar";
import {
  addDays,
  combineDateAndTime,
  meetingOverlaps,
  sameDay,
  startOfMondayWeek,
} from "@/app/collaboration/_lib/calendar-utils";
import { cn } from "@/lib/shared/utils";
import { useT } from "@/lib/i18n";

export type MeetingKind = "meeting" | "blocked" | "personal";

export type NewMeetingDraft = {
  title: string;
  kind: MeetingKind;
  startsAt: Date;
  endsAt: Date;
  attendeeIds: string[];
  notes: string;
};

const START_HOURS = Array.from({ length: 21 }, (_, index) => {
  const minutes = 8 * 60 + index * 30;
  return { hours: Math.floor(minutes / 60), minutes: minutes % 60 };
});

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function NewMeetingPanel({
  selectedDate,
  prefillStart,
  prefillEnd,
  members,
  currentUserId,
  defaultAttendeeIds,
  meetingsByMemberId,
  submitting,
  onClose,
  onSubmit,
}: {
  selectedDate: Date;
  prefillStart?: Date | null;
  prefillEnd?: Date | null;
  members: TeamMemberItem[];
  currentUserId?: string;
  defaultAttendeeIds: string[];
  meetingsByMemberId: Record<string, MeetingItem[]>;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (draft: NewMeetingDraft) => void;
}) {
  const { t } = useT();
  const weekStart = startOfMondayWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<MeetingKind>("meeting");
  const [day, setDay] = useState(selectedDate);
  const [startHour, setStartHour] = useState(
    prefillStart?.getHours() ?? 10
  );
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(
    prefillEnd?.getHours() ?? (prefillStart ? prefillStart.getHours() + 1 : 11)
  );
  const [endMinute, setEndMinute] = useState(0);
  const [attendeeIds, setAttendeeIds] = useState<string[]>(defaultAttendeeIds);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setDay(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (!prefillStart) return;
    const nextDay = prefillStart;
    setDay(nextDay);
    setStartHour(nextDay.getHours());
    setStartMinute(nextDay.getMinutes() >= 30 ? 30 : 0);
  }, [prefillStart]);

  useEffect(() => {
    if (!prefillEnd || !prefillStart) return;
    setEndHour(prefillEnd.getHours());
    setEndMinute(prefillEnd.getMinutes() >= 30 ? 30 : 0);
  }, [prefillEnd, prefillStart]);

  useEffect(() => {
    setAttendeeIds(defaultAttendeeIds);
  }, [defaultAttendeeIds]);

  const startsAt = combineDateAndTime(day, startHour, startMinute);
  const endsAt = combineDateAndTime(day, endHour, endMinute);

  const busyIds = useMemo(() => {
    const busy = new Set<string>();
    for (const member of members) {
      const meetings = meetingsByMemberId[member.id] ?? [];
      if (meetings.some((meeting) => meetingOverlaps(meeting, startsAt, endsAt))) {
        busy.add(member.id);
      }
    }
    return busy;
  }, [members, meetingsByMemberId, startsAt, endsAt]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const fallbackTitle =
      kind === "blocked"
        ? "Focus Block"
        : kind === "personal"
          ? t("team.meetingKindPersonal")
          : title.trim();
    const resolved = title.trim() || fallbackTitle;
    if (!resolved) return;
    onSubmit({
      title: resolved,
      kind,
      startsAt,
      endsAt,
      attendeeIds,
      notes: notes.trim(),
    });
  };

  const kinds: { id: MeetingKind; label: string }[] = [
    { id: "meeting", label: t("team.meetingKindMeeting") },
    { id: "blocked", label: t("team.meetingKindBlocked") },
    { id: "personal", label: t("team.meetingKindPersonal") },
  ];

  return (
    <aside className="flex h-full w-full shrink-0 flex-col border-l border-stone-200 bg-white md:w-[340px]">
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-stone-900">{t("team.newMeeting")}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          aria-label={t("common.close")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t("team.meetingTitlePlaceholder")}
            className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            required={kind === "meeting"}
          />

          <div className="flex rounded-xl bg-stone-100 p-1">
            {kinds.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setKind(item.id)}
                className={cn(
                  "flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition",
                  kind === item.id
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-800"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1 overflow-x-auto">
            {weekDays.map((weekDay) => {
              const selected = sameDay(weekDay, day);
              return (
                <button
                  key={weekDay.toISOString()}
                  type="button"
                  onClick={() => setDay(weekDay)}
                  className={cn(
                    "flex h-14 w-10 shrink-0 flex-col items-center justify-center rounded-xl text-[11px]",
                    selected
                      ? "bg-blue-600 text-white"
                      : "text-stone-500 hover:bg-stone-100"
                  )}
                >
                  <span className="text-[9px] font-semibold uppercase opacity-70">
                    {weekDay.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2)}
                  </span>
                  <span className="text-sm font-semibold">{weekDay.getDate()}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1">
              <span className="text-[10px] font-semibold tracking-wide text-stone-500 uppercase">
                {t("team.startTime")}
              </span>
              <select
                value={`${pad(startHour)}:${pad(startMinute)}`}
                onChange={(event) => {
                  const [hours, minutes] = event.target.value.split(":").map(Number);
                  setStartHour(hours);
                  setStartMinute(minutes);
                  // If end time is now invalid, move it forward by 60 minutes.
                  const nextStart = combineDateAndTime(day, hours, minutes);
                  const nextEnd = new Date(nextStart);
                  nextEnd.setMinutes(nextEnd.getMinutes() + 60);
                  const nextEndHour = nextEnd.getHours();
                  const nextEndMinute = nextEnd.getMinutes() >= 30 ? 30 : 0;
                  setEndHour(nextEndHour);
                  setEndMinute(nextEndMinute);
                }}
                className="h-10 w-full rounded-xl border border-stone-200 bg-white px-2 text-sm text-stone-900 outline-none"
              >
                {START_HOURS.map((slot) => (
                  <option
                    key={`${slot.hours}-${slot.minutes}`}
                    value={`${pad(slot.hours)}:${pad(slot.minutes)}`}
                  >
                    {new Date(2026, 0, 1, slot.hours, slot.minutes).toLocaleTimeString(
                      "en-US",
                      { hour: "numeric", minute: "2-digit" }
                    )}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-semibold tracking-wide text-stone-500 uppercase">
                {t("team.endTime")}
              </span>
              <select
                value={`${pad(endHour)}:${pad(endMinute)}`}
                onChange={(event) => {
                  const [hours, minutes] = event.target.value.split(":").map(Number);
                  const nextStart = combineDateAndTime(day, startHour, startMinute);
                  const nextEnd = combineDateAndTime(day, hours, minutes);
                  if (nextEnd <= nextStart) {
                    const fixedEnd = new Date(nextStart);
                    fixedEnd.setMinutes(fixedEnd.getMinutes() + 60);
                    setEndHour(fixedEnd.getHours());
                    setEndMinute(fixedEnd.getMinutes() >= 30 ? 30 : 0);
                    return;
                  }
                  setEndHour(hours);
                  setEndMinute(minutes);
                }}
                className="h-10 w-full rounded-xl border border-stone-200 bg-white px-2 text-sm text-stone-900 outline-none"
              >
                {START_HOURS.map((slot) => (
                  <option
                    key={`${slot.hours}-${slot.minutes}`}
                    value={`${pad(slot.hours)}:${pad(slot.minutes)}`}
                  >
                    {new Date(2026, 0, 1, slot.hours, slot.minutes).toLocaleTimeString(
                      "en-US",
                      { hour: "numeric", minute: "2-digit" }
                    )}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-semibold tracking-wide text-stone-500 uppercase">
              {t("team.attendees")}
            </p>
            <div className="space-y-1">
              {members.map((member) => {
                const checked = attendeeIds.includes(member.id);
                const busy = busyIds.has(member.id);
                const locked = member.id === currentUserId;
                return (
                  <label
                    key={member.id}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-stone-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={locked}
                      onChange={() => {
                        setAttendeeIds((current) =>
                          current.includes(member.id)
                            ? current.filter((id) => id !== member.id)
                            : [...current, member.id]
                        );
                      }}
                      className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
                    />
                    <PersonAvatar
                      name={member.name}
                      imageUrl={member.imageUrl}
                      size="sm"
                      letters={2}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-stone-800">
                        {member.name}
                      </span>
                      {busy ? (
                        <span className="text-[11px] font-medium text-rose-600">
                          {t("team.busyAtThisTime")}
                        </span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <label className="block space-y-1">
            <span className="text-[10px] font-semibold tracking-wide text-stone-500 uppercase">
              {t("team.notes")}
            </span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={t("team.notesPlaceholder")}
              rows={4}
              className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-blue-500 focus:bg-white"
            />
          </label>
        </div>

        <div className="border-t border-stone-200 p-4">
          <button
            type="submit"
            disabled={submitting || (kind === "meeting" && !title.trim())}
            className="h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {t("team.scheduleMeeting")}
          </button>
        </div>
      </form>
    </aside>
  );
}
