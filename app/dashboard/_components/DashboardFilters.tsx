"use client";

import useSWR from "swr";
import { PLATFORMS } from "@/lib/constants";
import type { DashboardFilters, DashboardPeriod } from "@/lib/dashboard/types";
import { getDateRangeForPeriod } from "@/lib/dashboard/domain/filters";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { cn } from "@/lib/shared/utils";

const PERIOD_TABS: { id: DashboardPeriod; label: string }[] = [
  { id: "day", label: "วัน" },
  { id: "month", label: "เดือน" },
  { id: "year", label: "ปี" },
  { id: "custom", label: "กำหนดเอง" },
];

interface DashboardFiltersBarProps {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
  showPlatform?: boolean;
  showMediaType?: boolean;
}

export function DashboardFiltersBar({
  filters,
  onChange,
  showPlatform = true,
  showMediaType = true,
}: DashboardFiltersBarProps) {
  const { data: postingData } = useSWR("/api/posting-channels", (url: string) =>
    fetch(url).then((res) => res.json())
  );
  const range = getDateRangeForPeriod(
    filters.period,
    filters.startDate,
    filters.endDate
  );

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-3 border-b border-stone-200/80 pb-3 sm:gap-y-2 sm:pb-2">
      <InlineFilter label="ช่อง">
        <NativeSelect
          className="w-[8.25rem]"
          value={filters.channel ?? "all"}
          onChange={(e) =>
            onChange({
              ...filters,
              channel: e.target.value === "all" ? undefined : e.target.value,
            })
          }
        >
          <option value="all">ทุกช่อง</option>
          {(postingData?.channels ?? []).map(
            (channel: { slug: string; label: string }) => (
              <option key={channel.slug} value={channel.slug}>
                {channel.label}
              </option>
            )
          )}
        </NativeSelect>
      </InlineFilter>

      {showPlatform && (
        <InlineFilter label="แพลตฟอร์ม">
          <NativeSelect
            className="w-[7.5rem]"
            value={filters.platform ?? "all"}
            onChange={(e) =>
              onChange({
                ...filters,
                platform:
                  e.target.value === "all"
                    ? "all"
                    : (e.target.value as DashboardFilters["platform"]),
              })
            }
          >
            <option value="all">ทั้งหมด</option>
            {PLATFORMS.map((platform) => (
              <option key={platform.id} value={platform.id}>
                {platform.shortLabel}
              </option>
            ))}
          </NativeSelect>
        </InlineFilter>
      )}

      {showMediaType && (
        <InlineFilter label="ประเภท">
          <NativeSelect
            className="w-[6.5rem]"
            value={filters.mediaType ?? "all"}
            onChange={(e) =>
              onChange({
                ...filters,
                mediaType:
                  e.target.value === "all"
                    ? "all"
                    : (e.target.value as DashboardFilters["mediaType"]),
              })
            }
          >
            <option value="all">ทั้งหมด</option>
            <option value="video">วิดีโอ</option>
            <option value="image">รูป</option>
          </NativeSelect>
        </InlineFilter>
      )}

      {filters.period === "custom" && (
        <>
          <InlineFilter label="เริ่ม">
            <Input
              type="date"
              value={filters.startDate ?? ""}
              onChange={(e) =>
                onChange({ ...filters, startDate: e.target.value })
              }
              className="h-8 w-[10.25rem] text-xs"
            />
          </InlineFilter>
          <InlineFilter label="สิ้นสุด">
            <Input
              type="date"
              value={filters.endDate ?? ""}
              onChange={(e) =>
                onChange({ ...filters, endDate: e.target.value })
              }
              className="h-8 w-[10.25rem] text-xs"
            />
          </InlineFilter>
        </>
      )}

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <span className="hidden text-[11px] text-stone-400 sm:inline">
          {range.start} – {range.end}
        </span>
        <Tabs
          tabs={PERIOD_TABS}
          activeTab={filters.period}
          onChange={(period) =>
            onChange({ ...filters, period: period as DashboardPeriod })
          }
          compact
        />
      </div>
    </div>
  );
}

function InlineFilter({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="shrink-0 text-[11px] font-medium text-stone-500">
        {label}
      </span>
      {children}
    </div>
  );
}

function NativeSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-8 rounded-md border border-stone-200 bg-white px-2 text-xs text-stone-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
