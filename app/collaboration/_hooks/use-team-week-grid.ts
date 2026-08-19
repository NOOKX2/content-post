"use client";

import { useRef, useState } from "react";
import { addDays } from "@/app/collaboration/_lib/calendar-utils";

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

export function useTeamWeekGrid(
  weekStart: Date,
  onSelectSlot: (range: { start: Date; end: Date }) => void
) {
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const [selection, setSelection] = useState<Selection | null>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const pointerDownRef = useRef<{ dayIndex: number; slot: number } | null>(null);

  const slotFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return Math.min(
      Math.max(Math.floor((e.clientY - rect.top) / SLOT_HEIGHT), 0),
      SLOTS_PER_DAY - 1
    );
  };

  const applySelection = (next: Selection) => {
    setSelection(next);
    const day = days[next.dayIndex];
    if (!day) return;
    onSelectSlot(slotRangeToDates(day, next.startSlot, next.endSlot));
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
    setSelection({
      dayIndex,
      startSlot: Math.min(pointerDownRef.current.slot, slot),
      endSlot: Math.max(pointerDownRef.current.slot, slot),
    });
  };

  const handlePointerUp = (dayIndex: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !pointerDownRef.current) return;
    draggingRef.current = false;
    const slot = slotFromPointer(e);
    const anchor = pointerDownRef.current;
    pointerDownRef.current = null;

    const next: Selection = movedRef.current
      ? {
          dayIndex,
          startSlot: Math.min(anchor.slot, slot),
          endSlot: Math.max(anchor.slot, slot),
        }
      : { dayIndex, startSlot: slot, endSlot: slot };

    applySelection(next);
  };

  return {
    days,
    selection,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
