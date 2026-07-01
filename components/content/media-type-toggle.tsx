"use client";

import { Video, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaType } from "@/lib/types";
import { MEDIA_FORM_CONFIG } from "@/lib/content/form-config";

interface MediaTypeToggleProps {
  value: MediaType;
  onChange: (value: MediaType) => void;
}

export function MediaTypeToggle({ value, onChange }: MediaTypeToggleProps) {
  const options: { type: MediaType; icon: typeof Video }[] = [
    { type: "video", icon: Video },
    { type: "image", icon: ImageIcon },
  ];

  return (
    <div className="flex gap-2">
      {options.map(({ type, icon: Icon }) => {
        const config = MEDIA_FORM_CONFIG[type];
        const isActive = value === type;

        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 text-sm font-semibold transition-all",
              isActive
                ? cn(config.accentBorder, config.accentBg, config.accentText)
                : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"
            )}
          >
            <Icon className="h-5 w-5" />
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
