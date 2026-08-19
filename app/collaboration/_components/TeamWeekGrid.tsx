"use client";

import type { MeetingItem } from "@/lib/collaboration/types";
import {
  eventAccent,
  hourLabel,
  sameDay,
} from "@/app/collaboration/_lib/calendar-utils";
import {
  useTeamWeekGrid,
  HOUR_HEIGHT,
  SLOT_HEIGHT,
  SLOT_MINUTES,
  DAY_START_HOUR,
  DAY_END_HOUR,
  SLOTS_PER_DAY,
} from "@/app/collaboration/_hooks/use-team-week-grid";
import { dateLocale, useT } from "@/lib/i18n";
import { cn } from "@/lib/shared/utils";

const WEEKDAY_KEYS = [
  "team.weekdayMon",
  "team.weekdayTue",
  "team.weekdayWed",
  "team.weekdayThu",
  "team.weekdayFri",
  "team.weekdaySat",
  "team.weekdaySun",
] as const;

const ACCENT_CLASS: Record<ReturnType<typeof eventAccent>, string> = {
  violet: "border-blue-500 bg-blue-100/90 text-blue-900",
  amber: "border-amber-500 bg-amber-100 text-amber-900",
  sky: "border-sky-500 bg-sky-100 text-sky-900",
};

type PositionedMeeting = {
  meeting: MeetingItem;
  top: number;
  height: number;
  leftPct: number;
  widthPct: number;
};

function layoutDay(dayMeetings: MeetingItem[]): PositionedMeeting[] {
  const events = dayMeetings
    .map((meeting) => {
      const start = new Date(meeting.startsAt);
      const end = new Date(meeting.endsAt);
      const startMin = Math.max(
        start.getHours() * 60 + start.getMinutes(),
        DAY_START_HOUR * 60
      );
      let endMin = end.getHours() * 60 + end.getMinutes();
      if (endMin <= startMin) endMin = startMin + 30;
      endMin = Math.min(endMin, DAY_END_HOUR * 60);
      return { meeting, startMin, endMin };
    })
    .filter((event) => event.endMin > DAY_START_HOUR * 60 && event.startMin < DAY_END_HOUR * 60)
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

  const placed: PositionedMeeting[] = [];
  let cluster: typeof events = [];
  let clusterEnd = -1;

  const flush = () => {
    if (cluster.length === 0) return;
    const lanes: number[] = [];
    const laneOf = new Map<(typeof cluster)[number], number>();
    for (const event of cluster) {
      let lane = lanes.findIndex((end) => end <= event.startMin);
      if (lane === -1) {
        lane = lanes.length;
        lanes.push(event.endMin);
      } else {
        lanes[lane] = event.endMin;
      }
      laneOf.set(event, lane);
    }
    const laneCount = lanes.length;
    for (const event of cluster) {
      const lane = laneOf.get(event) ?? 0;
      placed.push({
        meeting: event.meeting,
        top: ((event.startMin - DAY_START_HOUR * 60) / 60) * HOUR_HEIGHT,
        height: Math.max(((event.endMin - event.startMin) / 60) * HOUR_HEIGHT - 4, 22),
        leftPct: (lane / laneCount) * 100,
        widthPct: (1 / laneCount) * 100,
      });
    }
    cluster = [];
    clusterEnd = -1;
  };

  for (const event of events) {
    if (cluster.length > 0 && event.startMin >= clusterEnd) flush();
    cluster.push(event);
    clusterEnd = Math.max(clusterEnd, event.endMin);
  }
  flush();
  return placed;
}

export function TeamWeekGrid({
  weekStart,
  meetings,
  selectedDate,
  onSelectSlot,
}: {
  weekStart: Date;
  meetings: MeetingItem[];
  selectedDate: Date;
  onSelectSlot: (range: { start: Date; end: Date }) => void;
}) {
  const { t, locale } = useT();
  const loc = dateLocale(locale);
  const now = new Date();
  const {
    days,
    selection,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useTeamWeekGrid(weekStart, onSelectSlot);
  const slots = Array.from({ length: SLOTS_PER_DAY }, (_, index) => index);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-stone-200">
        <div />
        {days.map((day, index) => {
          const today = sameDay(day, now);
          const selected = sameDay(day, selectedDate);
          return (
            <div key={toKey(day)} className="py-2 text-center">
              <p className="text-[10px] font-semibold tracking-wide text-stone-500 uppercase">
                {t(WEEKDAY_KEYS[index])}
              </p>
              <p
                className={cn(
                  "mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                  today && "bg-blue-600 text-white",
                  selected && !today && "ring-1 ring-blue-500 text-stone-900",
                  !today && !selected && "text-stone-800"
                )}
              >
                {day.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="grid min-h-full grid-cols-[56px_repeat(7,1fr)]">
          <div>
            {slots.map((slot) => {
              const minutes = DAY_START_HOUR * 60 + slot * SLOT_MINUTES;
              const hour = Math.floor(minutes / 60);
              const minute = minutes % 60;
              const isEndBoundary = slot === SLOTS_PER_DAY - 1;
              const label = isEndBoundary
                ? hourLabel(DAY_END_HOUR, loc)
                : minute === 0
                  ? hourLabel(hour, loc)
                  : "";

              return (
                <div
                  key={slot}
                  style={{ height: SLOT_HEIGHT }}
                  className="relative border-r border-stone-100"
                >
                  {label && (
                    <span
                      className={cn(
                        "absolute right-1.5 text-[10px] text-stone-500",
                        slot === 0 ? "top-1" : isEndBoundary ? "bottom-1" : "-top-2"
                      )}
                    >
                      {label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {days.map((day, dayIndex) => {
            const today = sameDay(day, now);
            const items = layoutDay(
              meetings.filter((meeting) => sameDay(new Date(meeting.startsAt), day))
            );
            return (
              <div
                key={toKey(day)}
                className={cn(
                  "relative cursor-pointer border-r border-stone-100 select-none last:border-r-0",
                  today && "bg-blue-50/40"
                )}
                onPointerDown={(e) => handlePointerDown(dayIndex, e)}
                onPointerMove={(e) => handlePointerMove(dayIndex, e)}
                onPointerUp={(e) => handlePointerUp(dayIndex, e)}
              >
                {slots.map((slot) => {
                  const minutes = DAY_START_HOUR * 60 + slot * SLOT_MINUTES;
                  const hour = Math.floor(minutes / 60);
                  const minute = minutes % 60;
                  const isHourBoundary = minute === 0;

                  return (
                    <div
                      key={slot}
                      style={{ height: SLOT_HEIGHT }}
                      className={cn(
                        "pointer-events-none border-b",
                        isHourBoundary ? "border-stone-200" : "border-stone-100"
                      )}
                      aria-hidden
                    />
                  );
                })}

                {selection && selection.dayIndex === dayIndex && (
                  <div
                    className="pointer-events-none absolute inset-x-0.5 z-10 rounded-md bg-blue-500/25 ring-1 ring-blue-500/50"
                    style={{
                      top: selection.startSlot * SLOT_HEIGHT,
                      height: (selection.endSlot - selection.startSlot + 1) * SLOT_HEIGHT,
                    }}
                  />
                )}

                {items.map((item) => {
                  const accent = eventAccent(item.meeting.title);
                  const href =
                    item.meeting.meetUrl || item.meeting.calendarLink || "";
                  const className = cn(
                    "absolute z-20 overflow-hidden rounded-lg border-l-2 px-1.5 py-1 text-left shadow-sm",
                    ACCENT_CLASS[accent]
                  );
                  const style = {
                    top: item.top,
                    height: item.height,
                    left: `calc(${item.leftPct}% + 3px)`,
                    width: `calc(${item.widthPct}% - 6px)`,
                  };
                  return href ? (
                    <a
                      key={item.meeting.id}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={item.meeting.title}
                      className={className}
                      style={style}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <p className="truncate text-[11px] font-semibold leading-tight">
                        {item.meeting.title}
                      </p>
                    </a>
                  ) : (
                    <div
                      key={item.meeting.id}
                      title={item.meeting.title}
                      className={className}
                      style={style}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <p className="truncate text-[11px] font-semibold leading-tight">
                        {item.meeting.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function toKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
