"use client";

import {
  Check,
  X,
  Video,
  ImageIcon,
  Calendar,
  MapPin,
  User,
} from "lucide-react";
import type { ContentItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PlatformBadgeGroup } from "@/components/ui/platform-icon";
import { STATUS_LABELS } from "@/lib/constants";
import { formatThaiDate, formatLocations } from "@/lib/utils";

interface ApprovalCardProps {
  content: ContentItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ApprovalCard({
  content,
  onApprove,
  onReject,
}: ApprovalCardProps) {
  const status = STATUS_LABELS[content.status];

  return (
    <Card className="transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-stone-100">
          {content.mediaType === "video" ? (
            <Video className="h-5 w-5 text-blue-600" />
          ) : (
            <ImageIcon className="h-5 w-5 text-blue-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-stone-400">
                  #{content.contentId}
                </span>
                <Badge className={status.color}>{status.label}</Badge>
              </div>
              <h3 className="mt-1 text-base font-semibold text-stone-900">
                {content.name}
              </h3>
              <p className="mt-0.5 text-sm text-stone-500">{content.channel}</p>
            </div>
            <PlatformBadgeGroup platforms={content.platforms} />
          </div>

          {content.details && (
            <p className="mt-3 text-sm text-stone-600 line-clamp-2">
              {content.details}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-4 text-xs text-stone-500">
            {content.scheduledDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatThaiDate(content.scheduledDate)}{" "}
                {content.scheduledTime && `• ${content.scheduledTime}`}
              </span>
            )}
            {content.location.length > 0 && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {formatLocations(content.location)}
              </span>
            )}
            {content.ideaCreator && (
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {content.ideaCreator}
              </span>
            )}
          </div>

          {content.status === "pending" && (
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                onClick={() => onApprove(content.id)}
              >
                <Check className="h-4 w-4" />
                อนุมัติ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject(content.id)}
              >
                <X className="h-4 w-4" />
                ไม่อนุมัติ
              </Button>
            </div>
          )}

          {content.status === "approved" && content.approver && (
            <p className="mt-3 text-xs text-blue-600">
              อนุมัติโดย {content.approver}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
