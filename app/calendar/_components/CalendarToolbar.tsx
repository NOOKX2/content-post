"use client";

import { CalendarDays, Search, Video } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { CalendarDateRangeFilter } from "@/app/calendar/_components/CalendarDateRangeFilter";
import { cn } from "@/lib/shared/utils";
import type {
  CalendarDateField,
  CalendarMode,
  DateRangePreset,
  PostStatusFilter,
} from "@/lib/calendar/domain/filters";
import { POST_STATUS_FILTERS } from "@/lib/calendar/domain/filters";
import { useT } from "@/lib/i18n";

interface CalendarToolbarProps {
  mode: CalendarMode;
  onModeChange: (mode: CalendarMode) => void;
  search: string;
  onSearchChange: (value: string) => void;
  dateField: CalendarDateField;
  onDateFieldChange: (value: CalendarDateField) => void;
  statusFilter: PostStatusFilter;
  onStatusFilterChange: (value: PostStatusFilter) => void;
  rangeStart: string;
  rangeEnd: string;
  onRangeStartChange: (value: string) => void;
  onRangeEndChange: (value: string) => void;
  activePreset: DateRangePreset | null;
  onPresetChange: (preset: Exclude<DateRangePreset, "custom">) => void;
  onClearRange: () => void;
  view: string;
  onViewChange: (view: string) => void;
  viewTabs: { id: string; label: string }[];
  showMeetings: boolean;
  onShowMeetingsChange: (value: boolean) => void;
  googleConfigured: boolean;
  syncingGoogle: boolean;
  onSyncGoogle: () => void;
}

export function CalendarToolbar({
  mode,
  onModeChange,
  search,
  onSearchChange,
  dateField,
  onDateFieldChange,
  statusFilter,
  onStatusFilterChange,
  rangeStart,
  rangeEnd,
  onRangeStartChange,
  onRangeEndChange,
  activePreset,
  onPresetChange,
  onClearRange,
  view,
  onViewChange,
  viewTabs,
  showMeetings,
  onShowMeetingsChange,
  googleConfigured,
  syncingGoogle,
  onSyncGoogle,
}: CalendarToolbarProps) {
  const { t } = useT();

  return (
    <div className="space-y-2 rounded-xl border border-stone-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex flex-col gap-1.5 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          tabs={[
            { id: "post", label: t("calendar.postMode") },
            { id: "prepost", label: t("calendar.prepostMode") },
          ]}
          activeTab={mode}
          onChange={(id) => onModeChange(id as CalendarMode)}
          className="w-auto shrink-0"
          compact
        />
        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            tabs={viewTabs}
            activeTab={view}
            onChange={onViewChange}
            className="w-auto shrink-0"
            compact
          />
          <button
            type="button"
            onClick={() => onShowMeetingsChange(!showMeetings)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
              showMeetings
                ? "border-emerald-500 bg-emerald-50 font-medium text-emerald-800"
                : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
            )}
          >
            <Video className="h-3.5 w-3.5" />
            {t("calendar.showMeetings")}
          </button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={syncingGoogle || !googleConfigured}
            onClick={onSyncGoogle}
            title={
              googleConfigured
                ? t("calendar.syncGoogle")
                : t("calendar.syncGoogleNotConfigured")
            }
            className="h-8 gap-1.5 text-xs"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            {syncingGoogle ? t("calendar.syncingGoogle") : t("calendar.syncGoogle")}
          </Button>
        </div>
      </div>

      {mode === "post" && (
        <div className="flex flex-wrap gap-1.5">
          {POST_STATUS_FILTERS.map((filter) => {
            const active = statusFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onStatusFilterChange(filter.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  active
                    ? "border-teal-500 bg-teal-50 font-medium text-teal-800"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                )}
              >
                {t(
                  filter.id === "all"
                    ? "calendar.allJobs"
                    : filter.id === "waiting"
                      ? "calendar.waiting"
                      : filter.id === "posted"
                        ? "calendar.posted"
                        : "calendar.needsEdit"
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-1.5 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-xs lg:shrink-0">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("calendar.searchPlaceholder")}
            className="h-8 pl-8 text-sm"
          />
        </div>

        <CalendarDateRangeFilter
          mode={mode}
          dateField={dateField}
          onDateFieldChange={onDateFieldChange}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onRangeStartChange={onRangeStartChange}
          onRangeEndChange={onRangeEndChange}
          activePreset={activePreset}
          onPresetChange={onPresetChange}
          onClearRange={onClearRange}
        />
      </div>
    </div>
  );
}
