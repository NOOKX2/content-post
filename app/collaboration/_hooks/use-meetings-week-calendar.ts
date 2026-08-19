"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MeetingItem } from "@/lib/collaboration/types";
import { dateLocale, useT } from "@/lib/i18n";

const HOUR_HEIGHT = 48;
const SLOT_HEIGHT = HOUR_HEIGHT / 2;
const SLOT_MINUTES = 30;
const SLOTS_PER_DAY = (24 * 60) / SLOT_MINUTES;
const DAY_START_HOUR = 0;
const DAY_END_HOUR = 24;

type PositionedMeeting = {
  meeting: MeetingItem;
  top: number;
  height: number;
  leftPct: number;
  widthPct: number;
};

export { HOUR_HEIGHT, SLOT_HEIGHT, SLOT_MINUTES, SLOTS_PER_DAY, DAY_START_HOUR, DAY_END_HOUR };
export type { PositionedMeeting };

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function layoutDay(dayMeetings: MeetingItem[]): PositionedMeeting[] {
  const events = dayMeetings
    .map((meeting) => {
      const start = new Date(meeting.startsAt);
      const end = new Date(meeting.endsAt);
      const startMin = start.getHours() * 60 + start.getMinutes();
      let endMin = end.getHours() * 60 + end.getMinutes();
      if (!sameDay(start, end) || endMin <= startMin) endMin = DAY_END_HOUR * 60;
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
      if (lane === -1) { lane = lanes.length; lanes.push(ev.endMin); }
      else lanes[lane] = ev.endMin;
      laneOf.set(ev, lane);
    }
    const laneCount = lanes.length;
    for (const ev of cluster) {
      const lane = laneOf.get(ev) ?? 0;
      const top = ((ev.startMin - DAY_START_HOUR * 60) / 60) * HOUR_HEIGHT;
      const height = Math.max(((ev.endMin - ev.startMin) / 60) * HOUR_HEIGHT - 2, 22);
      placed.push({ meeting: ev.meeting, top, height, leftPct: (lane / laneCount) * 100, widthPct: (1 / laneCount) * 100 });
    }
    cluster = [];
    clusterEnd = -1;
  };

  for (const ev of events) {
    if (cluster.length > 0 && ev.startMin >= clusterEnd) flush();
    cluster.push(ev);
    clusterEnd = Math.max(clusterEnd, ev.endMin);
  }
  flush();
  return placed;
}

export function useMeetingsWeekCalendar(
  meetings: MeetingItem[],
  onSchedule?: (prefill: { start: Date; end: Date }) => void
) {
  const { locale } = useT();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const scrollRef = useRef<HTMLDivElement>(null);
  const now = new Date();

  const [selection, setSelection] = useState<{ dayIndex: number; startSlot: number; endSlot: number } | null>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const pointerDownRef = useRef<{ dayIndex: number; slot: number } | null>(null);
  const anchorRef = useRef<{ dayIndex: number; slot: number } | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 7 * HOUR_HEIGHT;
  }, []);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const slotFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return Math.min(Math.max(Math.floor((e.clientY - rect.top) / SLOT_HEIGHT), 0), SLOTS_PER_DAY - 1);
  };

  const handlePointerDown = (dayIndex: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (!onSchedule || e.button !== 0) return;
    e.preventDefault();
    draggingRef.current = true;
    movedRef.current = false;
    pointerDownRef.current = { dayIndex, slot: slotFromPointer(e) };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (dayIndex: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !pointerDownRef.current) return;
    const slot = slotFromPointer(e);
    if (slot !== pointerDownRef.current.slot) movedRef.current = true;
    if (movedRef.current) {
      anchorRef.current = null;
      setSelection({ dayIndex, startSlot: Math.min(pointerDownRef.current.slot, slot), endSlot: Math.max(pointerDownRef.current.slot, slot) });
    }
  };

  const handlePointerUp = (dayIndex: number, e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    if (!onSchedule) return;
    if (movedRef.current) { anchorRef.current = pointerDownRef.current; return; }
    const slot = slotFromPointer(e);
    const anchor = anchorRef.current;
    if (anchor && anchor.dayIndex === dayIndex) {
      setSelection({ dayIndex, startSlot: Math.min(anchor.slot, slot), endSlot: Math.max(anchor.slot, slot) });
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
    anchorRef.current = null;
    if (selectionRange) { onSchedule(selectionRange); return; }
    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);
    onSchedule({ start, end });
  };

  const layoutByDay = useMemo(
    () => days.map((day) => layoutDay(meetings.filter((m) => sameDay(new Date(m.startsAt), day)))),
    [days, meetings]
  );

  const rangeLabel = useMemo(() => {
    const end = addDays(weekStart, 6);
    const loc = dateLocale(locale);
    return `${weekStart.toLocaleDateString(loc, { day: "numeric", month: "short" })} – ${end.toLocaleDateString(loc, { day: "numeric", month: "short", year: "numeric" })}`;
  }, [weekStart, locale]);

  const hours = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => DAY_START_HOUR + i);

  return {
    // calendar state
    weekStart,
    days,
    now,
    hours,
    rangeLabel,
    // layout
    layoutByDay,
    // selection
    selection,
    selectionRange,
    // refs
    scrollRef,
    // handlers
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleScheduleClick,
    goToWeek,
    // helpers
    sameDay,
    addDays,
    startOfWeek,
  };
}
