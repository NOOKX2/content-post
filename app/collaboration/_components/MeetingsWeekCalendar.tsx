"use client";

import { Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { MeetingItem } from "@/lib/collaboration/types";
import {
  useMeetingsWeekCalendar,
  SLOT_HEIGHT,
  SLOT_MINUTES,
  SLOTS_PER_DAY,
  type PositionedMeeting,
} from "@/app/collaboration/_hooks/use-meetings-week-calendar";
import { dateLocale, useT, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/shared/utils";

const WEEKDAY_KEYS = [
  "team.weekdayMon", "team.weekdayTue", "team.weekdayWed", "team.weekdayThu",
  "team.weekdayFri", "team.weekdaySat", "team.weekdaySun",
] as const;

function timeLabel(iso: string, locale: string) {
  return new Date(iso).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

function MeetingBlock({ item, locale }: { item: PositionedMeeting; locale: Locale }) {
  const loc = dateLocale(locale);
  const block = (
    <>
      <p className="truncate text-[11px] font-semibold leading-tight">{item.meeting.title}</p>
      <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] opacity-80">
        <Clock className="h-2.5 w-2.5 shrink-0" />
        {timeLabel(item.meeting.startsAt, loc)}
      </p>
      {item.height > 54 && item.meeting.channelName && (
        <p className="mt-0.5 truncate text-[10px] opacity-70">{item.meeting.channelName}</p>
      )}
    </>
  );
  const className = cn(
    "absolute overflow-hidden rounded-md border-l-2 border-blue-500 bg-blue-100/90 px-1.5 py-1 text-blue-900 shadow-sm transition-colors",
    item.meeting.meetUrl && "hover:bg-blue-200"
  );
  const style = {
    top: item.top,
    height: item.height,
    left: `calc(${item.leftPct}% + 2px)`,
    width: `calc(${item.widthPct}% - 4px)`,
  };
  const title = `${item.meeting.title} · ${timeLabel(item.meeting.startsAt, loc)}–${timeLabel(item.meeting.endsAt, loc)}`;

  return item.meeting.meetUrl ? (
    <a key={item.meeting.id} href={item.meeting.meetUrl} target="_blank" rel="noopener noreferrer" onPointerDown={(e) => e.stopPropagation()} title={title} className={className} style={style}>
      {block}
    </a>
  ) : (
    <div key={item.meeting.id} onPointerDown={(e) => e.stopPropagation()} title={title} className={className} style={style}>
      {block}
    </div>
  );
}

export function MeetingsWeekCalendar({
  meetings,
  isLoading,
  onSchedule,
  headerLeading,
  className,
}: {
  meetings: MeetingItem[];
  isLoading?: boolean;
  onSchedule?: (prefill: { start: Date; end: Date }) => void;
  headerLeading?: React.ReactNode;
  className?: string;
}) {
  const { t, locale } = useT();
  const loc = dateLocale(locale);
  const {
    weekStart,
    days,
    now,
    rangeLabel,
    layoutByDay,
    selection,
    selectionRange,
    scrollRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleScheduleClick,
    goToWeek,
    sameDay,
    addDays,
    startOfWeek,
  } = useMeetingsWeekCalendar(meetings, onSchedule);

  const slots = Array.from({ length: SLOTS_PER_DAY }, (_, i) => i);

  return (
    <div className={cn("flex h-full min-h-0 flex-col rounded-xl border border-stone-200/80 bg-white shadow-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          {headerLeading}
          <span className="shrink-0 text-sm font-semibold text-stone-800">{rangeLabel}</span>
        </div>
        <div className="flex items-center gap-1">
          {onSchedule && selectionRange && (
            <span className="mr-1 hidden text-xs font-medium text-blue-600 sm:inline">
              {selectionRange.start.toLocaleDateString(loc, { day: "numeric", month: "short" })}{" "}
              {timeLabel(selectionRange.start.toISOString(), loc)}–
              {timeLabel(selectionRange.end.toISOString(), loc)}
            </span>
          )}
          {onSchedule && (
            <Button size="sm" className="mr-1" onClick={handleScheduleClick}>
              <Plus className="h-4 w-4" />
              {t("team.scheduleMeeting")}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => goToWeek(startOfWeek(new Date()))}>
            {t("common.today")}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => goToWeek(addDays(weekStart, -7))}>
            ‹
          </Button>
          <Button variant="ghost" size="sm" onClick={() => goToWeek(addDays(weekStart, 7))}>
            ›
          </Button>
        </div>
      </div>

      {/* Day header row */}
      <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-stone-200">
        <div className="border-r border-stone-100" />
        {days.map((day, index) => {
          const todayFlag = sameDay(day, now);
          return (
            <div key={index} className={cn("border-r border-stone-100 py-2 text-center last:border-r-0", todayFlag && "bg-blue-50/50")}>
              <p className="text-[11px] font-medium text-stone-500">{t(WEEKDAY_KEYS[index])}</p>
              <p className={cn("mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold", todayFlag ? "bg-blue-600 text-white" : "text-stone-800")}>
                {day.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Calendar body */}
      {isLoading ? (
        <p className="py-16 text-center text-sm text-stone-400">{t("common.loading")}</p>
      ) : (
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid grid-cols-[56px_repeat(7,1fr)]">
            {/* Hour labels */}
            <div className="relative">
              {slots.map((slot) => {
                const minutes = slot * SLOT_MINUTES;
                const hour = Math.floor(minutes / 60);
                const minute = minutes % 60;
                const label = minute === 0 && hour !== 0 ? `${String(hour).padStart(2, "0")}:00` : "";

                return (
                  <div key={slot} style={{ height: SLOT_HEIGHT }} className="relative border-r border-stone-100">
                    {label && <span className="absolute -top-2 right-1.5 text-[10px] text-stone-400">{label}</span>}
                  </div>
                );
              })}
            </div>

            {/* Day columns */}
            {days.map((day, dayIndex) => {
              const todayFlag = sameDay(day, now);
              return (
                <div
                  key={dayIndex}
                  className={cn("relative border-r border-stone-100 last:border-r-0", todayFlag && "bg-blue-50/20", onSchedule && "cursor-pointer select-none")}
                  onPointerDown={onSchedule ? (e) => handlePointerDown(dayIndex, e) : undefined}
                  onPointerMove={onSchedule ? (e) => handlePointerMove(dayIndex, e) : undefined}
                  onPointerUp={onSchedule ? (e) => handlePointerUp(dayIndex, e) : undefined}
                >
                  {slots.map((slot) => (
                    <div
                      key={slot}
                      style={{ height: SLOT_HEIGHT }}
                      className="pointer-events-none border-b border-stone-100 last:border-b-0"
                    />
                  ))}
                  {selection && selection.dayIndex === dayIndex && (
                    <div
                      className="pointer-events-none absolute inset-x-0.5 z-10 rounded-md bg-blue-500/25 ring-1 ring-blue-500/50"
                      style={{ top: selection.startSlot * SLOT_HEIGHT, height: (selection.endSlot - selection.startSlot + 1) * SLOT_HEIGHT }}
                    />
                  )}
                  {layoutByDay[dayIndex].map((item) => (
                    <MeetingBlock key={item.meeting.id} item={item} locale={locale} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
