"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { CalendarDateRangeFilter } from "@/components/calendar/calendar-date-range-filter";
import type {
  CalendarDateField,
  DateRangePreset,
} from "@/lib/calendar/filters";

interface CalendarToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  dateField: CalendarDateField;
  onDateFieldChange: (value: CalendarDateField) => void;
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

export function CalendarToolbar({
  search,
  onSearchChange,
  dateField,
  onDateFieldChange,
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
    <div className="space-y-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex flex-col gap-1.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ค้นหารหัสหรือชื่อคอนเทนต์..."
            className="h-8 pl-8 text-sm"
          />
        </div>

        <Tabs
          tabs={viewTabs}
          activeTab={view}
          onChange={onViewChange}
          className="w-auto shrink-0"
          compact
        />
      </div>

      <CalendarDateRangeFilter
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
  );
}
