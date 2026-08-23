"use client";

import useSWR from "swr";
import { ChevronDown } from "lucide-react";
import { PLATFORMS } from "@/lib/constants";
import type { DashboardFilters, DashboardPeriod } from "@/lib/dashboard/types";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/shared/utils";
import { useT } from "@/lib/i18n";

const PERIOD_OPTIONS: { id: DashboardPeriod; labelKey: string }[] = [
  { id: "7d", labelKey: "dashboard.period7d" },
  { id: "30d", labelKey: "dashboard.period30d" },
  { id: "90d", labelKey: "dashboard.period90d" },
  { id: "year", labelKey: "dashboard.periodYear" },
];

interface DashboardFiltersBarProps {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
  showPlatform?: boolean;
  showMediaType?: boolean;
  showChannel?: boolean;
  showMember?: boolean;
  members?: { id: string; name: string }[];
  countLabel?: string;
}

export function DashboardFiltersBar({
  filters,
  onChange,
  showPlatform = true,
  showMediaType = true,
  showChannel = false,
  showMember = false,
  members = [],
  countLabel,
}: DashboardFiltersBarProps) {
  const { t } = useT();
  const { data: postingData } = useSWR("/api/posting-channels", (url: string) =>
    fetch(url).then((res) => res.json()) as Promise<{
      channels?: { slug: string; label: string }[];
      error?: string;
    }>
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      {postingData?.error && (
        <p className="w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
          {postingData.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-0.5 rounded-full border border-slate-200 bg-white p-1">
        {PERIOD_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange({ ...filters, period: option.id })}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
              filters.period === option.id
                ? "bg-[#5b5ef0] text-white shadow-sm shadow-[#5b5ef0]/20"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            {t(option.labelKey)}
          </button>
        ))}
      </div>

      {showChannel ? (
        <FilterSelect
          value={filters.channel ?? "all"}
          onChange={(value) =>
            onChange({
              ...filters,
              channel: value === "all" ? undefined : value,
            })
          }
        >
          <option value="all">{t("dashboard.allChannels")}</option>
          {(postingData?.channels ?? []).map((channel) => (
            <option key={channel.slug} value={channel.slug}>
              {channel.label}
            </option>
          ))}
        </FilterSelect>
      ) : null}

      {showPlatform ? (
        <FilterSelect
          value={filters.platform ?? "all"}
          onChange={(value) =>
            onChange({
              ...filters,
              platform:
                value === "all"
                  ? "all"
                  : (value as DashboardFilters["platform"]),
            })
          }
        >
          <option value="all">{t("dashboard.allPlatforms")}</option>
          {PLATFORMS.map((platform) => (
            <option key={platform.id} value={platform.id}>
              {platform.shortLabel}
            </option>
          ))}
        </FilterSelect>
      ) : null}

      {showMediaType ? (
        <FilterSelect
          value={filters.mediaType ?? "all"}
          onChange={(value) =>
            onChange({
              ...filters,
              mediaType:
                value === "all"
                  ? "all"
                  : (value as DashboardFilters["mediaType"]),
            })
          }
        >
          <option value="all">{t("dashboard.contentType")}</option>
          <option value="video">{t("dashboard.mediaVideo")}</option>
          <option value="image">{t("dashboard.mediaImage")}</option>
          <option value="graphic">{t("dashboard.mediaGraphic")}</option>
        </FilterSelect>
      ) : null}

      {showMember ? (
        <FilterSelect
          value={filters.memberId ?? "all"}
          onChange={(value) =>
            onChange({
              ...filters,
              memberId: value === "all" ? "all" : value,
            })
          }
        >
          <option value="all">{t("dashboard.allMembers")}</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </FilterSelect>
      ) : null}

      {filters.period === "custom" && (
        <>
          <Input
            type="date"
            value={filters.startDate ?? ""}
            onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
            className="h-10 w-[10.25rem] rounded-xl border-slate-200 text-sm"
          />
          <Input
            type="date"
            value={filters.endDate ?? ""}
            onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
            className="h-10 w-[10.25rem] rounded-xl border-slate-200 text-sm"
          />
        </>
      )}

      {countLabel ? (
        <span className="ml-auto inline-flex items-center rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-500">
          {countLabel}
        </span>
      ) : null}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 appearance-none rounded-xl border border-slate-200 bg-white py-2 pr-9 pl-3.5 text-sm font-medium text-slate-600 transition-colors focus:border-[#5b5ef0] focus:outline-none focus:ring-2 focus:ring-[#5b5ef0]/15"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
