"use client";

import { CalendarDays, ChevronDown, Search } from "lucide-react";
import { CalendarDateRangeFilter } from "@/app/calendar/_components/CalendarDateRangeFilter";
import { cn } from "@/lib/shared/utils";
import type {
  CalendarDateField,
  CalendarMode,
  DateRangePreset,
  PostStatusFilter,
} from "@/lib/calendar/domain/filters";
import { POST_STATUS_FILTERS } from "@/lib/calendar/domain/filters";
import type { MediaType } from "@/lib/types";
import { useT } from "@/lib/i18n";

type MediaTypeFilter = "all" | MediaType;

const UNDERLINE_FIELD =
  "h-9 w-full appearance-none border-0 border-b border-stone-200 bg-transparent text-sm text-stone-900 outline-none transition-colors focus:border-emerald-600 focus:ring-0";

interface CalendarToolbarProps {
  mode: CalendarMode;
  onModeChange: (mode: CalendarMode) => void;
  search: string;
  onSearchChange: (value: string) => void;
  dateField: CalendarDateField;
  onDateFieldChange: (value: CalendarDateField) => void;
  statusFilter: PostStatusFilter;
  onStatusFilterChange: (value: PostStatusFilter) => void;
  mediaTypeFilter: MediaTypeFilter;
  onMediaTypeFilterChange: (value: MediaTypeFilter) => void;
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
  googleConfigured: boolean;
  syncingGoogle: boolean;
  onSyncGoogle: () => void;
}

function FilterColumn({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-5 pt-4 pb-4", className)}>
      <span className="mb-2 block text-xs text-stone-500">{label}</span>
      {children}
    </div>
  );
}

function UnderlineSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(UNDERLINE_FIELD, "cursor-pointer pr-6")}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-0 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
    </div>
  );
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
  mediaTypeFilter,
  onMediaTypeFilterChange,
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
  googleConfigured,
  syncingGoogle,
  onSyncGoogle,
}: CalendarToolbarProps) {
  const { t } = useT();

  const statusOptions = POST_STATUS_FILTERS.map((filter) => ({
    value: filter.id,
    label: t(
      filter.id === "all"
        ? "calendar.allJobs"
        : filter.id === "waiting"
          ? "calendar.waiting"
          : filter.id === "posted"
            ? "calendar.posted"
            : "calendar.needsEdit"
    ),
  }));

  const typeOptions = [
    { value: "all", label: t("calendar.typeAll") },
    { value: "video", label: t("media.video") },
    { value: "image", label: t("media.image") },
    { value: "graphic", label: t("media.graphic") },
  ];

  const prepostOptions = [
    { value: "ideaFinished", label: t("calendar.ideaFinished") },
    { value: "shoot", label: t("calendar.shoot") },
    { value: "editFinished", label: t("calendar.editFinished") },
  ];

  return (
    <div>
      <div className="border-b border-stone-200 pb-4">
        <p className="text-[10px] font-medium tracking-[0.2em] text-stone-400 uppercase">
          {t("calendar.plannerEyebrow")}
        </p>

        <div className="mt-1 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div className="flex flex-wrap items-end gap-6">
            <h1 className="pb-2 text-xl font-bold text-stone-900 sm:text-2xl">
              {t("calendar.pageTitle")}
            </h1>

            <div className="flex gap-6">
              {([
                { id: "post", label: t("calendar.postMode") },
                { id: "prepost", label: t("calendar.prepostMode") },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onModeChange(tab.id)}
                  className={cn(
                    "border-b-2 pb-2 text-sm font-semibold transition-colors",
                    mode === tab.id
                      ? "border-emerald-600 text-stone-900"
                      : "border-transparent text-stone-400 hover:text-stone-700"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-6">
            {viewTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onViewChange(tab.id)}
                className={cn(
                  "border-b-2 pb-2 text-sm font-semibold transition-colors",
                  view === tab.id
                    ? "border-emerald-600 text-stone-900"
                    : "border-transparent text-stone-400 hover:text-stone-700"
                )}
              >
                {tab.label}
              </button>
            ))}

            <div className="mb-2 hidden h-4 w-px bg-stone-200 sm:block" />

            <button
              type="button"
              disabled={syncingGoogle || !googleConfigured}
              onClick={onSyncGoogle}
              title={
                googleConfigured
                  ? t("calendar.syncGoogle")
                  : t("calendar.syncGoogleNotConfigured")
              }
              className="mb-0.5 inline-flex items-center gap-1.5 pb-2 text-sm font-semibold text-stone-700 transition-colors hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CalendarDays className="h-4 w-4 text-emerald-600" />
              {syncingGoogle ? t("calendar.syncingGoogle") : t("calendar.syncGoogle")}
            </button>
          </div>
        </div>
      </div>

      <div className="grid border-b border-stone-200 sm:grid-cols-2 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1.5fr)_minmax(0,0.85fr)_minmax(0,0.85fr)] [&>*:first-child]:pl-6 [&>*:last-child]:pr-6 sm:[&>*:first-child]:pl-8 sm:[&>*:last-child]:pr-8">
        <FilterColumn label={t("calendar.searchContent")}>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-0 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("calendar.searchPlaceholder")}
              className={cn(UNDERLINE_FIELD, "pl-5 placeholder:text-stone-400")}
            />
          </div>
        </FilterColumn>

        <FilterColumn label={t("calendar.searchCalendar")}>
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
        </FilterColumn>

        <FilterColumn
          label={`${t("calendar.statusLabel")} ${t("calendar.statusAll")}`}
        >
          {mode === "post" ? (
            <UnderlineSelect
              value={statusFilter}
              onChange={(value) => onStatusFilterChange(value as PostStatusFilter)}
              options={statusOptions}
            />
          ) : (
            <UnderlineSelect
              value={dateField}
              onChange={(value) => onDateFieldChange(value as CalendarDateField)}
              options={prepostOptions}
            />
          )}
        </FilterColumn>

        <FilterColumn
          label={`${t("calendar.contentType")} ${t("calendar.typeAll")}`}
        >
          <UnderlineSelect
            value={mediaTypeFilter}
            onChange={(value) => onMediaTypeFilterChange(value as MediaTypeFilter)}
            options={typeOptions}
          />
        </FilterColumn>
      </div>
    </div>
  );
}
