"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import {
  calendarStateToSearchParams,
  parseCalendarSearchParams,
  type CalendarUrlState,
  type CalendarViewMode,
  type MediaTypeFilter,
} from "@/lib/calendar/domain/url-state";
import { fetchMeetings } from "@/lib/collaboration/actions/fetch";
import {
  getGoogleCalendarStatusAction,
  syncContentCalendarToGoogleAction,
} from "@/lib/content/actions/google-calendar";
import { dateLocale, useT } from "@/lib/i18n";

function CalendarPageContent() {
  const { t, locale } = useT();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = useMemo(
    () => parseCalendarSearchParams(searchParams),
    [searchParams]
  );
  const [syncingGoogle, setSyncingGoogle] = useState(false);

  const replaceState = useCallback(
    (patch: Partial<CalendarUrlState>) => {
      const next = { ...state, ...patch };
      const params = calendarStateToSearchParams(next);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, state]
  );

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
    replaceState({
      mode: nextMode,
      dateField: nextMode === "post" ? "post" : "ideaFinished",
      statusFilter: nextMode === "prepost" ? "all" : state.statusFilter,
    });
  };

  const filteredContents = useMemo(() => {
    const base = filterCalendarContents(contents, {
      mode: state.mode,
      search: state.search,
      dateField: state.dateField,
      rangeStart: state.rangeStart || undefined,
      rangeEnd: state.rangeEnd || undefined,
      statusFilter: state.statusFilter,
    });
    if (state.mediaTypeFilter === "all") return base;
    return base.filter((content) => content.mediaType === state.mediaTypeFilter);
  }, [contents, state]);

  const summarySource = useMemo(
    () =>
      filterCalendarContents(contents, {
        mode: "post",
        search: state.search,
        dateField: "post",
        rangeStart: state.rangeStart || undefined,
        rangeEnd: state.rangeEnd || undefined,
        statusFilter: "all",
      }),
    [contents, state.search, state.rangeStart, state.rangeEnd]
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
    replaceState({
      rangeStart: "",
      rangeEnd: "",
      activePreset: null,
    });
  };

  const handlePresetChange = (preset: Exclude<DateRangePreset, "custom">) => {
    if (state.activePreset === preset) {
      handleClearRange();
      return;
    }

    const range = getDateRangeForPreset(preset);
    replaceState({
      rangeStart: range.start,
      rangeEnd: range.end,
      activePreset: preset,
    });
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
          mode={state.mode}
          onModeChange={handleModeChange}
          search={state.search}
          onSearchChange={(value) => replaceState({ search: value })}
          dateField={state.dateField}
          onDateFieldChange={(value: CalendarDateField) =>
            replaceState({ dateField: value })
          }
          statusFilter={state.statusFilter}
          onStatusFilterChange={(value: PostStatusFilter) =>
            replaceState({ statusFilter: value })
          }
          mediaTypeFilter={state.mediaTypeFilter}
          onMediaTypeFilterChange={(value: MediaTypeFilter) =>
            replaceState({ mediaTypeFilter: value })
          }
          rangeStart={state.rangeStart}
          rangeEnd={state.rangeEnd}
          onRangeStartChange={(value) => {
            replaceState({ rangeStart: value, activePreset: "custom" });
          }}
          onRangeEndChange={(value) => {
            replaceState({ rangeEnd: value, activePreset: "custom" });
          }}
          activePreset={state.activePreset}
          onPresetChange={handlePresetChange}
          onClearRange={handleClearRange}
          view={state.view}
          onViewChange={(id) => replaceState({ view: id as CalendarViewMode })}
          viewTabs={[
            { id: "month", label: t("calendar.month") },
            { id: "week", label: t("calendar.week") },
          ]}
          googleConfigured={Boolean(googleStatus?.configured)}
          syncingGoogle={syncingGoogle}
          onSyncGoogle={() => void handleSyncGoogle()}
        />

        {state.view === "week" ? (
          <CalendarView contents={filteredContents} dateField={state.dateField} />
        ) : (
          <ContentCalendarGrid
            contents={filteredContents}
            dateField={state.dateField}
            meetings={meetings}
            showMeetings
          />
        )}

        {state.mode === "post" && (
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

export function CalendarPageClient() {
  return (
    <Suspense fallback={null}>
      <CalendarPageContent />
    </Suspense>
  );
}
