"use client";

import { useEffect, useRef, useState } from "react";
import { addDays, sameDay } from "@/app/collaboration/_lib/calendar-utils";

export const HOUR_HEIGHT = 64;
export const SLOT_HEIGHT = HOUR_HEIGHT / 2;
export const SLOT_MINUTES = 30;
export const DAY_START_HOUR = 9;
export const DAY_END_HOUR = 18;
export const SLOTS_PER_DAY = ((DAY_END_HOUR - DAY_START_HOUR) * 60) / SLOT_MINUTES;

type Selection = {
  dayIndex: number;
  startSlot: number;
  endSlot: number;
};

function slotRangeToDates(day: Date, startSlot: number, endSlot: number) {
  const startMinutes = DAY_START_HOUR * 60 + startSlot * SLOT_MINUTES;
  const endMinutes = DAY_START_HOUR * 60 + (endSlot + 1) * SLOT_MINUTES;
  const start = new Date(day);
  start.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
  const end = new Date(day);
  end.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);
  return { start, end };
}

function previewToSelection(
  previewRange: { start: Date; end: Date },
  days: Date[]
): Selection | null {
  const dayIndex = days.findIndex((day) => sameDay(day, previewRange.start));
  if (dayIndex < 0) return null;

  const dayStartMin = DAY_START_HOUR * 60;
  const startMin = Math.max(
    previewRange.start.getHours() * 60 + previewRange.start.getMinutes(),
    dayStartMin
  );
  let endMin =
    previewRange.end.getHours() * 60 + previewRange.end.getMinutes();
  if (endMin <= startMin) endMin = startMin + SLOT_MINUTES;

  const startSlot = Math.floor((startMin - dayStartMin) / SLOT_MINUTES);
  let endSlot = Math.ceil((endMin - dayStartMin) / SLOT_MINUTES) - 1;
  endSlot = Math.min(Math.max(endSlot, startSlot), SLOTS_PER_DAY - 1);

  return { dayIndex, startSlot, endSlot };
}

function extendSelection(current: Selection, slot: number): Selection {
  return {
    dayIndex: current.dayIndex,
    startSlot: Math.min(current.startSlot, slot),
    endSlot: Math.max(current.endSlot, slot),
  };
}

function removeSlot(current: Selection, slot: number): Selection | null {
  const { dayIndex, startSlot, endSlot } = current;
  if (slot < startSlot || slot > endSlot) return null;
  if (startSlot === endSlot) return null;

  if (slot === startSlot) {
    return { dayIndex, startSlot: startSlot + 1, endSlot };
  }
  if (slot === endSlot) {
    return { dayIndex, startSlot, endSlot: endSlot - 1 };
  }
  if (slot - 1 >= startSlot) {
    return { dayIndex, startSlot, endSlot: slot - 1 };
  }
  if (slot + 1 <= endSlot) {
    return { dayIndex, startSlot: slot + 1, endSlot };
  }
  return null;
}

export function useTeamWeekGrid(
  weekStart: Date,
  onSelectSlot: (range: { start: Date; end: Date } | null) => void,
  previewRange?: { start: Date; end: Date } | null
) {
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const [selection, setSelection] = useState<Selection | null>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const pointerDownRef = useRef<{ dayIndex: number; slot: number } | null>(null);
  const rangeRef = useRef<Selection | null>(null);
  const lastEmittedRangeRef = useRef<{ start: number; end: number } | null>(null);

  useEffect(() => {
    rangeRef.current = null;
    lastEmittedRangeRef.current = null;
    setSelection(null);
  }, [weekStart]);

  useEffect(() => {
    if (!previewRange) {
      rangeRef.current = null;
      lastEmittedRangeRef.current = null;
      return;
    }

    const start = previewRange.start.getTime();
    const end = previewRange.end.getTime();
    const last = lastEmittedRangeRef.current;

    if (last && last.start === start && last.end === end) return;

    const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
    rangeRef.current = previewToSelection(previewRange, weekDays);
    lastEmittedRangeRef.current = { start, end };
  }, [previewRange?.start.getTime(), previewRange?.end.getTime(), weekStart]);

  const emitRange = (next: Selection) => {
    const day = days[next.dayIndex];
    if (!day) return;
    const { start, end } = slotRangeToDates(day, next.startSlot, next.endSlot);
    rangeRef.current = next;
    lastEmittedRangeRef.current = { start: start.getTime(), end: end.getTime() };
    setSelection(next);
    onSelectSlot({ start, end });
  };

  const emitClear = () => {
    rangeRef.current = null;
    lastEmittedRangeRef.current = null;
    setSelection(null);
    onSelectSlot(null);
  };

  const slotFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return Math.min(
      Math.max(Math.floor((e.clientY - rect.top) / SLOT_HEIGHT), 0),
      SLOTS_PER_DAY - 1
    );
  };

  const applyClick = (dayIndex: number, slot: number) => {
    const current = rangeRef.current;

    if (!current || current.dayIndex !== dayIndex) {
      emitRange({ dayIndex, startSlot: slot, endSlot: slot });
      return;
    }

    if (slot >= current.startSlot && slot <= current.endSlot) {
      const next = removeSlot(current, slot);
      if (!next) {
        emitClear();
        return;
      }
      emitRange(next);
      return;
    }

    emitRange(extendSelection(current, slot));
  };

  const handlePointerDown = (dayIndex: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    draggingRef.current = true;
    movedRef.current = false;
    const slot = slotFromPointer(e);
    pointerDownRef.current = { dayIndex, slot };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (dayIndex: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !pointerDownRef.current) return;
    if (pointerDownRef.current.dayIndex !== dayIndex) return;
    const slot = slotFromPointer(e);
    if (slot !== pointerDownRef.current.slot) movedRef.current = true;
    if (!movedRef.current) return;
    emitRange({
      dayIndex,
      startSlot: Math.min(pointerDownRef.current.slot, slot),
      endSlot: Math.max(pointerDownRef.current.slot, slot),
    });
  };

  const handlePointerUp = (dayIndex: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !pointerDownRef.current) return;
    draggingRef.current = false;

    if (movedRef.current) {
      pointerDownRef.current = null;
      return;
    }

    const slot = slotFromPointer(e);
    pointerDownRef.current = null;
    applyClick(dayIndex, slot);
  };

  return {
    days,
    selection,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
