"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/shared/utils";
import { flatFieldClass } from "@/lib/shared/form-field-styles";

const CUSTOM_VALUE = "__custom__";

interface CreatableSingleSelectProps {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  customPlaceholder?: string;
  customOptionLabel?: string;
  className?: string;
  variant?: "default" | "flat";
}

export function CreatableSingleSelect({
  options,
  value,
  onChange,
  placeholder = "เลือก...",
  customPlaceholder = "ระบุเอง...",
  customOptionLabel = "ระบุเอง...",
  className,
  variant = "default",
}: CreatableSingleSelectProps) {
  const valueIsCustom = Boolean(value) && !options.includes(value);
  const [customMode, setCustomMode] = useState(valueIsCustom);
  const isFlat = variant === "flat";

  useEffect(() => {
    if (valueIsCustom) {
      setCustomMode(true);
    } else if (!value) {
      setCustomMode(false);
    }
  }, [value, valueIsCustom]);

  const controlClass = isFlat
    ? cn(flatFieldClass, "absolute inset-0 box-border h-9 w-full max-w-full min-w-0")
    : "absolute inset-0 box-border h-9 w-full max-w-full min-w-0 rounded-md border border-stone-200 bg-white px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

  return (
    <div className={cn("relative h-9 w-full max-w-full min-w-0", className)}>
      {customMode ? (
        <>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={customPlaceholder}
            className={cn(controlClass, "pr-11")}
          />
          <button
            type="button"
            onClick={() => {
              setCustomMode(false);
              onChange("");
            }}
            className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded px-1.5 text-xs text-stone-400 hover:bg-stone-100 hover:text-stone-600"
            title="กลับไปเลือกจากรายการ"
          >
            เลือก
          </button>
        </>
      ) : (
        <select
          value={value}
          onChange={(e) => {
            if (e.target.value === CUSTOM_VALUE) {
              setCustomMode(true);
              onChange("");
              return;
            }
            onChange(e.target.value);
          }}
          className={controlClass}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
          <option value={CUSTOM_VALUE}>{customOptionLabel}</option>
        </select>
      )}
    </div>
  );
}
