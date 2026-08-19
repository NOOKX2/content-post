"use client";

import { X } from "lucide-react";
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
  const {
    title, setTitle,
    kind, setKind,
    day, setDay,
    startHour, startMinute,
    endHour, endMinute,
    attendeeIds,
    notes, setNotes,
    weekDays,
    busyIds,
    kinds,
    handleStartTimeChange,
    handleEndTimeChange,
    toggleAttendee,
    handleSubmit,
    t,
    locale,
  } = useNewMeetingPanel(
    selectedDate, prefillStart, prefillEnd, members,
    currentUserId, defaultAttendeeIds, meetingsByMemberId, onClose, onSubmit
  );

  return (
    <aside className="flex h-full w-full shrink-0 flex-col border-l border-stone-200 bg-white md:w-85">
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-stone-900">{t("team.newMeeting")}</h2>
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700" aria-label={t("common.close")}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("team.meetingTitlePlaceholder")}
            className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            required={kind === "meeting"}
          />

          {/* Kind tabs */}
          <div className="flex rounded-xl bg-stone-100 p-1">
            {kinds.map((item) => (
              <button key={item.id} type="button" onClick={() => setKind(item.id)} className={cn("flex-1 rounded-lg py-1.5 text-[11px] font-semibold transition", kind === item.id ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800")}>
                {item.label}
              </button>
            ))}
          </div>

          {/* Day picker */}
          <div className="flex gap-1 overflow-x-auto">
            {weekDays.map((weekDay) => {
              const isSelected = weekDay.toDateString() === day.toDateString();
              return (
                <button key={weekDay.toISOString()} type="button" onClick={() => setDay(weekDay)} className={cn("flex h-14 w-10 shrink-0 flex-col items-center justify-center rounded-xl text-[11px]", isSelected ? "bg-blue-600 text-white" : "text-stone-500 hover:bg-stone-100")}>
                  <span className="text-[9px] font-semibold uppercase opacity-70">
                    {weekDay.toLocaleDateString(dateLocale(locale), { weekday: "short" }).slice(0, 2)}
                  </span>
                  <span className="text-sm font-semibold">{weekDay.getDate()}</span>
                </button>
              );
            })}
          </div>

          {/* Time pickers */}
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1">
              <span className="text-[10px] font-semibold tracking-wide text-stone-500 uppercase">{t("team.startTime")}</span>
              <select value={`${pad(startHour)}:${pad(startMinute)}`} onChange={(e) => handleStartTimeChange(e.target.value)} className="h-10 w-full rounded-xl border border-stone-200 bg-white px-2 text-sm text-stone-900 outline-none">
                {START_HOURS.map((slot) => (
                  <option key={`${slot.hours}-${slot.minutes}`} value={`${pad(slot.hours)}:${pad(slot.minutes)}`}>
                    {new Date(2026, 0, 1, slot.hours, slot.minutes).toLocaleTimeString(dateLocale(locale), { hour: "numeric", minute: "2-digit" })}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-semibold tracking-wide text-stone-500 uppercase">{t("team.endTime")}</span>
              <select value={`${pad(endHour)}:${pad(endMinute)}`} onChange={(e) => handleEndTimeChange(e.target.value)} className="h-10 w-full rounded-xl border border-stone-200 bg-white px-2 text-sm text-stone-900 outline-none">
                {START_HOURS.map((slot) => (
                  <option key={`${slot.hours}-${slot.minutes}`} value={`${pad(slot.hours)}:${pad(slot.minutes)}`}>
                    {new Date(2026, 0, 1, slot.hours, slot.minutes).toLocaleTimeString(dateLocale(locale), { hour: "numeric", minute: "2-digit" })}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Attendees */}
          <div>
            <p className="mb-2 text-[10px] font-semibold tracking-wide text-stone-500 uppercase">{t("team.attendees")}</p>
            <div className="space-y-1">
              {members.map((member) => {
                const checked = attendeeIds.includes(member.id);
                const busy = busyIds.has(member.id);
                const locked = member.id === currentUserId;
                return (
                  <label key={member.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-stone-50">
                    <input type="checkbox" checked={checked} disabled={locked} onChange={() => toggleAttendee(member.id)} className="h-4 w-4 rounded border-stone-300 text-blue-600 focus:ring-blue-500" />
                    <PersonAvatar name={member.name} imageUrl={member.imageUrl} size="sm" letters={2} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-stone-800">{member.name}</span>
                      {busy && <span className="text-[11px] font-medium text-rose-600">{t("team.busyAtThisTime")}</span>}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <label className="block space-y-1">
            <span className="text-[10px] font-semibold tracking-wide text-stone-500 uppercase">{t("team.notes")}</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("team.notesPlaceholder")} rows={4} className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-blue-500 focus:bg-white" />
          </label>
        </div>

        <div className="border-t border-stone-200 p-4">
          <button type="submit" disabled={submitting || (kind === "meeting" && !title.trim())} className="h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50">
            {t("team.scheduleMeeting")}
          </button>
        </div>
      </form>
    </aside>
  );
}
