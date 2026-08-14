"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/shared/utils";

export type CreatableMultiSelectGroup = {
  label: string;
  options: readonly string[];
};

interface CreatableMultiSelectProps {
  label: string;
  options?: readonly string[];
  optionGroups?: readonly CreatableMultiSelectGroup[];
  value: string[];
  onChange: (value: string[]) => void;
  optional?: boolean;
  placeholder?: string;
  addPlaceholder?: string;
  className?: string;
}

export function CreatableMultiSelect({
  label,
  options = [],
  optionGroups,
  value,
  onChange,
  optional = false,
  placeholder = "เลือก...",
  addPlaceholder = "พิมพ์เพื่อเพิ่มเอง...",
  className,
}: CreatableMultiSelectProps) {
  const [customText, setCustomText] = useState("");

  const flatOptions = useMemo(() => {
    if (optionGroups?.length) {
      return optionGroups.flatMap((group) => group.options);
    }
    return options;
  }, [optionGroups, options]);

  const availableOptions = useMemo(
    () => flatOptions.filter((option) => !value.includes(option)),
    [flatOptions, value]
  );

  const availableGroups = useMemo(() => {
    if (!optionGroups?.length) return null;
    return optionGroups
      .map((group) => ({
        label: group.label,
        options: group.options.filter((option) => !value.includes(option)),
      }))
      .filter((group) => group.options.length > 0);
  }, [optionGroups, value]);

  const addValue = (next: string) => {
    const trimmed = next.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
  };

  const removeValue = (item: string) => {
    onChange(value.filter((current) => current !== item));
  };

  const handleAddCustom = () => {
    addValue(customText);
    setCustomText("");
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="text-sm font-medium text-stone-700">
        {label}
        {optional && (
          <span className="ml-1 font-normal text-stone-400">(ไม่บังคับ)</span>
        )}
      </span>

      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) addValue(e.target.value);
          }}
          className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">{placeholder}</option>
          {availableGroups
            ? availableGroups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </optgroup>
              ))
            : availableOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
        </select>

        <div className="flex w-full gap-2">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustom();
              }
            }}
            placeholder={addPlaceholder}
            className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddCustom}
            disabled={!customText.trim()}
            className="h-10 shrink-0 px-3"
          >
            <Plus className="h-4 w-4" />
            เพิ่ม
          </Button>
        </div>
      </div>

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700"
            >
              {item}
              <button
                type="button"
                onClick={() => removeValue(item)}
                className="rounded-full p-0.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
                aria-label={`ลบ ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-stone-400">ยังไม่ได้เลือก</p>
      )}
    </div>
  );
}
