"use client";

import { useEffect } from "react";
import { CalendarDays, ChevronDown, X } from "lucide-react";
import type { MeetingItem } from "@/lib/collaboration/types";
import type { TeamMemberItem } from "@/lib/collaboration/types/team";
import { PersonAvatar } from "@/app/collaboration/_components/PersonAvatar";
import { useNewMeetingPanel } from "@/app/collaboration/_hooks/use-new-meeting-panel";
import { cn } from "@/lib/shared/utils";
import { dateLocale } from "@/lib/i18n";

export type MeetingKind = "meeting" | "blocked" | "personal";

export type NewMeetingDraft = {
  title: string;
  kind: MeetingKind;
  startsAt: Date;
  endsAt: Date;
  attendeeIds: string[];
  notes: string;
};

const START_HOURS = Array.from({ length: 21 }, (_, i) => {
  const minutes = 8 * 60 + i * 30;
  return { hours: Math.floor(minutes / 60), minutes: minutes % 60 };
});

function pad(v: number) {
  return String(v).padStart(2, "0");
}

const WEEKDAY_KEYS = [
  "team.weekdaySun",
  "team.weekdayMon",
  "team.weekdayTue",
  "team.weekdayWed",
  "team.weekdayThu",
  "team.weekdayFri",
  "team.weekdaySat",
] as const;

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
  onRangeChange,
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
  onRangeChange?: (range: { start: Date; end: Date; title: string }) => void;
}) {
  const {
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
    handleStartTimeChange,
    handleEndTimeChange,
    toggleAttendee,
    handleSubmit,
    t,
    locale,
  } = useNewMeetingPanel(
    selectedDate,
    prefillStart,
    prefillEnd,
    members,
    currentUserId,
    defaultAttendeeIds,
    meetingsByMemberId,
    onClose,
    onSubmit
  );

  useEffect(() => {
    onRangeChange?.({ start: startsAt, end: endsAt, title });
  }, [startsAt, endsAt, title, onRangeChange]);

  const loc = dateLocale(locale);
  const headerDate = day.toLocaleDateString(loc, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <aside className="flex h-full w-full shrink-0 flex-col border-l border-stone-200 bg-white md:w-[340px]">
      <div className="flex items-start justify-between border-b border-stone-200 px-5 pt-5 pb-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-stone-900">
            {t("team.newMeeting")}
          </h2>
          <p className="mt-0.5 text-sm text-stone-500">{headerDate}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
          aria-label={t("common.close")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 pt-5 pb-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("team.meetingTitlePlaceholder")}
            className="w-full border-0 border-b border-stone-200 bg-transparent px-0 pb-3 text-2xl font-bold text-stone-900 placeholder:font-bold placeholder:text-stone-400 outline-none transition focus:border-blue-400"
            required
          />

          <div>
            <p className="mb-2 text-[11px] font-bold tracking-wide text-stone-500 uppercase">
              {t("team.date")}
            </p>
            <div className="flex justify-between gap-1 overflow-x-auto pb-0.5">
              {weekDays.map((weekDay) => {
                const isSelected = weekDay.toDateString() === day.toDateString();
                const weekdayKey = WEEKDAY_KEYS[weekDay.getDay()];
                return (
                  <button
                    key={weekDay.toISOString()}
                    type="button"
                    onClick={() => setDay(weekDay)}
                    className="flex shrink-0 flex-col items-center gap-1.5 px-0.5 py-0.5 transition"
                  >
                    <span className="text-[11px] font-medium text-stone-400">
                      {t(weekdayKey)}
                    </span>
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition",
                        isSelected
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25"
                          : "text-stone-900 hover:bg-blue-50"
                      )}
                    >
                      {weekDay.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5">
              <span className="text-[11px] font-bold tracking-wide text-stone-500 uppercase">
                {t("team.startTime")}
              </span>
              <div className="relative">
                <select
                  value={`${pad(startHour)}:${pad(startMinute)}`}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-stone-200 bg-white px-3.5 pr-9 text-sm font-medium text-stone-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                >
                  {START_HOURS.map((slot) => (
                    <option
                      key={`${slot.hours}-${slot.minutes}`}
                      value={`${pad(slot.hours)}:${pad(slot.minutes)}`}
                    >
                      {new Date(2026, 0, 1, slot.hours, slot.minutes).toLocaleTimeString(
                        loc,
                        { hour: "numeric", minute: "2-digit" }
                      )}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-stone-500" />
              </div>
            </label>
            <label className="space-y-1.5">
              <span className="text-[11px] font-bold tracking-wide text-stone-500 uppercase">
                {t("team.endTime")}
              </span>
              <div className="relative">
                <select
                  value={`${pad(endHour)}:${pad(endMinute)}`}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-stone-200 bg-white px-3.5 pr-9 text-sm font-medium text-stone-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                >
                  {START_HOURS.map((slot) => (
                    <option
                      key={`${slot.hours}-${slot.minutes}`}
                      value={`${pad(slot.hours)}:${pad(slot.minutes)}`}
                    >
                      {new Date(2026, 0, 1, slot.hours, slot.minutes).toLocaleTimeString(
                        loc,
                        { hour: "numeric", minute: "2-digit" }
                      )}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-stone-500" />
              </div>
            </label>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-bold tracking-wide text-stone-500 uppercase">
              {t("team.attendees")}
            </p>
            <div className="space-y-0.5">
              {members.map((member) => {
                const checked = attendeeIds.includes(member.id);
                const busy = busyIds.has(member.id);
                const locked = member.id === currentUserId;
                return (
                  <label
                    key={member.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-1.5 py-2.5 transition hover:bg-stone-50"
                  >
                    <PersonAvatar
                      name={member.name}
                      imageUrl={member.imageUrl}
                      size="md"
                      letters={2}
                      className="ring-0!"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-stone-900">
                        {member.name}
                      </span>
                      {busy ? (
                        <span className="text-[11px] font-semibold text-rose-600">
                          {t("team.busyAtThisTime")}
                        </span>
                      ) : null}
                    </span>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={locked}
                      onChange={() => toggleAttendee(member.id)}
                      className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-5 py-4">
          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 text-sm font-bold text-white transition hover:bg-blue-600 disabled:opacity-50"
          >
            <CalendarDays className="h-4 w-4" />
            {t("team.scheduleMeeting")}
          </button>
        </div>
      </form>
    </aside>
  );
}
