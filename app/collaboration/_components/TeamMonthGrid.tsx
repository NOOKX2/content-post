"use client";

import { getDaysInMonth } from "@/lib/shared/utils";
import type { MeetingItem } from "@/lib/collaboration/types";
import { eventAccent, toLocalDateKey } from "@/app/collaboration/_lib/calendar-utils";
import { cn } from "@/lib/shared/utils";
import { useT } from "@/lib/i18n";

const WEEKDAY_KEYS = [
  "team.weekdaySun",
  "team.weekdayMon",
  "team.weekdayTue",
  "team.weekdayWed",
  "team.weekdayThu",
  "team.weekdayFri",
  "team.weekdaySat",
] as const;

const PILL: Record<ReturnType<typeof eventAccent>, string> = {
  blue: "bg-blue-100 text-blue-900",
  amber: "bg-rose-100 text-rose-900",
  sky: "bg-sky-100 text-sky-900",
};

export function TeamMonthGrid({
  year,
  month,
  meetings,
  selectedDate,
  onSelectDate,
}: {
  year: number;
  month: number;
  meetings: MeetingItem[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}) {
  const { t } = useT();
  const now = new Date();
  const daysInMonth = getDaysInMonth(year, month);
  const startOffset = new Date(year, month, 1).getDay();
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const byDay = new Map<string, MeetingItem[]>();
  for (const meeting of meetings) {
    const key = toLocalDateKey(meeting.startsAt);
    const list = byDay.get(key) ?? [];
    list.push(meeting);
    byDay.set(key, list);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto p-3">
      <div className="grid min-h-full grid-cols-7 gap-px rounded-xl bg-stone-200">
        {WEEKDAY_KEYS.map((key) => (
          <div
            key={key}
            className="bg-stone-100 px-2 py-2 text-center text-[10px] font-semibold tracking-wide text-stone-500 uppercase"
          >
            {t(key)}
          </div>
        ))}
        {cells.map((day, index) => {
          const date = day ? new Date(year, month, day) : null;
          const key = date ? toLocalDateKey(date) : `empty-${index}`;
          const dayMeetings = date ? (byDay.get(key) ?? []) : [];
          const today =
            date &&
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate();
          const selected =
            date &&
            date.getFullYear() === selectedDate.getFullYear() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getDate() === selectedDate.getDate();

          return (
            <button
              key={key}
              type="button"
              disabled={!date}
              onClick={() => date && onSelectDate(date)}
              className={cn(
                "min-h-28 bg-white p-1.5 text-left align-top",
                today && "ring-2 ring-inset ring-blue-500/50",
                selected && !today && "ring-1 ring-inset ring-stone-300"
              )}
            >
              {day ? (
                <>
                  <span
                    className={cn(
                      "mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                      today ? "bg-blue-600 text-white" : "text-stone-700"
                    )}
                  >
                    {day}
                  </span>
                  <div className="space-y-1">
                    {dayMeetings.slice(0, 3).map((meeting) => (
                      <span
                        key={meeting.id}
                        className={cn(
                          "block truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                          PILL[eventAccent(meeting.title)]
                        )}
                      >
                        {meeting.title}
                      </span>
                    ))}
                    {dayMeetings.length > 3 ? (
                      <span className="px-1 text-[10px] text-stone-500">
                        +{dayMeetings.length - 3}
                      </span>
                    ) : null}
                  </div>
                </>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
