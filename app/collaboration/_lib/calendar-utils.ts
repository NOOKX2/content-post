import type { MeetingItem } from "@/lib/collaboration/types";

export type EventAccent = "violet" | "amber" | "sky";

export function startOfMondayWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

export function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function toLocalDateKey(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export function combineDateAndTime(day: Date, hours: number, minutes: number) {
  const next = new Date(day);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

export function intervalsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

export function meetingOverlaps(meeting: MeetingItem, start: Date, end: Date) {
  return intervalsOverlap(
    new Date(meeting.startsAt),
    new Date(meeting.endsAt),
    start,
    end
  );
}

export function eventAccent(title: string): EventAccent {
  if (/focus|block|โฟกัส|บล็อก/i.test(title)) return "amber";
  if (/personal|ส่วนตัว/i.test(title)) return "sky";
  return "violet";
}

export function formatWeekRange(weekStart: Date, locale: string) {
  const end = addDays(weekStart, 6);
  const startStr = weekStart.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
  });
  const endStr = end.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${startStr} – ${endStr}`;
}

export function hourLabel(hour: number, locale: string) {
  return new Date(2026, 0, 1, hour).toLocaleTimeString(locale, {
    hour: "numeric",
    hour12: true,
  });
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}
