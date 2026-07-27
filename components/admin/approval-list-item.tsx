"use client";

import { ImageIcon, Video } from "lucide-react";
import {
  getAdminListRoundLabel,
  getContentThumbnailUrl,
  type AdminApprovalStage,
} from "@/lib/content/content-workflow";
import type { ContentItem } from "@/lib/types";
import { cn, formatThaiDate, formatThaiDateTime } from "@/lib/utils";

interface ApprovalListItemProps {
  content: ContentItem;
  stage: AdminApprovalStage;
  selected: boolean;
  onSelect: () => void;
}

export function ApprovalListItem({
  content,
  stage,
  selected,
  onSelect,
}: ApprovalListItemProps) {
  const thumbnail = getContentThumbnailUrl(content);
  const roundLabel = getAdminListRoundLabel(content, stage);
  const timestamp = content.createdAt
    ? formatThaiDateTime(content.createdAt)
    : content.scheduledDate
      ? `${formatThaiDate(content.scheduledDate)}${content.scheduledTime ? ` • ${content.scheduledTime}` : ""}`
      : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full gap-3 border-b border-stone-100 px-4 py-3 text-left transition-colors",
        selected
          ? "border-l-4 border-l-blue-600 bg-blue-50/60"
          : "border-l-4 border-l-transparent hover:bg-stone-50"
      )}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-400">
            {content.mediaType === "video" ? (
              <Video className="h-5 w-5" />
            ) : (
              <ImageIcon className="h-5 w-5" />
            )}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-stone-900">
          {content.name}
        </p>
        <p className="mt-0.5 truncate text-xs text-stone-500">
          {content.ideaCreator || content.channel}
        </p>
        {roundLabel && (
          <span className="mt-1.5 inline-flex rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-medium text-stone-700">
            {roundLabel}
          </span>
        )}
        {timestamp && (
          <p className="mt-1.5 text-[11px] text-stone-400">{timestamp}</p>
        )}
      </div>
    </button>
  );
}
