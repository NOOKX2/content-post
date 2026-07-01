"use client";

import { PLATFORMS } from "@/lib/constants";
import type { Platform } from "@/lib/types";
import { PlatformLogo } from "@/components/ui/platform-logo";
import { cn } from "@/lib/utils";

interface PlatformSelectProps {
  selected: Platform[];
  onChange: (platforms: Platform[]) => void;
}

export function PlatformSelect({ selected, onChange }: PlatformSelectProps) {
  const toggle = (platform: Platform) => {
    if (selected.includes(platform)) {
      onChange(selected.filter((p) => p !== platform));
    } else {
      onChange([...selected, platform]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-stone-700">แพลตฟอร์ม</span>
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((p) => {
          const isSelected = selected.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              aria-pressed={isSelected}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                isSelected
                  ? "border-blue-500 bg-blue-50 text-blue-800"
                  : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
              )}
            >
              <PlatformLogo platform={p.id} size={20} />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
