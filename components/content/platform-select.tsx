"use client";

import { PLATFORMS } from "@/lib/constants";
import type { Platform } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";

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
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-stone-700">แพลตฟอร์ม</span>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {PLATFORMS.map((p) => (
          <Checkbox
            key={p.id}
            label={p.label}
            checked={selected.includes(p.id)}
            onChange={() => toggle(p.id)}
          />
        ))}
      </div>
    </div>
  );
}
