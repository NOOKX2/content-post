"use client";

import { Video, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaType } from "@/lib/types";

interface MediaTypeToggleProps {
  value: MediaType;
  onChange: (value: MediaType) => void;
}

export function MediaTypeToggle({ value, onChange }: MediaTypeToggleProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange("video")}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 text-sm font-medium transition-all",
          value === "video"
            ? "border-blue-500 bg-blue-50 text-blue-700"
            : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"
        )}
      >
        <Video className="h-5 w-5" />
        Video
      </button>
      <button
        type="button"
        onClick={() => onChange("image")}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 text-sm font-medium transition-all",
          value === "image"
            ? "border-blue-500 bg-blue-50 text-blue-700"
            : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"
        )}
      >
        <ImageIcon className="h-5 w-5" />
        Picture / Post
      </button>
    </div>
  );
}
