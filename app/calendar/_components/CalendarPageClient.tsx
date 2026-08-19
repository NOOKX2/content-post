"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { CalendarView } from "@/app/calendar/_components/CalendarView";
import { ContentCalendarGrid } from "@/app/calendar/_components/ContentCalendarGrid";
import { CalendarToolbar } from "@/app/calendar/_components/CalendarToolbar";
import { CalendarSummary } from "@/app/calendar/_components/CalendarSummary";
import { CalendarMonthlyPlan } from "@/app/calendar/_components/CalendarMonthlyPlan";
import { Header } from "@/components/layout/Header";
import { useContents } from "@/lib/content/client/contents-provider";
import {
  filterCalendarContents,
  getCalendarSummary,
  getDateRangeForPreset,
  type CalendarDateField,
  type CalendarMode,
  type DateRangePreset,
  type PostStatusFilter,
} from "@/lib/calendar/domain/filters";
import type { MediaType } from "@/lib/types";
import { fetchMeetings } from "@/lib/collaboration/actions/fetch";
import {
  getGoogleCalendarStatusAction,
  syncContentCalendarToGoogleAction,
} from "@/lib/content/actions/google-calendar";
import { dateLocale, useT } from "@/lib/i18n";

type CalendarViewMode = "month" | "week";
type MediaTypeFilter = "all" | MediaType;

export function CalendarPageClient() {
  const { t, locale } = useT();
  const [mode, setMode] = useState<CalendarMode>("post");
  const [view, setView] = useState<CalendarViewMode>("month");
  const [search, setSearch] = useState("");
  const [dateField, setDateField] = useState<CalendarDateField>("post");
  const [statusFilter, setStatusFilter] = useState<PostStatusFilter>("all");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaTypeFilter>("all");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [activePreset, setActivePreset] = useState<DateRangePreset | null>(null);
  const [syncingGoogle, setSyncingGoogle] = useState(false);

  const { contents, mutateContents } = useContents();
  const { data: session } = useSession();
  const { data: meetings = [] } = useSWR("calendar-meetings", fetchMeetings, {
    refreshInterval: 30000,
  });
  const { data: googleStatus } = useSWR(
    "google-calendar-status",
    getGoogleCalendarStatusAction
  );

  const handleModeChange = (nextMode: CalendarMode) => {
    setMode(nextMode);
    setDateField(nextMode === "post" ? "post" : "ideaFinished");
    if (nextMode === "prepost") {
      setStatusFilter("all");
    }
  };

  const filteredContents = useMemo(() => {
    const base = filterCalendarContents(contents, {
      mode,
      search,
      dateField,
      rangeStart: rangeStart || undefined,
      rangeEnd: rangeEnd || undefined,
      statusFilter,
    });
    if (mediaTypeFilter === "all") return base;
    return base.filter((content) => content.mediaType === mediaTypeFilter);
  }, [
    contents,
    mode,
    search,
    dateField,
    rangeStart,
    rangeEnd,
    statusFilter,
    mediaTypeFilter,
  ]);

  const summarySource = useMemo(
    () =>
      filterCalendarContents(contents, {
        mode: "post",
        search,
        dateField: "post",
        rangeStart: rangeStart || undefined,
        rangeEnd: rangeEnd || undefined,
        statusFilter: "all",
      }),
    [contents, search, rangeStart, rangeEnd]
  );

  const summary = useMemo(
    () => getCalendarSummary(summarySource),
    [summarySource]
  );

  const summaryMonthLabel = useMemo(() => {
    const now = new Date();
    const loc = dateLocale(locale);
    if (locale === "en") {
      return now
        .toLocaleDateString("en-US", { month: "short", year: "numeric" })
        .toUpperCase()
        .replace(" ", " / ");
    }
    const month = now.toLocaleDateString(loc, { month: "short" });
    const year = now.toLocaleDateString(loc, { year: "numeric" });
    return `${month} / ${year}`;
  }, [locale]);

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

  const handleSyncGoogle = async () => {
    setSyncingGoogle(true);
    try {
      const result = await syncContentCalendarToGoogleAction();
      if (!result.configured) {
        alert(t("calendar.syncGoogleNotConfigured"));
        return;
      }
      if (result.failed > 0) {
        alert(
          t("calendar.syncGooglePartial", {
            synced: result.synced,
            failed: result.failed,
          })
        );
      } else {
        alert(t("calendar.syncGoogleDone", { synced: result.synced }));
      }
      await mutateContents();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : t("calendar.syncGoogleFailed")
      );
    } finally {
      setSyncingGoogle(false);
    }
  };

  return (
    <>
      <Header session={session} title={t("calendar.pageTitle")} compact />
      <div className="space-y-4 bg-white px-4 py-4 sm:px-6">
        <CalendarToolbar
          mode={mode}
          onModeChange={handleModeChange}
          search={search}
          onSearchChange={setSearch}
          dateField={dateField}
          onDateFieldChange={setDateField}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          mediaTypeFilter={mediaTypeFilter}
          onMediaTypeFilterChange={setMediaTypeFilter}
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
          viewTabs={[
            { id: "month", label: t("calendar.month") },
            { id: "week", label: t("calendar.week") },
          ]}
          googleConfigured={Boolean(googleStatus?.configured)}
          syncingGoogle={syncingGoogle}
          onSyncGoogle={() => void handleSyncGoogle()}
        />

        {view === "week" ? (
          <CalendarView contents={filteredContents} dateField={dateField} />
        ) : (
          <ContentCalendarGrid
            contents={filteredContents}
            dateField={dateField}
            meetings={meetings}
            showMeetings
          />
        )}

        {mode === "post" && (
          <div className="grid gap-6 pt-2 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
            <CalendarMonthlyPlan
              posted={summary.posted}
              total={summary.total}
              className="border-b border-stone-200 pb-6 lg:border-r lg:border-b-0 lg:pr-8"
            />
            <CalendarSummary
              total={summary.total}
              waiting={summary.waiting}
              posted={summary.posted}
              needsEdit={summary.needsEdit}
              monthLabel={summaryMonthLabel}
              className="lg:pl-0"
            />
          </div>
        )}
      </div>
    </>
  );
}
