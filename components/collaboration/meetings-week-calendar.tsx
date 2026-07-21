"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MeetingItem } from "@/lib/collaboration/types";
import { cn } from "@/lib/utils";

const HOUR_HEIGHT = 48;
const SLOT_HEIGHT = HOUR_HEIGHT / 2;
const SLOT_MINUTES = 30;
const SLOTS_PER_DAY = (24 * 60) / SLOT_MINUTES;
const DAY_START_HOUR = 0;
const DAY_END_HOUR = 24;
const WEEKDAY_LABELS = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];

type PositionedMeeting = {
  meeting: MeetingItem;
  top: number;
  height: number;
  leftPct: number;
  widthPct: number;
};

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Assigns overlapping meetings into side-by-side lanes within a single day. */
function layoutDay(dayMeetings: MeetingItem[]): PositionedMeeting[] {
  const events = dayMeetings
    .map((meeting) => {
      const start = new Date(meeting.startsAt);
      const end = new Date(meeting.endsAt);
      const startMin = start.getHours() * 60 + start.getMinutes();
      let endMin = end.getHours() * 60 + end.getMinutes();
      if (!sameDay(start, end) || endMin <= startMin) {
        endMin = DAY_END_HOUR * 60;
      }
      return { meeting, startMin, endMin };
    })
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

  const placed: PositionedMeeting[] = [];
  let cluster: typeof events = [];
  let clusterEnd = -1;

  const flush = () => {
    if (cluster.length === 0) return;
    const lanes: number[] = [];
    const laneOf = new Map<(typeof cluster)[number], number>();
    for (const ev of cluster) {
      let lane = lanes.findIndex((end) => end <= ev.startMin);
      if (lane === -1) {
        lane = lanes.length;
        lanes.push(ev.endMin);
      } else {
        lanes[lane] = ev.endMin;
      }
      laneOf.set(ev, lane);
    }
    const laneCount = lanes.length;
    for (const ev of cluster) {
      const lane = laneOf.get(ev) ?? 0;
      const top = ((ev.startMin - DAY_START_HOUR * 60) / 60) * HOUR_HEIGHT;
      const height = Math.max(
        ((ev.endMin - ev.startMin) / 60) * HOUR_HEIGHT - 2,
        22
      );
      placed.push({
        meeting: ev.meeting,
        top,
        height,
        leftPct: (lane / laneCount) * 100,
        widthPct: (1 / laneCount) * 100,
      });
    }
    cluster = [];
    clusterEnd = -1;
  };

  for (const ev of events) {
    if (cluster.length > 0 && ev.startMin >= clusterEnd) {
      flush();
    }
    cluster.push(ev);
    clusterEnd = Math.max(clusterEnd, ev.endMin);
  }
  flush();

  return placed;
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
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const scrollRef = useRef<HTMLDivElement>(null);
  const now = new Date();

  const [selection, setSelection] = useState<{
    dayIndex: number;
    startSlot: number;
    endSlot: number;
  } | null>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const pointerDownRef = useRef<{ dayIndex: number; slot: number } | null>(null);
  const anchorRef = useRef<{ dayIndex: number; slot: number } | null>(null);

  const slotFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const slot = Math.floor((e.clientY - rect.top) / SLOT_HEIGHT);
    return Math.min(Math.max(slot, 0), SLOTS_PER_DAY - 1);
  };

  const handlePointerDown = (
    dayIndex: number,
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!onSchedule || e.button !== 0) return;
    e.preventDefault();
    draggingRef.current = true;
    movedRef.current = false;
    pointerDownRef.current = { dayIndex, slot: slotFromPointer(e) };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (
    dayIndex: number,
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!draggingRef.current || !pointerDownRef.current) return;
    const slot = slotFromPointer(e);
    if (slot !== pointerDownRef.current.slot) {
      movedRef.current = true;
    }
    if (movedRef.current) {
      // Drag selection: extend from the pointer-down slot.
      anchorRef.current = null;
      setSelection({
        dayIndex,
        startSlot: Math.min(pointerDownRef.current.slot, slot),
        endSlot: Math.max(pointerDownRef.current.slot, slot),
      });
    }
  };

  const handlePointerUp = (
    dayIndex: number,
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    draggingRef.current = false;
    if (!onSchedule) return;

    // A real drag already produced the selection — keep its start as the
    // anchor so later clicks keep extending from the same point.
    if (movedRef.current) {
      anchorRef.current = pointerDownRef.current;
      return;
    }

    // Click flow (no hold): the first click sets a fixed anchor; every later
    // click on the same day extends the range from that anchor. The anchor is
    // only reset by scheduling, switching day, or changing week.
    const slot = slotFromPointer(e);
    const anchor = anchorRef.current;
    if (anchor && anchor.dayIndex === dayIndex) {
      setSelection({
        dayIndex,
        startSlot: Math.min(anchor.slot, slot),
        endSlot: Math.max(anchor.slot, slot),
      });
    } else {
      anchorRef.current = { dayIndex, slot };
      setSelection({ dayIndex, startSlot: slot, endSlot: slot });
    }
  };

  const goToWeek = (next: Date) => {
    anchorRef.current = null;
    setSelection(null);
    setWeekStart(next);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 7 * HOUR_HEIGHT;
    }
  }, []);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const selectionRange = (() => {
    if (!selection) return null;
    const day = days[selection.dayIndex];
    if (!day) return null;
    const start = new Date(day);
    start.setHours(0, selection.startSlot * SLOT_MINUTES, 0, 0);
    const end = new Date(day);
    end.setHours(0, (selection.endSlot + 1) * SLOT_MINUTES, 0, 0);
    return { start, end };
  })();

  const handleScheduleClick = () => {
    if (!onSchedule) return;
    // Scheduling ends the current selection cycle so the next click starts a
    // fresh range.
    anchorRef.current = null;
    if (selectionRange) {
      onSchedule(selectionRange);
      return;
    }
    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);
    onSchedule({ start, end });
  };

  const layoutByDay = useMemo(
    () =>
      days.map((day) =>
        layoutDay(
          meetings.filter((meeting) => sameDay(new Date(meeting.startsAt), day))
        )
      ),
    [days, meetings]
  );

  const rangeLabel = useMemo(() => {
    const end = addDays(weekStart, 6);
    const startStr = weekStart.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
    });
    const endStr = end.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return `${startStr} – ${endStr}`;
  }, [weekStart]);

  const hours = Array.from(
    { length: DAY_END_HOUR - DAY_START_HOUR },
    (_, i) => DAY_START_HOUR + i
  );

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col rounded-xl border border-stone-200/80 bg-white shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          {headerLeading}
          <span className="shrink-0 text-sm font-semibold text-stone-800">
            {rangeLabel}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onSchedule && selectionRange && (
            <span className="mr-1 hidden text-xs font-medium text-blue-600 sm:inline">
              {selectionRange.start.toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
              })}{" "}
              {timeLabel(selectionRange.start.toISOString())}–
              {timeLabel(selectionRange.end.toISOString())}
            </span>
          )}
          {onSchedule && (
            <Button size="sm" className="mr-1" onClick={handleScheduleClick}>
              <Plus className="h-4 w-4" />
              นัดประชุม
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToWeek(startOfWeek(new Date()))}
          >
            วันนี้
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToWeek(addDays(weekStart, -7))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToWeek(addDays(weekStart, 7))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-stone-200">
        <div className="border-r border-stone-100" />
        {days.map((day, index) => {
          const todayFlag = sameDay(day, now);
          return (
            <div
              key={index}
              className={cn(
                "border-r border-stone-100 py-2 text-center last:border-r-0",
                todayFlag && "bg-blue-50/50"
              )}
            >
              <p className="text-[11px] font-medium text-stone-500">
                {WEEKDAY_LABELS[index]}
              </p>
              <p
                className={cn(
                  "mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
                  todayFlag
                    ? "bg-blue-600 text-white"
                    : "text-stone-800"
                )}
              >
                {day.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      {isLoading ? (
        <p className="py-16 text-center text-sm text-stone-400">กำลังโหลด...</p>
      ) : (
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid grid-cols-[56px_repeat(7,1fr)]">
            <div className="relative">
              {hours.map((hour) => (
                <div
                  key={hour}
                  style={{ height: HOUR_HEIGHT }}
                  className="relative border-r border-stone-100"
                >
                  <span className="absolute -top-2 right-1.5 text-[10px] text-stone-400">
                    {hour === 0 ? "" : `${String(hour).padStart(2, "0")}:00`}
                  </span>
                </div>
              ))}
            </div>

            {days.map((day, dayIndex) => {
              const todayFlag = sameDay(day, now);
              return (
                <div
                  key={dayIndex}
                  className={cn(
                    "relative border-r border-stone-100 last:border-r-0",
                    todayFlag && "bg-blue-50/20",
                    onSchedule && "cursor-pointer select-none"
                  )}
                  onPointerDown={
                    onSchedule
                      ? (e) => handlePointerDown(dayIndex, e)
                      : undefined
                  }
                  onPointerMove={
                    onSchedule ? (e) => handlePointerMove(dayIndex, e) : undefined
                  }
                  onPointerUp={
                    onSchedule ? (e) => handlePointerUp(dayIndex, e) : undefined
                  }
                >
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      style={{ height: HOUR_HEIGHT }}
                      className="pointer-events-none border-b border-stone-100"
                    />
                  ))}

                  {selection && selection.dayIndex === dayIndex && (
                    <div
                      className="pointer-events-none absolute inset-x-0.5 z-10 rounded-md bg-blue-500/25 ring-1 ring-blue-500/50"
                      style={{
                        top: selection.startSlot * SLOT_HEIGHT,
                        height:
                          (selection.endSlot - selection.startSlot + 1) *
                          SLOT_HEIGHT,
                      }}
                    />
                  )}

                  {layoutByDay[dayIndex].map((item) => {
                    const block = (
                      <>
                        <p className="truncate text-[11px] font-semibold leading-tight">
                          {item.meeting.title}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] opacity-80">
                          <Clock className="h-2.5 w-2.5 shrink-0" />
                          {timeLabel(item.meeting.startsAt)}
                        </p>
                        {item.height > 54 && item.meeting.channelName && (
                          <p className="mt-0.5 truncate text-[10px] opacity-70">
                            {item.meeting.channelName}
                          </p>
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

                    return item.meeting.meetUrl ? (
                      <a
                        key={item.meeting.id}
                        href={item.meeting.meetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onPointerDown={(e) => e.stopPropagation()}
                        title={`${item.meeting.title} · ${timeLabel(item.meeting.startsAt)}–${timeLabel(item.meeting.endsAt)}`}
                        className={className}
                        style={style}
                      >
                        {block}
                      </a>
                    ) : (
                      <div
                        key={item.meeting.id}
                        onPointerDown={(e) => e.stopPropagation()}
                        title={`${item.meeting.title} · ${timeLabel(item.meeting.startsAt)}–${timeLabel(item.meeting.endsAt)}`}
                        className={className}
                        style={style}
                      >
                        {block}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
