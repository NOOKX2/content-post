"use client";

import { useEffect, useState } from "react";
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
const WEEKDAYS_MOBILE = ["M", "T", "W", "T", "F", "S", "S"];
const MOBILE_VISIBLE_EVENTS = 2;

function CalendarEventCard({
  content,
  compact = false,
}: {
  content: ContentItem;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <DashboardLink
        href={`/content/${content.id}`}
        className="flex items-center gap-1 rounded border border-stone-200 bg-white px-1 py-0.5 transition-colors hover:border-stone-300"
        title={`${content.name} (#${content.contentId})`}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            getPostStatusDotClass(content.status)
          )}
        />
        <span className="truncate text-[10px] font-semibold text-stone-700">
          #{content.contentId}
        </span>
      </DashboardLink>
    );
  }

  return (
    <DashboardLink
      href={`/content/${content.id}`}
      className="block rounded border border-stone-200 bg-white p-1.5 transition-shadow hover:border-stone-300 hover:shadow-md sm:rounded-md sm:p-1.5"
      title={`${content.name} (#${content.contentId})`}
    >
      <div className="flex items-start gap-1">
        <span
          className={cn(
            "mt-1 h-2 w-2 shrink-0 rounded-full sm:mt-1 sm:h-2 sm:w-2",
            getPostStatusDotClass(content.status)
          )}
        />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-xs font-bold leading-snug text-stone-800 sm:text-[11px]">
            {content.name}
          </p>
          {content.channel ? (
            <p className="mt-0.5 truncate text-[10px] leading-snug text-stone-500 sm:text-[10px]">
              {content.channel}
            </p>
          ) : null}
          <p className="mt-0.5 truncate text-[10px] leading-snug text-stone-400 sm:text-[10px]">
            #{content.contentId}
          </p>
          <div className="mt-1 hidden sm:block">
            <PlatformBadgeGroup platforms={content.platforms} size="sm" />
          </div>
        </div>
      </div>
    </DashboardLink>
  );
}

function MobileSelectedDayPanel({
  day,
  month,
  year,
  contents,
}: {
  day: number;
  month: number;
  year: number;
  contents: ContentItem[];
}) {
  const dateLabel = new Date(year, month, day).toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mt-3 space-y-2 border-t border-stone-200 pt-3 sm:hidden">
      <h3 className="text-sm font-semibold text-stone-900">{dateLabel}</h3>
      {contents.length === 0 ? (
        <p className="text-sm text-stone-400">ไม่มีงานในวันนี้</p>
      ) : (
        <div className="space-y-2">
          {contents.map((content) => (
            <div
              key={content.id}
              className="rounded-lg border border-stone-200 bg-stone-50/60 p-3"
            >
              <div className="flex items-start gap-2">
                <span
                  className={cn(
                    "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                    getPostStatusDotClass(content.status)
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold leading-snug text-stone-900">
                    {content.name}
                  </p>
                  {content.channel ? (
                    <p className="mt-1 text-xs text-stone-500">
                      {content.channel}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-stone-400">
                    #{content.contentId}
                  </p>
                  <div className="mt-2">
                    <PlatformBadgeGroup platforms={content.platforms} size="sm" />
                  </div>
                  <DashboardLink
                    href={`/content/${content.id}`}
                    className="mt-3 inline-flex text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    ดูรายละเอียด
                  </DashboardLink>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ContentCalendarGrid({
  contents,
  dateField,
}: ContentCalendarGridProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(() => {
    const today = new Date();
    if (today.getFullYear() === now.getFullYear() && today.getMonth() === now.getMonth()) {
      return today.getDate();
    }
    return null;
  });

  useEffect(() => {
    const today = new Date();
    if (today.getFullYear() === year && today.getMonth() === month) {
      setSelectedDay(today.getDate());
      return;
    }
    setSelectedDay(null);
  }, [year, month]);

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
          <span className="min-w-[120px] text-center text-base font-bold tracking-wider text-stone-800 sm:text-sm">
            {monthLabel}
          </span>
          <Button variant="ghost" size="sm" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-2 sm:p-3">
        <div className="w-full min-w-0">
          <div className="grid grid-cols-7 gap-px rounded-lg bg-stone-200 sm:grid-cols-[44px_repeat(7,minmax(0,1fr))]">
            <div className="hidden bg-stone-100 px-2 py-2 text-center text-[10px] font-bold text-stone-500 sm:block">
              Wk
            </div>
            {WEEKDAYS.map((day, index) => (
              <div
                key={day}
                className="bg-stone-100 px-1 py-1.5 text-center text-xs font-bold tracking-wide text-stone-600 sm:px-3 sm:py-2 sm:text-xs sm:tracking-wider"
              >
                <span className="sm:hidden">{WEEKDAYS_MOBILE[index]}</span>
                <span className="hidden sm:inline">{day}</span>
              </div>
            ))}

            {weeks.map((week, weekIndex) => {
              const firstDay = week.find((day) => day !== null) ?? 1;
              const weekLabel = `W${getWeekNumber(new Date(year, month, firstDay))}`;

              return (
                <div key={weekIndex} className="contents">
                  <div className="hidden min-h-[80px] items-start justify-center bg-stone-50 px-1 py-2 text-xs font-semibold text-stone-400 sm:flex sm:min-h-[96px]">
                    {weekLabel}
                  </div>
                  {week.map((day, dayIndex) => {
                    const dayContents = day ? getContentsForDay(day) : [];
                    const todayFlag = day ? isToday(day) : false;
                    const isSelected = day === selectedDay;

                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={cn(
                          "min-h-[64px] bg-white p-1 align-top sm:min-h-[96px] sm:p-1.5",
                          todayFlag &&
                            "bg-amber-50/30 ring-1 ring-inset ring-amber-700/60 sm:ring-2",
                          isSelected &&
                            "ring-2 ring-inset ring-blue-500 sm:ring-0"
                        )}
                      >
                        {day && (
                          <>
                            <div className="mb-1 flex items-center justify-between gap-0.5">
                              <button
                                type="button"
                                onClick={() => setSelectedDay(day)}
                                className={cn(
                                  "rounded px-1 text-sm font-semibold sm:cursor-default sm:px-0",
                                  todayFlag
                                    ? "text-amber-800"
                                    : "text-stone-700",
                                  isSelected && "bg-blue-100 text-blue-700"
                                )}
                              >
                                {day}
                              </button>
                              {todayFlag && (
                                <span className="hidden rounded bg-amber-700 px-1.5 py-0.5 text-[10px] font-bold text-white sm:inline">
                                  TODAY
                                </span>
                              )}
                            </div>
                            <div className="space-y-0.5 sm:space-y-1">
                              <div className="space-y-0.5 sm:hidden">
                                {dayContents
                                  .slice(0, MOBILE_VISIBLE_EVENTS)
                                  .map((content) => (
                                    <CalendarEventCard
                                      key={content.id}
                                      content={content}
                                      compact
                                    />
                                  ))}
                                {dayContents.length > MOBILE_VISIBLE_EVENTS ? (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedDay(day)}
                                    className="text-[10px] font-medium text-blue-600"
                                  >
                                    +{dayContents.length - MOBILE_VISIBLE_EVENTS} งาน
                                  </button>
                                ) : null}
                              </div>
                              <div className="hidden space-y-1 sm:block">
                                {dayContents.map((content) => (
                                  <CalendarEventCard
                                    key={content.id}
                                    content={content}
                                  />
                                ))}
                              </div>
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

        {selectedDay !== null ? (
          <MobileSelectedDayPanel
            day={selectedDay}
            month={month}
            year={year}
            contents={getContentsForDay(selectedDay)}
          />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
        <CalendarPostLegend />
        <div className="hidden flex-wrap items-center gap-4 sm:flex">
          <span className="text-xs font-medium text-stone-500">Platform:</span>
          {PLATFORMS.map((platform) => (
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
