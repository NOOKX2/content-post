"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { CalendarView } from "@/app/calendar/_components/CalendarView";
import { ContentCalendarGrid } from "@/app/calendar/_components/ContentCalendarGrid";
import { CalendarToolbar } from "@/app/calendar/_components/CalendarToolbar";
import { CalendarSummary } from "@/app/calendar/_components/CalendarSummary";
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
import { fetchMeetings } from "@/lib/collaboration/actions/fetch";
import {
  getGoogleCalendarStatusAction,
  syncContentCalendarToGoogleAction,
} from "@/lib/content/actions/google-calendar";
import { useT } from "@/lib/i18n";

const VIEW_TABS = [
  { id: "month", label: "รายเดือน" },
  { id: "week", label: "รายสัปดาห์" },
] as const;

type CalendarViewMode = (typeof VIEW_TABS)[number]["id"];

export function CalendarPageClient() {
  const { t } = useT();
  const [mode, setMode] = useState<CalendarMode>("post");
  const [view, setView] = useState<CalendarViewMode>("month");
  const [search, setSearch] = useState("");
  const [dateField, setDateField] = useState<CalendarDateField>("post");
  const [statusFilter, setStatusFilter] = useState<PostStatusFilter>("all");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [activePreset, setActivePreset] = useState<DateRangePreset | null>(
    null
  );
  const [showMeetings, setShowMeetings] = useState(true);
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

  const filteredContents = useMemo(
    () =>
      filterCalendarContents(contents, {
        mode,
        search,
        dateField,
        rangeStart: rangeStart || undefined,
        rangeEnd: rangeEnd || undefined,
        statusFilter,
      }),
    [contents, mode, search, dateField, rangeStart, rangeEnd, statusFilter]
  );

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
      <Header
        session={session}
        title={mode === "post" ? t("calendar.postTitle") : t("calendar.prepostTitle")}
        compact
      />
      <div className="space-y-3 px-4 py-3">
        <CalendarToolbar
          mode={mode}
          onModeChange={handleModeChange}
          search={search}
          onSearchChange={setSearch}
          dateField={dateField}
          onDateFieldChange={setDateField}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
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
          showMeetings={showMeetings}
          onShowMeetingsChange={setShowMeetings}
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
            showMeetings={showMeetings}
          />
        )}

        {mode === "post" && (
          <CalendarSummary
            total={summary.total}
            waiting={summary.waiting}
            posted={summary.posted}
            needsEdit={summary.needsEdit}
          />
        )}
      </div>
    </>
  );
}
