"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { PlatformLogo } from "@/components/ui/PlatformLogo";
import { PLATFORMS } from "@/lib/constants";
import { flatFieldClass, flatLabelClass } from "@/lib/shared/form-field-styles";
import type { Platform } from "@/lib/types";
import { cn } from "@/lib/shared/utils";

export type PostingChannelOption = {
  value: string;
  label: string;
  platform?: Platform;
};

interface PostingChannelSelectProps {
  label?: string;
  options: PostingChannelOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  multiple?: boolean;
  variant?: "default" | "flat";
}

function ChannelOptionContent({
  option,
  showPlatformLabel = false,
  compact = false,
}: {
  option: PostingChannelOption;
  showPlatformLabel?: boolean;
  compact?: boolean;
}) {
  const platformMeta = option.platform
    ? PLATFORMS.find((item) => item.id === option.platform)
    : null;

  return (
    <span className="flex min-w-0 items-center gap-2">
      {option.platform ? (
        <PlatformLogo platform={option.platform} size={compact ? 16 : 20} />
      ) : (
        <span
          className={cn("shrink-0 rounded-md bg-stone-100", compact ? "h-4 w-4" : "h-5 w-5")}
          aria-hidden
        />
      )}
      <span className="min-w-0 truncate">
        <span className="text-stone-900">{option.label}</span>
        {showPlatformLabel && platformMeta && (
          <span className="text-stone-500"> · {platformMeta.label}</span>
        )}
      </span>
    </span>
  );
}

export function PostingChannelSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "เลือกช่อง...",
  required = false,
  hint,
  multiple = true,
  variant = "default",
}: PostingChannelSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedOptions = options.filter((option) => value.includes(option.value));
  const isFlat = variant === "flat";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectId = label?.replace(/\s/g, "-").toLowerCase();

  const toggleValue = (optionValue: string) => {
    if (multiple) {
      if (value.includes(optionValue)) {
        onChange(value.filter((item) => item !== optionValue));
      } else {
        onChange([...value, optionValue]);
      }
      return;
    }

    onChange([optionValue]);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className={cn(
            isFlat ? flatLabelClass : "text-sm font-medium text-stone-700"
          )}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <button
          id={selectId}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className={cn(
            isFlat
              ? cn(flatFieldClass, "flex min-h-10 items-center justify-between gap-2 py-2 text-left")
              : cn(
                  "flex min-h-10 w-full items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-left text-sm transition-colors",
                  "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                  open && "border-blue-500 ring-2 ring-blue-500/20"
                )
          )}
        >
          {selectedOptions.length > 0 ? (
            <span className="flex min-w-0 flex-1 flex-wrap gap-1.5">
              {selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className={cn(
                    "inline-flex max-w-full items-center gap-1.5 text-xs text-stone-900",
                    !isFlat && "rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-blue-900"
                  )}
                >
                  <ChannelOptionContent option={option} compact />
                </span>
              ))}
            </span>
          ) : (
            <span className="text-stone-400">{placeholder}</span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-stone-400 transition-transform",
              open && "rotate-180"
            )}
          />
        </button>

        {open && (
          <ul
            role="listbox"
            aria-label={label}
            aria-multiselectable={multiple}
            className="absolute top-full z-50 mt-1.5 max-h-64 w-full overflow-auto rounded-lg border border-stone-200 bg-white py-1 shadow-lg"
          >
            {options.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <li key={option.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => toggleValue(option.value)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-blue-50 text-blue-900"
                        : "text-stone-700 hover:bg-stone-50"
                    )}
                  >
                    <ChannelOptionContent option={option} showPlatformLabel />
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-blue-600" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {required && value.length === 0 && (
        <input
          tabIndex={-1}
          aria-hidden
          value=""
          required
          onChange={() => undefined}
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />
      )}

      {hint && <p className="text-xs text-stone-500">{hint}</p>}
    </div>
  );
}
