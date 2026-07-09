"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { CalendarView } from "@/components/calendar/calendar-view";
import { ContentCalendarGrid } from "@/components/calendar/content-calendar-grid";
import { CalendarToolbar } from "@/components/calendar/calendar-toolbar";
import { CalendarSummary } from "@/components/calendar/calendar-summary";
import { Header } from "@/components/layout/header";
import { useContents } from "@/lib/content/contents-provider";
import {
  filterCalendarContents,
  getCalendarSummary,
  getDateRangeForPreset,
  type CalendarDateField,
  type DateRangePreset,
} from "@/lib/calendar/filters";

const VIEW_TABS = [
  { id: "month", label: "รายเดือน" },
  { id: "week", label: "รายสัปดาห์" },
] as const;

type CalendarViewMode = (typeof VIEW_TABS)[number]["id"];

export function CalendarPageClient() {
  const [view, setView] = useState<CalendarViewMode>("month");
  const [search, setSearch] = useState("");
  const [dateField, setDateField] = useState<CalendarDateField>("post");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [activePreset, setActivePreset] = useState<DateRangePreset | null>(
    null
  );

  const { contents } = useContents();
  const { data: session } = useSession();

  const filteredContents = useMemo(
    () =>
      filterCalendarContents(contents, {
        search,
        dateField,
        rangeStart: rangeStart || undefined,
        rangeEnd: rangeEnd || undefined,
        postingOnly: true,
      }),
    [contents, search, dateField, rangeStart, rangeEnd]
  );

  const summary = useMemo(
    () => getCalendarSummary(filteredContents),
    [filteredContents]
  );

  const handleClearRange = () => {
    setRangeStart("");
    setRangeEnd("");
    setActivePreset(null);
  };

  const handlePresetChange = (preset: Exclude<DateRangePreset, "custom">) => {
    if (activePreset === preset) {
      handleClearRange();
      return;
    }

    const range = getDateRangeForPreset(preset);
    setRangeStart(range.start);
    setRangeEnd(range.end);
    setActivePreset(preset);
  };

  return (
    <>
      <Header session={session} title="ตารางลงคอนเทนต์" compact />
      <div className="space-y-3 px-4 py-3">
        <CalendarToolbar
          search={search}
          onSearchChange={setSearch}
          dateField={dateField}
          onDateFieldChange={setDateField}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onRangeStartChange={(value) => {
            setRangeStart(value);
            setActivePreset("custom");
          }}
          onRangeEndChange={(value) => {
            setRangeEnd(value);
            setActivePreset("custom");
          }}
          activePreset={activePreset}
          onPresetChange={handlePresetChange}
          onClearRange={handleClearRange}
          view={view}
          onViewChange={(id) => setView(id as CalendarViewMode)}
          viewTabs={[...VIEW_TABS]}
        />

        {view === "week" ? (
          <CalendarView contents={filteredContents} dateField={dateField} />
        ) : (
          <ContentCalendarGrid
            contents={filteredContents}
            dateField={dateField}
          />
        )}

        <CalendarSummary
          total={summary.total}
          waiting={summary.waiting}
          posted={summary.posted}
        />
      </div>
    </>
  );
}
