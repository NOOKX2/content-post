"use client";

import { Video, ImageIcon, Palette } from "lucide-react";
import { cn } from "@/lib/shared/utils";
import type { MediaType } from "@/lib/types";
import { MEDIA_FORM_CONFIG } from "@/lib/content/domain/form-config";

interface MediaTypeToggleProps {
  value: MediaType;
  onChange: (value: MediaType) => void;
}

const OPTIONS: { type: MediaType; icon: typeof Video }[] = [
  { type: "video", icon: Video },
  { type: "graphic", icon: Palette },
  { type: "image", icon: ImageIcon },
];

export function MediaTypeToggle({ value, onChange }: MediaTypeToggleProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map(({ type, icon: Icon }) => {
        const config = MEDIA_FORM_CONFIG[type];
        const isActive = value === type;

        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl border-2 px-2 py-3 text-sm font-semibold transition-all sm:px-3",
              isActive
                ? cn(config.accentBorder, config.accentBg, config.accentText)
                : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
