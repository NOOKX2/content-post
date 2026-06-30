"use client";

import type { ContentItem } from "@/lib/types";
import { PlatformBadgeGroup } from "@/components/ui/platform-icon";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ContentCardProps {
  content: ContentItem;
  compact?: boolean;
  onClick?: () => void;
}

export function ContentCard({ content, compact, onClick }: ContentCardProps) {
  const status = STATUS_LABELS[content.status];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border border-stone-200/80 bg-white p-2.5 text-left transition-all hover:border-blue-300 hover:shadow-sm",
        compact && "p-2"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-stone-800 line-clamp-1">
          {content.channel}
        </span>
        <PlatformBadgeGroup platforms={content.platforms} />
      </div>
      <p
        className={cn(
          "mt-1 font-medium text-stone-900 line-clamp-2",
          compact ? "text-xs" : "text-sm"
        )}
      >
        {content.name}
      </p>
      {!compact && (
        <p className="mt-0.5 text-xs text-stone-500 line-clamp-1">
          {content.category}
        </p>
      )}
      <div className="mt-2 flex items-center gap-2">
        <Badge className={status.color}>{status.label}</Badge>
        {content.scheduledTime && (
          <span className="text-xs text-stone-400">
            {content.scheduledTime}
          </span>
        )}
      </div>
    </button>
  );
}
