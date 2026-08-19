"use client";

import { Video } from "lucide-react";
import { cn } from "@/lib/shared/utils";
import { PlatformLogo } from "@/components/ui/PlatformLogo";
import { PlatformBadgeGroup } from "@/components/ui/PlatformIcon";
import { PLATFORMS } from "@/lib/constants";
import { useT } from "@/lib/i18n";

export function CalendarLegendBar({ className }: { className?: string }) {
  const { t } = useT();

  return (
    <div className={cn("border-y border-stone-200", className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4 sm:px-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-xs font-bold text-stone-900">
            {t("calendar.statusLabel")}
          </span>
          <LegendItem color="bg-orange-500" label={t("calendar.waiting")} />
          <LegendItem color="bg-emerald-500" label={t("calendar.posted")} />
          <LegendItem color="bg-red-500" label={t("calendar.needsEdit")} />
          <span className="inline-flex items-center gap-1.5 text-xs text-stone-500">
            <Video className="h-3.5 w-3.5 text-emerald-600" />
            {t("calendar.meetingLegend")}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-stone-900">
            {t("calendar.channelsLabel")}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {PLATFORMS.map((platform) => (
              <PlatformLogo
                key={platform.id}
                platform={platform.id}
                size={20}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CalendarPostLegend({ className }: { className?: string }) {
  const { t } = useT();

  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      <span className="text-xs font-medium text-stone-500">
        {t("calendar.statusLabel")}:
      </span>
      <LegendItem color="bg-orange-500" label={t("calendar.waitingPost")} />
      <LegendItem color="bg-emerald-500" label={t("calendar.postedContent")} />
      <LegendItem color="bg-red-500" label={t("calendar.needsEditContent")} />
      <span className="inline-flex items-center gap-1.5 text-xs text-stone-600">
        <span className="h-2.5 w-2.5 rounded-full border-2 border-blue-500 bg-white" />
        {t("calendar.meetingLegend")}
      </span>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-stone-600">
      <span className={cn("h-2.5 w-2.5 rounded-full", color)} />
      {label}
    </span>
  );
}

export function CalendarChannelsLegend({ className }: { className?: string }) {
  const { t } = useT();

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <span className="text-xs font-medium text-stone-500">
        {t("calendar.channelsLabel")}:
      </span>
      {PLATFORMS.map((platform) => (
        <span
          key={platform.id}
          className="inline-flex items-center gap-1.5 text-xs text-stone-600"
        >
          <PlatformBadgeGroup platforms={[platform.id]} size="sm" />
          {platform.shortLabel}
        </span>
      ))}
    </div>
  );
}
