"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/shared/utils";
import type {
  CalendarDateField,
  CalendarMode,
  DateRangePreset,
} from "@/lib/calendar/domain/filters";
import { PREPOST_DATE_FIELD_OPTIONS } from "@/lib/calendar/domain/filters";

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

function formatRangeDisplay(start: string, end: string): string {
  if (!start && !end) return "เลือกช่วงวันที่";
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
    <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center">
      <div ref={containerRef} className="relative min-w-[200px] flex-1 sm:max-w-xs">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex h-8 w-full items-center justify-between rounded-lg border border-stone-200 bg-white px-3 text-left text-sm text-stone-800 transition-colors hover:border-stone-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        >
          <span className={cn(!rangeStart && !rangeEnd && "text-stone-400")}>
            {formatRangeDisplay(rangeStart, rangeEnd)}
          </span>
          <Calendar className="h-3.5 w-3.5 shrink-0 text-stone-400" />
        </button>

        {open && (
          <div className="absolute top-[calc(100%+6px)] left-0 z-30 w-[min(100%,320px)] rounded-lg border border-stone-200 bg-white p-3 shadow-lg">
            {mode === "prepost" && (
              <Select
                label="กรองตาม"
                options={PREPOST_DATE_FIELD_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                value={dateField}
                onChange={(e) =>
                  onDateFieldChange(e.target.value as CalendarDateField)
                }
                className="mb-3"
              />
            )}
            {mode === "post" && (
              <p className="mb-3 text-xs text-stone-500">
                กรองตามวันที่โพสต์
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1 text-xs font-medium text-stone-600">
                จากวันที่
                <input
                  type="date"
                  value={rangeStart}
                  onChange={(e) => onRangeStartChange(e.target.value)}
                  className="h-9 rounded-md border border-stone-200 px-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-stone-600">
                ถึงวันที่
                <input
                  type="date"
                  value={rangeEnd}
                  onChange={(e) => onRangeEndChange(e.target.value)}
                  className="h-9 rounded-md border border-stone-200 px-2 text-sm"
                />
              </label>
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
                ล้างช่วงวันที่
              </button>
            )}
          </div>
        )}
      </div>

      <div className="inline-flex h-8 overflow-hidden rounded-lg border border-stone-200 bg-white">
        {PRESET_BUTTONS.map((preset, index) => {
          const isActive = activePreset === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onPresetChange(preset.id)}
              className={cn(
                "flex items-center px-2.5 text-xs text-stone-700 transition-colors hover:bg-stone-50 sm:px-3 sm:text-sm",
                index < PRESET_BUTTONS.length - 1 && "border-r border-stone-200",
                isActive &&
                  "relative z-10 bg-white font-medium text-stone-900 ring-2 ring-inset ring-teal-500"
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
