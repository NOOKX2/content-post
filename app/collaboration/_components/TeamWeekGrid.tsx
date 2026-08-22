"use client";

import type { MeetingItem } from "@/lib/collaboration/types";
import {
  eventAccent,
  hourLabel,
  meetingOverlaps,
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
  blue:
    "border-l-[3px] border-l-blue-500/70 bg-blue-200/40 text-blue-950",
  amber: "border-l-[3px] border-l-rose-400/70 bg-orange-100/45 text-rose-950",
  sky: "border-l-[3px] border-l-sky-400/70 bg-sky-100/45 text-sky-950",
};

const ACCENT_META: Record<ReturnType<typeof eventAccent>, string> = {
  blue: "text-blue-800/90",
  amber: "text-rose-800/90",
  sky: "text-sky-800/90",
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
        height: Math.max(((event.endMin - event.startMin) / 60) * HOUR_HEIGHT - 4, 28),
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

function formatEventMeta(meeting: MeetingItem, locale: string, t: (key: string, vars?: Record<string, string | number>) => string) {
  const start = new Date(meeting.startsAt);
  const end = new Date(meeting.endsAt);
  const startLabel = start.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const minutes = Math.max(
    30,
    Math.round((end.getTime() - start.getTime()) / 60_000)
  );
  const hours = minutes / 60;
  const duration =
    hours >= 1 && hours === Math.floor(hours)
      ? t("team.durationHours", { count: hours })
      : hours >= 1
        ? t("team.durationHours", { count: Number(hours.toFixed(1)) })
        : t("team.durationMinutes", { count: minutes });
  return `${startLabel} · ${duration}`;
}

export function TeamWeekGrid({
  weekStart,
  meetings,
  selectedDate,
  previewRange,
  onSelectSlot,
}: {
  weekStart: Date;
  meetings: MeetingItem[];
  selectedDate: Date;
  previewRange?: { start: Date; end: Date; title?: string } | null;
  onSelectSlot: (range: { start: Date; end: Date } | null) => void;
}) {
  const { t, locale } = useT();
  const loc = dateLocale(locale);
  const now = new Date();
  const {
    days,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = useTeamWeekGrid(weekStart, onSelectSlot, previewRange);
  const slots = Array.from({ length: SLOTS_PER_DAY }, (_, index) => index);

  const previewLayout = (() => {
    if (!previewRange) return null;
    const dayIndex = days.findIndex((day) => sameDay(day, previewRange.start));
    if (dayIndex < 0) return null;

    const dayStartMin = DAY_START_HOUR * 60;
    const dayEndMin = DAY_END_HOUR * 60;
    const startMin = Math.max(
      previewRange.start.getHours() * 60 + previewRange.start.getMinutes(),
      dayStartMin
    );
    let endMin =
      previewRange.end.getHours() * 60 + previewRange.end.getMinutes();
    if (endMin <= startMin) endMin = startMin + 30;
    endMin = Math.min(endMin, dayEndMin);
    if (endMin <= dayStartMin || startMin >= dayEndMin) return null;

    return {
      dayIndex,
      top: ((startMin - dayStartMin) / 60) * HOUR_HEIGHT,
      height: Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT - 2, 20),
    };
  })();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-stone-200">
        <div />
        {days.map((day, index) => {
          const today = sameDay(day, now);
          const selected = sameDay(day, selectedDate);
          const hasEvents = meetings.some((meeting) =>
            sameDay(new Date(meeting.startsAt), day)
          );
          return (
            <div key={toKey(day)} className="py-2.5 text-center">
              <p className="text-[11px] font-semibold tracking-wide text-stone-500 uppercase">
                {t(WEEKDAY_KEYS[index])}
              </p>
              <p
                className={cn(
                  "mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                  today && "bg-blue-600 text-white",
                  selected && !today && "bg-blue-100 text-blue-800",
                  !today && !selected && "text-stone-800"
                )}
              >
                {day.getDate()}
              </p>
              <div className="mt-1 flex h-1.5 justify-center">
                {hasEvents && !today ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="grid min-h-full grid-cols-[64px_repeat(7,1fr)]">
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
                        "absolute right-2 text-[11px] font-medium text-stone-500",
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
            const dayMeetings = meetings.filter((meeting) =>
              sameDay(new Date(meeting.startsAt), day)
            );
            const visibleMeetings =
              previewRange && previewLayout?.dayIndex === dayIndex
                ? dayMeetings.filter(
                  (meeting) =>
                    !meetingOverlaps(
                      meeting,
                      previewRange.start,
                      previewRange.end
                    )
                )
                : dayMeetings;
            const items = layoutDay(visibleMeetings);
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

                {previewLayout && previewLayout.dayIndex === dayIndex && (
                    <div
                      className="pointer-events-none absolute inset-x-1 z-[15] overflow-hidden rounded-lg border-l-[3px] border-l-blue-500/70 bg-blue-200/40 px-2 py-1.5 text-blue-950"
                      style={{
                        top: previewLayout.top,
                        height: previewLayout.height,
                      }}
                    >
                      {previewRange?.title?.trim() ? (
                        <p className="truncate text-xs font-bold text-blue-950">
                          {previewRange.title.trim()}
                        </p>
                      ) : null}
                    </div>
                  )}

                {items.map((item) => {
                  const accent = eventAccent(item.meeting.title);
                  const href =
                    item.meeting.meetUrl || item.meeting.calendarLink || "";
                  const meta = formatEventMeta(item.meeting, loc, t);
                  const showMeta = item.height >= 44;
                  const className = cn(
                    "absolute z-20 overflow-hidden rounded-lg px-2 py-1.5 text-left",
                    ACCENT_CLASS[accent]
                  );
                  const style = {
                    top: item.top,
                    height: item.height,
                    left: `calc(${item.leftPct}% + 3px)`,
                    width: `calc(${item.widthPct}% - 6px)`,
                  };
                  const body = (
                    <>
                      <p className="truncate text-xs font-bold leading-tight">
                        {item.meeting.title}
                      </p>
                      {showMeta ? (
                        <p
                          className={cn(
                            "mt-0.5 truncate text-[11px] font-semibold leading-tight",
                            ACCENT_META[accent]
                          )}
                        >
                          {meta}
                        </p>
                      ) : null}
                    </>
                  );
                  return href ? (
                    <a
                      key={item.meeting.id}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`${item.meeting.title} · ${meta}`}
                      className={className}
                      style={style}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      {body}
                    </a>
                  ) : (
                    <div
                      key={item.meeting.id}
                      title={`${item.meeting.title} · ${meta}`}
                      className={className}
                      style={style}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      {body}
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
