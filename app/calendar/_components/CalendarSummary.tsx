"use client";

import { Card } from "@/components/ui/Card";
import { useT } from "@/lib/i18n";

interface CalendarSummaryProps {
  total: number;
  waiting: number;
  posted: number;
  needsEdit: number;
}

export function CalendarSummary({
  total,
  waiting,
  posted,
  needsEdit,
}: CalendarSummaryProps) {
  const { t } = useT();

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-stone-800">
        {t("calendar.summaryTitle")}
      </h3>
      <p className="mt-1 text-xs text-stone-500">{t("calendar.summaryHint")}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryStat label={t("calendar.allJobs")} value={total} />
        <SummaryStat
          label={t("calendar.waitingPost")}
          value={waiting}
          dotClass="bg-orange-500"
        />
        <SummaryStat
          label={t("calendar.postedContent")}
          value={posted}
          dotClass="bg-emerald-500"
        />
        <SummaryStat
          label={t("calendar.needsEditContent")}
          value={needsEdit}
          dotClass="bg-red-500"
        />
      </div>
    </Card>
  );
}

function SummaryStat({
  label,
  value,
  dotClass,
}: {
  label: string;
  value: number;
  dotClass?: string;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
      <div className="flex items-center gap-2">
        {dotClass && (
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`} />
        )}
        <p className="text-xs text-stone-500">{label}</p>
      </div>
      <p className="mt-1 text-2xl font-bold text-stone-900">{value}</p>
    </div>
  );
}
