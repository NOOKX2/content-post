"use client";

import { PLATFORMS } from "@/lib/constants";
import type { Platform } from "@/lib/types";
import { PlatformLogo } from "@/components/ui/PlatformLogo";
import { cn } from "@/lib/shared/utils";

interface PlatformSelectProps {
  selected: Platform[];
  onChange: (platforms: Platform[]) => void;
  availablePlatforms: Platform[];
  disabled?: boolean;
  locked?: boolean;
}

export function PlatformSelect({
  selected,
  onChange,
  availablePlatforms,
  disabled = false,
  locked = false,
}: PlatformSelectProps) {
  const toggle = (platform: Platform) => {
    if (disabled || locked || !availablePlatforms.includes(platform)) return;
    if (selected.includes(platform)) {
      onChange(selected.filter((p) => p !== platform));
    } else {
      onChange([...selected, platform]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-stone-700">แพลตฟอร์ม</span>
      {locked && selected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((platform) => {
            const meta = PLATFORMS.find((item) => item.id === platform);
            return (
              <span
                key={platform}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800"
              >
                <PlatformLogo platform={platform} size={20} />
                <span>{meta?.label ?? platform}</span>
              </span>
            );
          })}
        </div>
      ) : availablePlatforms.length === 0 ? (
        <p className="text-sm text-stone-500">
          {disabled
            ? "เลือกช่องที่ลงก่อน"
            : "ช่องนี้ยังไม่มีใน Buffer — ตรวจสอบการเชื่อมต่อ Buffer"}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.filter((p) => availablePlatforms.includes(p.id)).map(
            (p) => {
              const isSelected = selected.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={disabled || locked}
                  onClick={() => toggle(p.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                    isSelected
                      ? "border-blue-500 bg-blue-50 text-blue-800"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50",
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  <PlatformLogo platform={p.id} size={20} />
                  <span>{p.label}</span>
                </button>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}
