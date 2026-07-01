"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ContentItem } from "@/lib/types";
import { PlatformBadgeGroup } from "@/components/ui/platform-icon";
import { PLATFORMS, STATUS_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { CalendarLegend } from "@/components/calendar/calendar-legend";
import {
  getCalendarContents,
  CALENDAR_CELL_STYLES,
} from "@/lib/calendar/content";
import { cn, getDaysInMonth } from "@/lib/utils";

interface ContentCalendarGridProps {
  contents: ContentItem[];
  title?: string;
  subtitle?: string;
}

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function ContentCalendarGrid({
  contents,
  title = "วังว่าน Content Calendar",
  subtitle = "Hero Product Series - 5 ช่องทาง - Rebrand to Lifestyle Herbal",
}: ContentCalendarGridProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const monthLabel = new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  }).toUpperCase();

  const calendarContents = getCalendarContents(contents);

  const getContentsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return calendarContents.filter((c) => c.scheduledDate === dateStr);
  };

  const navigate = (dir: -1 | 1) => {
    let newMonth = month + dir;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setMonth(newMonth);
    setYear(newYear);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="rounded-xl border border-stone-200/80 bg-white shadow-sm">
      <div className="border-b border-stone-200 px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900">{title}</h2>
            <p className="mt-1 text-sm text-stone-500">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[140px] text-center text-sm font-bold tracking-wider text-stone-800">
              {monthLabel}
            </span>
            <Button variant="ghost" size="sm" onClick={() => navigate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto p-4">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-7 gap-px bg-stone-200 rounded-lg overflow-hidden">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="bg-stone-100 px-3 py-2 text-center text-xs font-bold tracking-wider text-stone-600"
              >
                {day}
              </div>
            ))}

            {weeks.flat().map((day, idx) => {
              const dayContents = day ? getContentsForDay(day) : [];
              const todayFlag = day ? isToday(day) : false;

              return (
                <div
                  key={idx}
                  className={cn(
                    "min-h-[120px] bg-white p-2",
                    todayFlag && "ring-2 ring-inset ring-amber-700/60 bg-amber-50/30"
                  )}
                >
                  {day && (
                    <>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            todayFlag ? "text-amber-800" : "text-stone-700"
                          )}
                        >
                          {day}
                        </span>
                        {todayFlag && (
                          <span className="rounded bg-amber-700 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            TODAY
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {dayContents.map((c) => (
                          <Link
                            key={c.id}
                            href={`/content/${c.id}`}
                            className={cn(
                              "block rounded-md border p-1.5 transition-shadow hover:shadow-md",
                              CALENDAR_CELL_STYLES[c.status]
                            )}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[11px] font-bold text-stone-800 truncate">
                                {c.name}
                              </span>
                              <PlatformBadgeGroup
                                platforms={c.platforms}
                                size="sm"
                              />
                            </div>
                            <p className="text-[10px] text-stone-500 truncate mt-0.5">
                              {c.channel}
                            </p>
                            <p className="text-[10px] font-medium truncate mt-0.5">
                              {STATUS_LABELS[c.status].label}
                            </p>
                          </Link>
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

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 px-6 py-4">
        <CalendarLegend />
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-xs font-medium text-stone-500">Platform:</span>
          {PLATFORMS.slice(0, 4).map((p) => (
            <span
              key={p.id}
              className="flex items-center gap-1.5 text-xs text-stone-600"
            >
              <PlatformBadgeGroup platforms={[p.id]} size="sm" />
              {p.shortLabel}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
