"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
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
}

const MODE_TABS = [
  { id: "post", label: "Post" },
  { id: "prepost", label: "Pre Post" },
] as const;

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
}: CalendarToolbarProps) {
  return (
    <div className="space-y-2 rounded-xl border border-stone-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex flex-col gap-1.5 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          tabs={[...MODE_TABS]}
          activeTab={mode}
          onChange={(id) => onModeChange(id as CalendarMode)}
          className="w-auto shrink-0"
          compact
        />
        <Tabs
          tabs={viewTabs}
          activeTab={view}
          onChange={onViewChange}
          className="w-auto shrink-0"
          compact
        />
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
                {filter.label}
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
            placeholder="ค้นหารหัสหรือชื่อคอนเทนต์..."
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
