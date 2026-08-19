"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/shared/utils";
import type {
  CalendarDateField,
  CalendarMode,
  DateRangePreset,
} from "@/lib/calendar/domain/filters";
import { PREPOST_DATE_FIELD_OPTIONS } from "@/lib/calendar/domain/filters";
import { useT } from "@/lib/i18n";

const PRESET_BUTTONS: {
  id: Exclude<DateRangePreset, "custom">;
  label: string;
}[] = [
  { id: "today", label: "วันนี้" },
  { id: "7d", label: "7 วันที่ผ่านมา" },
  { id: "30d", label: "30 วันที่ผ่านมา" },
];

function formatRangePart(date: string): string {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return `${month}/${day}/${year}`;
}

function formatRangeDisplay(
  start: string,
  end: string,
  emptyLabel: string
): string {
  if (!start && !end) return emptyLabel;
  if (start && end) {
    return `${formatRangePart(start)} - ${formatRangePart(end)}`;
  }
  if (start) return `${formatRangePart(start)} - ...`;
  return `... - ${formatRangePart(end)}`;
}

interface CalendarDateRangeFilterProps {
  mode: CalendarMode;
  dateField: CalendarDateField;
  onDateFieldChange: (value: CalendarDateField) => void;
  rangeStart: string;
  rangeEnd: string;
  onRangeStartChange: (value: string) => void;
  onRangeEndChange: (value: string) => void;
  activePreset: DateRangePreset | null;
  onPresetChange: (preset: Exclude<DateRangePreset, "custom">) => void;
  onClearRange: () => void;
}

export function CalendarDateRangeFilter({
  mode,
  dateField,
  onDateFieldChange,
  rangeStart,
  rangeEnd,
  onRangeStartChange,
  onRangeEndChange,
  activePreset,
  onPresetChange,
  onClearRange,
}: CalendarDateRangeFilterProps) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div ref={containerRef} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-9 w-full items-center justify-between border-0 border-b border-stone-200 bg-transparent px-0 text-left text-sm text-stone-800 transition-colors hover:border-stone-300 focus:border-emerald-600 focus:outline-none"
      >
        <span className={cn(!rangeStart && !rangeEnd && "text-stone-400")}>
          {formatRangeDisplay(rangeStart, rangeEnd, t("calendar.pickRange"))}
        </span>
        <Calendar className="h-3.5 w-3.5 shrink-0 text-stone-400" />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 z-30 w-[min(100%,320px)] border border-stone-200 bg-white p-3 shadow-lg">
          {mode === "prepost" && (
            <Select
              label={t("calendar.filterBy")}
              options={PREPOST_DATE_FIELD_OPTIONS.map((option) => ({
                value: option.value,
                label: t(`calendar.${option.value}`),
              }))}
              value={dateField}
              onChange={(e) =>
                onDateFieldChange(e.target.value as CalendarDateField)
              }
              className="mb-3 rounded-none"
            />
          )}
          {mode === "post" && (
            <p className="mb-3 text-xs text-stone-500">
              {t("calendar.filterByPostDate")}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-stone-600">
              {t("calendar.fromDate")}
              <input
                type="date"
                value={rangeStart}
                onChange={(e) => onRangeStartChange(e.target.value)}
                className="h-9 border border-stone-200 px-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-stone-600">
              {t("calendar.toDate")}
              <input
                type="date"
                value={rangeEnd}
                onChange={(e) => onRangeEndChange(e.target.value)}
                className="h-9 border border-stone-200 px-2 text-sm"
              />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 border-t border-stone-100 pt-3">
            {PRESET_BUTTONS.map((preset) => {
              const isActive = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onPresetChange(preset.id)}
                  className={cn(
                    "px-2 py-1 text-xs transition-colors",
                    isActive
                      ? "font-medium text-emerald-700 underline"
                      : "text-stone-500 hover:text-stone-800"
                  )}
                >
                  {preset.id === "today"
                    ? t("calendar.today")
                    : preset.id === "7d"
                      ? t("calendar.last7")
                      : t("calendar.last30")}
                </button>
              );
            })}
          </div>
          {(rangeStart || rangeEnd) && (
            <button
              type="button"
              onClick={() => {
                onClearRange();
                setOpen(false);
              }}
              className="mt-3 text-xs text-stone-500 hover:text-stone-700"
            >
              {t("calendar.clearRange")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
