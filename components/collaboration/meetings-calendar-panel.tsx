"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchMeetings } from "@/lib/collaboration/fetch-actions";
import type { MeetingItem } from "@/lib/collaboration/types";
import { cn, getDaysInMonth } from "@/lib/utils";

const WEEKDAYS = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];

function toLocalDateKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dayKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function MeetingsCalendarPanel() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const { data: meetings = [], isLoading } = useSWR(
    "collab-meetings",
    fetchMeetings,
    { refreshInterval: 15000 }
  );

  const byDay = useMemo(() => {
    const map = new Map<string, MeetingItem[]>();
    for (const meeting of meetings) {
      const key = toLocalDateKey(meeting.startsAt);
      const list = map.get(key) ?? [];
      list.push(meeting);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    }
    return map;
  }, [meetings]);

  const upcoming = useMemo(() => {
    const nowMs = Date.now();
    return [...meetings]
      .filter((meeting) => new Date(meeting.endsAt).getTime() >= nowMs)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .slice(0, 8);
  }, [meetings]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const monthLabel = new Date(year, month).toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  });

  const navigate = (dir: -1 | 1) => {
    let newMonth = month + dir;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setMonth(newMonth);
    setYear(newYear);
  };

  const isToday = (day: number) =>
    now.getFullYear() === year &&
    now.getMonth() === month &&
    now.getDate() === day;

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-4 lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-stone-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-stone-900">
              ปฏิทินการประชุม
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-30 text-center text-sm font-bold text-stone-800">
              {monthLabel}
            </span>
            <Button variant="ghost" size="sm" onClick={() => navigate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto p-3">
          <div className="grid grid-cols-7 gap-px rounded-lg bg-stone-200">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="bg-stone-100 px-2 py-2 text-center text-xs font-bold tracking-wide text-stone-600"
              >
                {day}
              </div>
            ))}

            {cells.map((day, index) => {
              const dayMeetings = day ? (byDay.get(dayKey(year, month, day)) ?? []) : [];
              const todayFlag = day ? isToday(day) : false;

              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-26 bg-white p-1.5",
                    todayFlag &&
                      "bg-blue-50/40 ring-2 ring-inset ring-blue-500/50"
                  )}
                >
                  {day && (
                    <>
                      <div className="mb-1 flex items-center justify-between">
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            todayFlag ? "text-blue-700" : "text-stone-700"
                          )}
                        >
                          {day}
                        </span>
                        {todayFlag && (
                          <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            วันนี้
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {dayMeetings.map((meeting) => (
                          <a
                            key={meeting.id}
                            href={meeting.meetUrl || meeting.calendarLink || undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`${meeting.title} · ${timeLabel(meeting.startsAt)}`}
                            className="block rounded-md border border-blue-200 bg-blue-50 px-1.5 py-1 transition-colors hover:bg-blue-100"
                          >
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-700">
                              <Clock className="h-2.5 w-2.5 shrink-0" />
                              {timeLabel(meeting.startsAt)}
                            </span>
                            <span className="mt-0.5 block truncate text-[11px] font-medium text-stone-800">
                              {meeting.title}
                            </span>
                          </a>
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

      <div className="flex shrink-0 flex-col rounded-xl border border-stone-200/80 bg-white shadow-sm lg:w-80">
        <div className="border-b border-stone-200 px-4 py-2.5">
          <h3 className="text-sm font-semibold text-stone-900">การประชุมที่กำลังจะถึง</h3>
        </div>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-stone-400">กำลังโหลด...</p>
          ) : upcoming.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">
              ยังไม่มีการประชุมที่กำลังจะถึง
            </p>
          ) : (
            upcoming.map((meeting) => (
              <div
                key={meeting.id}
                className="rounded-lg border border-stone-200 p-3"
              >
                <p className="truncate text-sm font-semibold text-stone-900">
                  {meeting.title}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(meeting.startsAt).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  {timeLabel(meeting.startsAt)} – {timeLabel(meeting.endsAt)}
                </p>
                <p className="mt-0.5 truncate text-xs text-stone-400">
                  {meeting.channelName || meeting.authorName}
                  {meeting.attendeeCount > 0 && (
                    <span className="ml-1 inline-flex items-center gap-1">
                      · <Users className="h-3 w-3" />
                      {meeting.attendeeCount}
                    </span>
                  )}
                </p>
                {meeting.meetUrl && (
                  <a
                    href={meeting.meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    <Video className="h-3.5 w-3.5" />
                    เข้า Meet
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
