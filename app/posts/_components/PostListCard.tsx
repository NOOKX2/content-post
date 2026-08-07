"use client";

import { ImageIcon, MoreVertical, Video } from "lucide-react";
import { DashboardLink } from "@/components/layout/DashboardLink";
import { ContentStatusBadge } from "@/app/posts/_components/ContentStatusBadge";
import { PlatformBadgeGroup } from "@/components/ui/PlatformIcon";
import { MEDIA_FORM_CONFIG } from "@/lib/content/domain/form-config";
import {
  getContentThumbnailUrl,
  getCreateResumeHref,
  needsCreatorAction,
} from "@/lib/content/domain/workflow";
import type { ContentItem } from "@/lib/types";
import { cn, formatThaiDateTime } from "@/lib/shared/utils";

interface PostListCardProps {
  content: ContentItem;
}

function formatPostTimestamp(iso: string): string {
  return formatThaiDateTime(iso).replace(",", " -");
}

export function PostListCard({ content }: PostListCardProps) {
  const media = MEDIA_FORM_CONFIG[content.mediaType];
  const href = needsCreatorAction(content)
    ? getCreateResumeHref(content.id)
    : `/content/${content.id}`;
  const thumbnail = getContentThumbnailUrl(content);
  const timestamp = content.createdAt
    ? formatPostTimestamp(content.createdAt)
    : null;

  return (
    <DashboardLink href={href} className="block">
      <article className="rounded-xl border border-stone-200 bg-white px-4 py-4 transition-shadow hover:border-blue-200 hover:shadow-md">
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-stone-100 bg-stone-100">
            {thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnail}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className={cn(
                  "flex h-full w-full items-center justify-center",
                  media.accentBg
                )}
              >
                {content.mediaType === "video" ? (
                  <Video className={cn("h-5 w-5", media.accentText)} />
                ) : (
                  <ImageIcon className={cn("h-5 w-5", media.accentText)} />
                )}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <ContentStatusBadge status={content.status} />
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  media.accentBg,
                  media.accentText
                )}
              >
                {media.label}
              </span>
            </div>

            <h3 className="mt-2 truncate text-base font-semibold text-stone-900">
              <span className="font-mono text-sm font-normal text-stone-400">
                #{content.contentId}
              </span>{" "}
              {content.name}
            </h3>

            <p className="mt-1 text-sm text-stone-500">
              {content.ideaCreator || content.channel}
            </p>

            {timestamp && (
              <p className="mt-1 text-xs text-stone-400">{timestamp}</p>
            )}

            {content.status === "post_failed" && content.postError && (
              <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {content.postError}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-start gap-2">
            <PlatformBadgeGroup platforms={content.platforms} />
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-stone-400">
              <MoreVertical className="h-4 w-4" />
            </span>
          </div>
        </div>
      </article>
    </DashboardLink>
  );
}
