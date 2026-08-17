"use client";

import { useEffect } from "react";
import { DashboardLink } from "@/components/layout/DashboardLink";
import { CalendarDays, CheckCircle2, Plus } from "lucide-react";
import type { ContentItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PlatformBadgeGroup } from "@/components/ui/PlatformIcon";
import { STATUS_LABELS } from "@/lib/constants";
import { formatLocations } from "@/lib/shared/utils";
import {
  formatLocalizedDate,
  statusLabel,
  useT,
} from "@/lib/i18n";

interface SubmitSuccessProps {
  content: ContentItem;
  onCreateAnother: () => void;
}

export function SubmitSuccess({ content, onCreateAnother }: SubmitSuccessProps) {
  const { t, locale } = useT();
  const status = STATUS_LABELS[content.status];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="mx-auto max-w-xl space-y-6 py-4">
      <div className="rounded-2xl border border-blue-200 bg-linear-to-b from-blue-50 to-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
          <CheckCircle2 className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-stone-900">
          {content.mediaType === "video" && content.status === "pending"
            ? t("create.ideaSubmitted")
            : t("create.submitted")}
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          {content.mediaType === "video" && content.status === "pending"
            ? t("workflow.successIdea")
            : t("create.submittedSaved")}
        </p>
        <Badge className={`mt-4 ${status.color}`}>
          {statusLabel(t, content.status)}
        </Badge>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
          {t("create.summary")}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-stone-900">{content.name}</h3>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-stone-500">{t("create.contentId")}</dt>
            <dd className="font-mono font-medium text-stone-800">#{content.contentId}</dd>
          </div>
          {content.channel && (
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">{t("create.channels")}</dt>
              <dd className="text-stone-800">{content.channel}</dd>
            </div>
          )}
          {content.scheduledDate && (
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500">{t("create.datetime")}</dt>
              <dd className="text-stone-800">
                {formatLocalizedDate(content.scheduledDate, locale)}
                {content.scheduledTime ? ` • ${content.scheduledTime}` : ""}
              </dd>
            </div>
          )}
          {content.location.length > 0 && (
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-stone-500">{t("create.location")}</dt>
              <dd className="text-right text-stone-800">
                {formatLocations(content.location)}
              </dd>
            </div>
          )}
          {content.platforms.length > 0 && (
            <div className="flex items-center justify-between gap-4 pt-1">
              <dt className="text-stone-500">{t("create.platforms")}</dt>
              <dd>
                <PlatformBadgeGroup platforms={content.platforms} />
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button size="lg" onClick={onCreateAnother}>
          <Plus className="h-4 w-4" />
          {t("create.createAnother")}
        </Button>
        <DashboardLink href="/calendar">
          <Button size="lg" variant="secondary" className="w-full sm:w-auto">
            <CalendarDays className="h-4 w-4" />
            {t("create.viewCalendar")}
          </Button>
        </DashboardLink>
      </div>
    </div>
  );
}
