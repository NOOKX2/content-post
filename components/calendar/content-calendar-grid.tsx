"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ContentItem } from "@/lib/types";
import { ContentCard } from "./content-card";
import { PlatformBadgeGroup } from "@/components/ui/platform-icon";
import { PLATFORMS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
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
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(5);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const monthLabel = new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  }).toUpperCase();

  const approvedContents = contents.filter(
    (c) =>
      c.status === "approved" ||
      c.status === "scheduled" ||
      c.status === "posted"
  );

  const getContentsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return approvedContents.filter((c) => c.scheduledDate === dateStr);
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

  const today = new Date(2026, 5, 15);
  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

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
                          <div
                            key={c.id}
                            className="rounded-md border border-stone-100 bg-stone-50/80 p-1.5"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[11px] font-bold text-stone-800 truncate">
                                {c.channel}
                              </span>
                              <PlatformBadgeGroup
                                platforms={c.platforms}
                                size="sm"
                              />
                            </div>
                            <p className="text-[10px] text-stone-500 truncate mt-0.5">
                              {c.category}
                            </p>
                          </div>
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

      <div className="flex flex-wrap items-center gap-4 border-t border-stone-200 px-6 py-4">
        <span className="text-xs font-medium text-stone-500">Platform Key:</span>
        {PLATFORMS.slice(0, 4).map((p) => (
          <span key={p.id} className="flex items-center gap-1.5 text-xs text-stone-600">
            <PlatformBadgeGroup platforms={[p.id]} size="sm" />
            {p.shortLabel}
          </span>
        ))}
        <span className="ml-auto text-xs text-stone-400">
          * Hero Product Content
        </span>
      </div>
    </div>
  );
}
