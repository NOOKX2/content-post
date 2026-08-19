"use client";

import { useT } from "@/lib/i18n";
import { cn } from "@/lib/shared/utils";

interface CalendarSummaryProps {
  total: number;
  waiting: number;
  posted: number;
  needsEdit: number;
  monthLabel: string;
  className?: string;
}

export function CalendarSummary({
  total,
  waiting,
  posted,
  needsEdit,
  monthLabel,
  className,
}: CalendarSummaryProps) {
  const { t } = useT();

  const stats = [
    {
      label: t("calendar.allJobs"),
      value: total,
      dotClass: "bg-stone-400",
    },
    {
      label: t("calendar.summaryWaiting"),
      value: waiting,
      dotClass: "bg-orange-500",
    },
    {
      label: t("calendar.summaryPosted"),
      value: posted,
      dotClass: "bg-emerald-500",
    },
    {
      label: t("calendar.needsEdit"),
      value: needsEdit,
      dotClass: "bg-red-500",
    },
  ];

  return (
    <div className={cn(className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4">
        <div>
          <h3 className="text-base font-bold text-stone-900">
            {t("calendar.summaryThisMonth")}
          </h3>
          <p className="mt-0.5 text-xs text-stone-500">
            {t("calendar.summaryOverview")}
          </p>
        </div>
        <p className="text-xs font-semibold tracking-[0.14em] text-stone-400 uppercase">
          {monthLabel}
        </p>
      </div>

      <div className="grid grid-cols-2 border-y border-stone-200 sm:grid-cols-4">
        {stats.map((stat, index) => (
          <SummaryStat
            key={stat.label}
            index={index}
            total={stats.length}
            label={stat.label}
            value={stat.value}
            dotClass={stat.dotClass}
          />
        ))}
      </div>
    </div>
  );
}

function SummaryStat({
  index,
  total,
  label,
  value,
  dotClass,
}: {
  index: number;
  total: number;
  label: string;
  value: number;
  dotClass: string;
}) {
  const isLastColumnMobile = index % 2 === 1;
  const isLastColumnDesktop = index === total - 1;
  const isFirstRowMobile = index < 2;

  return (
    <div
      className={cn(
        "px-4 py-4",
        !isLastColumnMobile && "border-r border-stone-200 sm:border-r-0",
        !isLastColumnDesktop && "sm:border-r sm:border-stone-200",
        isFirstRowMobile && "border-b border-stone-200 sm:border-b-0"
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", dotClass)} />
        <p className="text-xs text-stone-500">{label}</p>
      </div>
      <p className="mt-2 text-3xl font-bold text-stone-900">{value}</p>
    </div>
  );
}
