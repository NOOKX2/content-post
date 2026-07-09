"use client";

import { useState } from "react";
import { DashboardLink } from "@/components/layout/dashboard-link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ContentItem } from "@/lib/types";
import { PlatformBadgeGroup } from "@/components/ui/platform-icon";
import { PLATFORMS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { CalendarPostLegend } from "@/components/calendar/calendar-post-legend";
import {
  getPostStatusDotClass,
  type CalendarDateField,
} from "@/lib/calendar/filters";
import { getContentCalendarDate } from "@/lib/calendar/filters";
import { cn, getDaysInMonth, getWeekNumber } from "@/lib/utils";

interface ContentCalendarGridProps {
  contents: ContentItem[];
  dateField: CalendarDateField;
}

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function ContentCalendarGrid({
  contents,
  dateField,
}: ContentCalendarGridProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const monthLabel = new Date(year, month)
    .toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
    .toUpperCase();

  const getContentsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return contents.filter(
      (content) => getContentCalendarDate(content, dateField) === dateStr
    );
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
      <div className="flex items-center justify-end border-b border-stone-200 px-4 py-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[120px] text-center text-sm font-bold tracking-wider text-stone-800">
            {monthLabel}
          </span>
          <Button variant="ghost" size="sm" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto p-3">
        <div className="min-w-[920px]">
          <div className="grid grid-cols-[44px_repeat(7,1fr)] gap-px rounded-lg bg-stone-200">
            <div className="bg-stone-100 px-2 py-2 text-center text-[10px] font-bold text-stone-500">
              Wk
            </div>
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="bg-stone-100 px-3 py-2 text-center text-xs font-bold tracking-wider text-stone-600"
              >
                {day}
              </div>
            ))}

            {weeks.map((week, weekIndex) => {
              const firstDay = week.find((day) => day !== null) ?? 1;
              const weekLabel = `W${getWeekNumber(new Date(year, month, firstDay))}`;

              return (
                <div key={weekIndex} className="contents">
                  <div className="flex min-h-[96px] items-start justify-center bg-stone-50 px-1 py-2 text-[11px] font-semibold text-stone-400">
                    {weekLabel}
                  </div>
                  {week.map((day, dayIndex) => {
                    const dayContents = day ? getContentsForDay(day) : [];
                    const todayFlag = day ? isToday(day) : false;

                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={cn(
                          "min-h-[96px] bg-white p-1.5",
                          todayFlag &&
                            "bg-amber-50/30 ring-2 ring-inset ring-amber-700/60"
                        )}
                      >
                        {day && (
                          <>
                            <div className="mb-1.5 flex items-center justify-between">
                              <span
                                className={cn(
                                  "text-sm font-semibold",
                                  todayFlag
                                    ? "text-amber-800"
                                    : "text-stone-700"
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
                              {dayContents.map((content) => (
                                <DashboardLink
                                  key={content.id}
                                  href={`/content/${content.id}`}
                                  className="block rounded-md border border-stone-200 bg-white p-1.5 transition-shadow hover:border-stone-300 hover:shadow-md"
                                  title={`${content.name} (#${content.contentId})`}
                                >
                                  <div className="flex items-start gap-1.5">
                                    <span
                                      className={cn(
                                        "mt-1 h-2 w-2 shrink-0 rounded-full",
                                        getPostStatusDotClass(content.status)
                                      )}
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="truncate text-[11px] font-bold text-stone-800">
                                          {content.channel || content.name}
                                        </span>
                                        <PlatformBadgeGroup
                                          platforms={content.platforms}
                                          size="sm"
                                        />
                                      </div>
                                      <p className="mt-0.5 truncate text-[10px] text-stone-500">
                                        #{content.contentId}
                                        {content.channel ? ` · ${content.name}` : ""}
                                      </p>
                                    </div>
                                  </div>
                                </DashboardLink>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 px-4 py-2.5">
        <CalendarPostLegend />
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-xs font-medium text-stone-500">Platform:</span>
          {PLATFORMS.slice(0, 5).map((platform) => (
            <span
              key={platform.id}
              className="flex items-center gap-1.5 text-xs text-stone-600"
            >
              <PlatformBadgeGroup platforms={[platform.id]} size="sm" />
              {platform.shortLabel}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
