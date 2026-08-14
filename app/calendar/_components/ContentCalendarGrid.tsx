"use client";

import { useEffect, useState } from "react";
import { DashboardLink } from "@/components/layout/DashboardLink";
import { ChevronLeft, ChevronRight, Video } from "lucide-react";
import type { ContentItem } from "@/lib/types";
import type { MeetingItem } from "@/lib/collaboration/types";
import { PlatformBadgeGroup } from "@/components/ui/PlatformIcon";
import { PLATFORMS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { CalendarPostLegend } from "@/app/calendar/_components/CalendarPostLegend";
import { ContentSummaryCard } from "@/components/content/ContentSummaryCard";
import { type CalendarDateField } from "@/lib/calendar/domain/filters";
import { getContentCalendarDate, getMediaTypeCardClass } from "@/lib/calendar/domain/filters";
import { cn, getDaysInMonth, getWeekNumber } from "@/lib/shared/utils";
import { useT } from "@/lib/i18n";

interface ContentCalendarGridProps {
  contents: ContentItem[];
  dateField: CalendarDateField;
  meetings?: MeetingItem[];
  showMeetings?: boolean;
}

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const WEEKDAYS_MOBILE = ["M", "T", "W", "T", "F", "S", "S"];
const MOBILE_VISIBLE_EVENTS = 2;

function meetingDateKey(iso: string) {
  const date = new Date(iso);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function MeetingEventCard({
  meeting,
  compact = false,
}: {
  meeting: MeetingItem;
  compact?: boolean;
}) {
  const start = new Date(meeting.startsAt).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const href = meeting.meetUrl || meeting.calendarLink || "#";

  if (compact) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-1 py-0.5 transition-colors hover:border-emerald-300"
        title={meeting.title}
      >
        <Video className="h-3 w-3 shrink-0 text-emerald-700" />
        <span className="truncate text-[10px] font-semibold text-emerald-800">
          {meeting.title}
        </span>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="block rounded border border-emerald-200 bg-emerald-50 p-1.5 transition-shadow hover:border-emerald-300 hover:shadow-md sm:rounded-md sm:p-1.5"
      title={meeting.title}
    >
      <div className="flex items-start gap-1">
        <Video className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-xs font-bold leading-snug text-emerald-900 sm:text-[11px]">
            {meeting.title}
          </p>
          <p className="mt-0.5 truncate text-[10px] text-emerald-700">
            {start}
            {meeting.meetUrl ? " · Meet" : ""}
          </p>
        </div>
      </div>
    </a>
  );
}

function CalendarEventCard({
  content,
  compact = false,
}: {
  content: ContentItem;
  compact?: boolean;
}) {
  return (
    <DashboardLink
      href={`/content/${content.id}`}
      className={cn(
        "block rounded transition-shadow hover:shadow-md",
        getMediaTypeCardClass(content.mediaType),
        compact ? "px-1 py-0.5" : "p-1.5 sm:rounded-md sm:p-1.5"
      )}
      title={`${content.name} (#${content.contentId})`}
    >
      <ContentSummaryCard content={content} compact />
    </DashboardLink>
  );
}

function MobileSelectedDayPanel({
  day,
  month,
  year,
  contents,
  meetings,
}: {
  day: number;
  month: number;
  year: number;
  contents: ContentItem[];
  meetings: MeetingItem[];
}) {
  const { t, locale } = useT();
  const dateLabel = new Date(year, month, day).toLocaleDateString(
    locale === "en" ? "en-US" : "th-TH",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  return (
    <div className="mt-3 space-y-2 border-t border-stone-200 pt-3 sm:hidden">
      <h3 className="text-sm font-semibold text-stone-900">{dateLabel}</h3>
      {contents.length === 0 && meetings.length === 0 ? (
        <p className="text-sm text-stone-400">{t("calendar.noJobsToday")}</p>
      ) : (
        <div className="space-y-2">
          {contents.map((content) => (
            <div
              key={content.id}
              className={cn(
                "rounded-lg p-3",
                getMediaTypeCardClass(content.mediaType)
              )}
            >
              <ContentSummaryCard content={content} />
              <DashboardLink
                href={`/content/${content.id}`}
                className="mt-3 inline-flex text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                {t("workflow.viewDetail")}
              </DashboardLink>
            </div>
          ))}
          {meetings.map((meeting) => (
            <MeetingEventCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ContentCalendarGrid({
  contents,
  dateField,
  meetings = [],
  showMeetings = true,
}: ContentCalendarGridProps) {
  const { t } = useT();
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

  const getMeetingsForDay = (day: number) => {
    if (!showMeetings) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return meetings.filter(
      (meeting) => meetingDateKey(meeting.startsAt) === dateStr
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
                    const dayMeetings = day ? getMeetingsForDay(day) : [];
                    const dayEventCount = dayContents.length + dayMeetings.length;
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
                                {dayMeetings
                                  .slice(
                                    0,
                                    Math.max(
                                      0,
                                      MOBILE_VISIBLE_EVENTS - dayContents.length
                                    )
                                  )
                                  .map((meeting) => (
                                    <MeetingEventCard
                                      key={meeting.id}
                                      meeting={meeting}
                                      compact
                                    />
                                  ))}
                                {dayEventCount > MOBILE_VISIBLE_EVENTS ? (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedDay(day)}
                                    className="text-[10px] font-medium text-blue-600"
                                  >
                                    {t("calendar.moreJobs", {
                                      count:
                                        dayEventCount - MOBILE_VISIBLE_EVENTS,
                                    })}
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
                                {dayMeetings.map((meeting) => (
                                  <MeetingEventCard
                                    key={meeting.id}
                                    meeting={meeting}
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
            meetings={getMeetingsForDay(selectedDay)}
          />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
        <div className="flex flex-wrap items-center gap-3">
          <CalendarPostLegend />
          {showMeetings ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-700">
              <Video className="h-3.5 w-3.5" />
              {t("calendar.meetingsLegend")}
            </span>
          ) : null}
        </div>
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
