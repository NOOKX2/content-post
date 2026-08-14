"use client";

import { ImageIcon, Palette, Video } from "lucide-react";
import type { ContentItem, MediaType } from "@/lib/types";
import { PlatformBadgeGroup } from "@/components/ui/PlatformIcon";
import { getPostStatusDotClass } from "@/lib/calendar/domain/filters";
import { cn } from "@/lib/shared/utils";
import { useT } from "@/lib/i18n";

function mediaTypeIcon(mediaType: MediaType) {
  if (mediaType === "video") return Video;
  if (mediaType === "graphic") return Palette;
  return ImageIcon;
}

function mediaTypeIconClass(mediaType: MediaType) {
  if (mediaType === "video") return "text-orange-600";
  if (mediaType === "graphic") return "text-pink-600";
  return "text-emerald-600";
}

export function ContentSummaryCard({
  content,
  compact = false,
  className,
}: {
  content: ContentItem;
  compact?: boolean;
  className?: string;
}) {
  const { t } = useT();
  const Icon = mediaTypeIcon(content.mediaType);
  const typeLabel =
    content.mediaType === "video"
      ? t("media.video")
      : content.mediaType === "graphic"
        ? t("media.graphic")
        : t("media.image");

  return (
    <div className={cn("min-w-0 text-left", className)}>
      <div className="flex items-center gap-1">
        <Icon
          className={cn(
            "shrink-0",
            compact ? "h-3 w-3" : "h-3.5 w-3.5",
            mediaTypeIconClass(content.mediaType)
          )}
        />
        <span
          className={cn(
            "truncate font-medium",
            compact ? "text-[10px]" : "text-xs",
            mediaTypeIconClass(content.mediaType)
          )}
        >
          {typeLabel}
        </span>
      </div>
      <p
        className={cn(
          "mt-0.5 font-bold leading-snug text-stone-900",
          compact ? "line-clamp-2 text-[11px]" : "line-clamp-2 text-sm"
        )}
      >
        {content.name}
      </p>
      <p
        className={cn(
          "mt-0.5 truncate font-mono text-stone-400",
          compact ? "text-[10px]" : "text-xs"
        )}
      >
        #{content.contentId}
      </p>
      <div className="mt-1 flex items-center gap-1.5">
        <span
          className={cn(
            "shrink-0 rounded-full",
            compact ? "h-1.5 w-1.5" : "h-2 w-2",
            getPostStatusDotClass(content.status)
          )}
          title={t("calendar.statusLabel")}
        />
        {content.platforms.length > 0 ? (
          <PlatformBadgeGroup platforms={content.platforms} size="sm" />
        ) : null}
      </div>
    </div>
  );
}
