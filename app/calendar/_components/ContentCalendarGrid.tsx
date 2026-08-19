"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLink } from "@/components/layout/DashboardLink";
import { ChevronLeft, ChevronRight, Video } from "lucide-react";
import type { ContentItem } from "@/lib/types";
import type { MeetingItem } from "@/lib/collaboration/types";
import { Button } from "@/components/ui/Button";
import {
  CalendarLegendBar,
} from "@/app/calendar/_components/CalendarPostLegend";
import { ContentSummaryCard } from "@/components/content/ContentSummaryCard";
import { type CalendarDateField } from "@/lib/calendar/domain/filters";
import { getContentCalendarDate, getMediaTypeCardClass } from "@/lib/calendar/domain/filters";
import { cn, getDaysInMonth, getWeekNumber } from "@/lib/shared/utils";
import { dateLocale, useT, type Locale } from "@/lib/i18n";

interface ContentCalendarGridProps {
  contents: ContentItem[];
  dateField: CalendarDateField;
  meetings?: MeetingItem[];
  showMeetings?: boolean;
}

const WEEKDAYS_MOBILE_EN = ["M", "T", "W", "T", "F", "S", "S"];
const MOBILE_VISIBLE_EVENTS = 2;

function weekdayLabels(locale: Locale) {
  const loc = dateLocale(locale);
  const format = locale === "en" ? "short" : "long";
  const labels = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(2024, 0, 1 + index);
    const label = date.toLocaleDateString(loc, { weekday: format });
    return locale === "en" ? label.toUpperCase() : label;
  });
  const mobile =
    locale === "en"
      ? WEEKDAYS_MOBILE_EN
      : labels.map((label) => label.replace(/\.$/, "").slice(0, 1));
  return { desktop: labels, mobile };
}

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
        className="flex items-center gap-1 rounded border border-emerald-200 border-l-[3px] border-l-emerald-500 bg-white px-2 py-1.5 transition-colors hover:border-emerald-300 hover:bg-stone-50"
        title={meeting.title}
      >
        <Video className="h-3 w-3 shrink-0 text-emerald-700" />
        <span className="min-w-0 truncate text-[10px] font-semibold text-stone-800">
          {meeting.title}
        </span>
        <span className="ml-auto shrink-0 text-[10px] text-stone-500">{start}</span>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="block rounded border border-emerald-200 border-l-[3px] border-l-emerald-500 bg-white px-2 py-1.5 transition-shadow hover:border-emerald-300 hover:bg-stone-50 hover:shadow-sm"
      title={meeting.title}
    >
      <div className="flex items-start gap-1.5">
        <Video className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[11px] font-bold leading-snug text-stone-900">
            {meeting.title}
          </p>
          <p className="mt-0.5 text-[10px] text-stone-500">{start}</p>
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
      <ContentSummaryCard content={content} compact={compact} />
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
        <div className="space-y-1">
          {contents.map((content) => (
            <CalendarEventCard key={content.id} content={content} />
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
  const { t, locale } = useT();
  const loc = dateLocale(locale);
  const weekdays = useMemo(() => weekdayLabels(locale), [locale]);
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

  const monthNumber = String(month + 1).padStart(2, "0");
  const monthDate = new Date(year, month, 1);
  const monthName = monthDate.toLocaleDateString(loc, { month: "long" });
  const monthTitle =
    locale === "en"
      ? `${monthName.toUpperCase()} ${year}`
      : `${monthName} ${year + 543}`;

  const getContentsForDay = (day: number) => {
    const dateStr = `${year}-${monthNumber}-${String(day).padStart(2, "0")}`;
    return contents.filter(
      (content) => getContentCalendarDate(content, dateField) === dateStr
    );
  };

  const getMeetingsForDay = (day: number) => {
    if (!showMeetings) return [];
    const dateStr = `${year}-${monthNumber}-${String(day).padStart(2, "0")}`;
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
    <div>
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div className="min-w-0">
          <p
            className={cn(
              "text-xl font-bold tracking-wide text-stone-900 sm:text-2xl",
              locale === "en" && "uppercase"
            )}
          >
            {monthTitle}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[44px_repeat(7,minmax(0,1fr))]">
            <div className="border-r border-b border-stone-200 px-2 py-2 text-center text-[10px] font-bold tracking-wide text-stone-400 uppercase">
              WK
            </div>
            {weekdays.desktop.map((day, index) => (
              <div
                key={day}
                className={cn(
                  "border-b border-stone-200 py-2.5 text-center text-xs font-bold text-stone-800 sm:text-sm",
                  index < weekdays.desktop.length - 1 && "border-r border-stone-200"
                )}
              >
                <span className="sm:hidden">{weekdays.mobile[index]}</span>
                <span className="hidden sm:inline">{day}</span>
              </div>
            ))}

            {weeks.map((week, weekIndex) => {
              const firstDay = week.find((day) => day !== null) ?? 1;
              const weekLabel = `W${getWeekNumber(new Date(year, month, firstDay))}`;
              const isLastWeek = weekIndex === weeks.length - 1;

              return (
                <div key={weekIndex} className="contents">
                  <div
                    className={cn(
                      "flex min-h-[112px] items-start justify-center border-r border-stone-200 px-1 py-3 text-[11px] font-semibold text-stone-400",
                      !isLastWeek && "border-b border-stone-200"
                    )}
                  >
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
                          "min-h-[112px] p-2 align-top",
                          dayIndex < week.length - 1 && "border-r border-stone-200",
                          !isLastWeek && "border-b border-stone-200",
                          todayFlag && "ring-2 ring-inset ring-emerald-500",
                          isSelected && !todayFlag && "bg-blue-50/30"
                        )}
                      >
                          {day && (
                            <>
                              <div className="mb-1.5 flex items-start justify-end gap-1.5">
                                {todayFlag && (
                                  <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                                    {locale === "en" ? "TODAY" : t("calendar.today")}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setSelectedDay(day)}
                                  className={cn(
                                    "text-sm font-semibold sm:cursor-default",
                                    todayFlag ? "text-emerald-700" : "text-stone-700"
                                  )}
                                >
                                  {String(day).padStart(2, "0")}
                                </button>
                              </div>
                              <div className="-mx-2 mt-1 space-y-1 px-2">
                                <div className="sm:hidden">
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
                                      className="w-full px-2 py-1 text-left text-[10px] font-medium text-blue-600"
                                    >
                                      {t("calendar.moreJobs", {
                                        count:
                                          dayEventCount - MOBILE_VISIBLE_EVENTS,
                                      })}
                                    </button>
                                  ) : null}
                                </div>
                                <div className="hidden sm:block">
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

      <div className="pt-4">
        <CalendarLegendBar />
      </div>
    </div>
  );
}
