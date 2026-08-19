"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import type { MeetingItem } from "@/lib/collaboration/types";
import { fetchMeetings } from "@/lib/collaboration/actions/fetch";
import {
  COLLAB_MEETINGS_KEY,
  useCollaborationBootstrap,
} from "@/lib/collaboration/client/collaboration-provider";
import { getDaysInMonth } from "@/lib/shared/utils";
import { dateLocale, useT } from "@/lib/i18n";

export function useMeetingsCalendarPanel() {
  const { t, locale } = useT();
  const loc = dateLocale(locale);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const bootstrap = useCollaborationBootstrap();

  const { data: meetings = [], isLoading } = useSWR(
    COLLAB_MEETINGS_KEY,
    fetchMeetings,
    {
      fallbackData: bootstrap?.meetings,
      revalidateOnMount: !bootstrap,
      refreshInterval: 15000,
    }
  );

  const byDay = useMemo(() => {
    const map = new Map<string, MeetingItem[]>();
    for (const meeting of meetings) {
      const d = new Date(meeting.startsAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const list = map.get(key) ?? [];
      list.push(meeting);
      map.set(key, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    return map;
  }, [meetings]);

  const upcoming = useMemo(() => {
    const nowMs = Date.now();
    return [...meetings]
      .filter((m) => new Date(m.endsAt).getTime() >= nowMs)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .slice(0, 8);
  }, [meetings]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const monthLabel = new Date(year, month).toLocaleDateString(loc, { month: "long", year: "numeric" });

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const navigate = (dir: -1 | 1) => {
    let newMonth = month + dir;
    let newYear = year;
    if (newMonth < 0) { newMonth = 11; newYear -= 1; }
    else if (newMonth > 11) { newMonth = 0; newYear += 1; }
    setMonth(newMonth);
    setYear(newYear);
  };

  const isToday = (day: number) =>
    now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;

  const dayKey = (d: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return {
    // calendar
    year, month, cells, byDay, monthLabel, isToday, dayKey,
    // upcoming
    upcoming, isLoading,
    // nav
    navigate,
    // i18n
    t, loc, locale,
  };
}
