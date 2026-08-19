"use client";

import { CalendarCheck, ChevronLeft, ChevronRight, Clock, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useMeetingsCalendarPanel } from "@/app/collaboration/_hooks/use-meetings-calendar-panel";
import { cn } from "@/lib/shared/utils";

const WEEKDAY_KEYS = [
  "team.weekdayMon", "team.weekdayTue", "team.weekdayWed", "team.weekdayThu",
  "team.weekdayFri", "team.weekdaySat", "team.weekdaySun",
] as const;

function timeLabel(iso: string, locale: string) {
  return new Date(iso).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

export function MeetingsCalendarPanel() {
  const {
    cells, byDay, monthLabel, isToday, dayKey,
    upcoming, isLoading,
    navigate,
    t, loc,
  } = useMeetingsCalendarPanel();

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-4 lg:flex-row">
      {/* Month grid */}
      <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-stone-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-stone-900">{t("team.meetingsCalendar")}</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="min-w-30 text-center text-sm font-bold text-stone-800">{monthLabel}</span>
            <Button variant="ghost" size="sm" onClick={() => navigate(1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="overflow-x-auto p-3">
          <div className="grid grid-cols-7 gap-px rounded-lg bg-stone-200">
            {WEEKDAY_KEYS.map((day) => (
              <div key={day} className="bg-stone-100 px-2 py-2 text-center text-xs font-bold tracking-wide text-stone-600">
                {t(day)}
              </div>
            ))}
            {cells.map((day, index) => {
              const dayMeetings = day ? (byDay.get(dayKey(day)) ?? []) : [];
              const todayFlag = day ? isToday(day) : false;
              return (
                <div key={index} className={cn("min-h-26 bg-white p-1.5", todayFlag && "bg-blue-50/40 ring-2 ring-inset ring-blue-500/50")}>
                  {day && (
                    <>
                      <div className="mb-1 flex items-center justify-between">
                        <span className={cn("text-sm font-semibold", todayFlag ? "text-blue-700" : "text-stone-700")}>{day}</span>
                        {todayFlag && <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{t("common.today")}</span>}
                      </div>
                      <div className="space-y-1">
                        {dayMeetings.map((meeting) => (
                          <a key={meeting.id} href={meeting.meetUrl || meeting.calendarLink || undefined} target="_blank" rel="noopener noreferrer" title={`${meeting.title} · ${timeLabel(meeting.startsAt, loc)}`} className="block rounded-md border border-blue-200 bg-blue-50 px-1.5 py-1 transition-colors hover:bg-blue-100">
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-700">
                              <Clock className="h-2.5 w-2.5 shrink-0" />
                              {timeLabel(meeting.startsAt, loc)}
                            </span>
                            <span className="mt-0.5 block truncate text-[11px] font-medium text-stone-800">{meeting.title}</span>
                          </a>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming sidebar */}
      <div className="flex shrink-0 flex-col rounded-xl border border-stone-200/80 bg-white shadow-sm lg:w-80">
        <div className="border-b border-stone-200 px-4 py-2.5">
          <h3 className="text-sm font-semibold text-stone-900">{t("team.upcomingMeetings")}</h3>
        </div>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-stone-400">{t("common.loading")}</p>
          ) : upcoming.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">{t("team.noUpcoming")}</p>
          ) : (
            upcoming.map((meeting) => (
              <div key={meeting.id} className="rounded-lg border border-stone-200 p-3">
                <p className="truncate text-sm font-semibold text-stone-900">{meeting.title}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(meeting.startsAt).toLocaleDateString(loc, { day: "numeric", month: "short" })}{" "}
                  {timeLabel(meeting.startsAt, loc)} – {timeLabel(meeting.endsAt, loc)}
                </p>
                <p className="mt-0.5 truncate text-xs text-stone-400">
                  {meeting.channelName || meeting.authorName}
                  {meeting.attendeeCount > 0 && (
                    <span className="ml-1 inline-flex items-center gap-1">· <Users className="h-3 w-3" />{meeting.attendeeCount}</span>
                  )}
                </p>
                {meeting.meetUrl && (
                  <a href={meeting.meetUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700">
                    <Video className="h-3.5 w-3.5" />
                    {t("team.joinMeetShort")}
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
