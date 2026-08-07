import { memo } from "react";
import { Badge } from "@/components/ui/Badge";
import { STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/shared/utils";
import type { ContentStatus } from "@/lib/types";

type ContentStatusBadgeProps = {
  status: ContentStatus;
  className?: string;
};

export const ContentStatusBadge = memo(function ContentStatusBadge({
  status,
  className,
}: ContentStatusBadgeProps) {
  const config = STATUS_LABELS[status];

  return (
    <Badge className={cn(config.color, className)}>{config.label}</Badge>
  );
});
