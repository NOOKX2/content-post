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
  { type: "image", icon: ImageIcon },
  { type: "graphic", icon: Palette },
];

export function MediaTypeToggle({ value, onChange }: MediaTypeToggleProps) {
  return (
    <div className="grid grid-cols-3 border-b border-stone-200">
      {OPTIONS.map(({ type, icon: Icon }) => {
        const config = MEDIA_FORM_CONFIG[type];
        const isActive = value === type;

        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={cn(
              "flex flex-col items-center gap-1.5 border-b-2 px-2 py-3 text-sm font-semibold transition-colors sm:px-3",
              isActive
                ? cn("border-teal-600 text-teal-700", config.accentText)
                : "border-transparent text-stone-400 hover:text-stone-600"
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
