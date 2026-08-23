"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  Activity,
  BarChart3,
  Layers,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { DashboardChartCard } from "@/app/dashboard/_components/DashboardChartCard";
import { DashboardFiltersBar } from "@/app/dashboard/_components/DashboardFilters";
import { KpiCard } from "@/app/dashboard/_components/KpiCard";
import {
  SimpleAreaChart,
  SimpleDonutChart,
  SimpleGroupedBarChart,
} from "@/app/dashboard/_components/SimpleCharts";
import { getDateRangeForPeriod } from "@/lib/dashboard/domain/filters";
import type { DashboardFilters, SocialAnalyticsResponse } from "@/lib/dashboard/types";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/shared/utils";

function buildSocialKey(filters: DashboardFilters) {
  const range = getDateRangeForPeriod(
    filters.period,
    filters.startDate,
    filters.endDate
  );
  const params = new URLSearchParams({
    period: filters.period,
    startDate: range.start,
    endDate: range.end,
    platform: filters.platform ?? "all",
  });
  return `/api/dashboard/social?${params.toString()}`;
}

async function fetchSocialAnalytics(url: string): Promise<SocialAnalyticsResponse> {
  const res = await fetch(url);
  const data = (await res.json().catch(() => null)) as
    | SocialAnalyticsResponse
    | { error?: string }
    | null;

  if (data && "error" in data && data.error) {
    return data as SocialAnalyticsResponse;
  }

  if (!res.ok || !data) {
    throw new Error(
      (data && "error" in data && data.error) ||
        `โหลดข้อมูลไม่สำเร็จ (HTTP ${res.status})`
    );
  }

  return data as SocialAnalyticsResponse;
}

function truncateText(text: string, max = 42) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max)}...`;
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString("th-TH");
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#EC4899",
  tiktok: "#111827",
  facebook: "#3B82F6",
  youtube: "#EF4444",
  twitter: "#22D3EE",
  x: "#22D3EE",
  linkedin: "#0EA5E9",
};

export function SocialAnalyticsPanel() {
  const { t } = useT();
  const [filters, setFilters] = useState<DashboardFilters>({
    period: "30d",
    platform: "all",
    mediaType: "all",
  });

  const swrKey = useMemo(() => buildSocialKey(filters), [filters]);
  const { data, isLoading, error } = useSWR(swrKey, fetchSocialAnalytics, {
    revalidateOnFocus: false,
  });

  const postCount = data?.summary.postCount ?? 0;
  const platformSlices = (data?.platformBreakdown ?? []).map((slice) => {
    const key = slice.label.toLowerCase();
    return {
      ...slice,
      color: PLATFORM_COLORS[key] ?? slice.color,
    };
  });

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pb-3">
      <DashboardFiltersBar
        filters={filters}
        onChange={setFilters}
        showMediaType
        showPlatform
        showChannel={false}
        countLabel={t("dashboard.postCount", { count: postCount })}
      />

      {(error || data?.error) && (
        <div className="shrink-0 space-y-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] text-amber-900">
          <p className="font-medium">
            {data?.error ||
              (error instanceof Error ? error.message : t("dashboard.loadFailed"))}
          </p>
          {data?.debug && (
            <div className="space-y-0.5 font-mono text-[10px] text-amber-800/90">
              {data.debug.organizationId && (
                <p>org: {data.debug.organizationId}</p>
              )}
              {data.debug.mappedChannelIds.length > 0 && (
                <p>mapped: {data.debug.mappedChannelIds.join(", ")}</p>
              )}
              {data.debug.missingFromBuffer.length > 0 && (
                <p>
                  missingFromBuffer: {data.debug.missingFromBuffer.join(", ")}
                </p>
              )}
              {data.debug.postsAccessDenied.length > 0 && (
                <p>
                  postsAccessDenied: {data.debug.postsAccessDenied.join(", ")}
                </p>
              )}
              {data.debug.rateLimited && <p>rateLimited: true</p>}
              {data.debug.bufferMessage && (
                <p>buffer: {data.debug.bufferMessage}</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          label={t("dashboard.reach")}
          value={data?.summary.reach ?? 0}
          hint={t("dashboard.allPostsTotal")}
          change="+18%"
          changeTone="up"
          valueClassName="text-[#4F46E5]"
        />
        <KpiCard
          label={t("dashboard.views")}
          value={data?.summary.views ?? 0}
          hint={t("dashboard.allPostsTotal")}
          change="+23%"
          changeTone="up"
          valueClassName="text-[#E11D8A]"
        />
        <KpiCard
          label={t("dashboard.engagementRate")}
          value={(data?.summary.engagementRate ?? 0).toFixed(1)}
          suffix="%"
          hint={t("dashboard.avgPerPost")}
          change="+5%"
          changeTone="up"
          valueClassName="text-[#F59E0B]"
        />
        <KpiCard
          label={t("dashboard.ctr")}
          value={(data?.summary.ctr ?? 0).toFixed(1)}
          suffix="%"
          hint={t("dashboard.avgPerPost")}
          change="-0.3%"
          changeTone="down"
          valueClassName="text-[#14B8A6]"
        />
      </div>

      <div className="grid shrink-0 grid-cols-1 items-stretch gap-4 xl:grid-cols-2">
        <DashboardChartCard
          className="h-[290px]"
          bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
          title={t("dashboard.compareReachTitle")}
          description={t("dashboard.compareReachHint")}
          icon={BarChart3}
        >
          {isLoading ? (
            <LoadingChart />
          ) : (data?.comparison ?? []).length === 0 ? (
            <Empty />
          ) : (
            <SimpleGroupedBarChart
              data={(data?.comparison ?? []).map((item) => ({
                label: item.label,
                reach: item.reach,
                views: item.views,
              }))}
              labelKey="label"
              series={[
                { key: "reach", color: "#6366F1", label: t("dashboard.reach") },
                { key: "views", color: "#C7D2FE", label: t("dashboard.views") },
              ]}
              height={160}
            />
          )}
        </DashboardChartCard>

        <DashboardChartCard
          className="h-[290px]"
          bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
          title={t("dashboard.platformShare")}
          description={t("dashboard.platformShareHint")}
          icon={Layers}
        >
          {isLoading ? (
            <LoadingChart />
          ) : platformSlices.length === 0 ? (
            <Empty />
          ) : (
            <SimpleDonutChart
              legendBelow
              formatValue={formatCompact}
              slices={platformSlices}
              size={140}
            />
          )}
        </DashboardChartCard>

        <DashboardChartCard
          className="h-[290px]"
          bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
          title={t("dashboard.reachEngagementTrend")}
          description={t("dashboard.reachEngagementTrendHint")}
          icon={Activity}
        >
          {isLoading ? (
            <LoadingChart />
          ) : (data?.trend ?? []).length === 0 ? (
            <Empty />
          ) : (
            <SimpleAreaChart
              fillKey="reach"
              data={(data?.trend ?? []).map((point) => ({
                label: formatTrendLabel(point.date),
                engagement: point.engagement,
                reach: point.reach,
              }))}
              lines={[
                { key: "reach", color: "#3B82F6", label: t("dashboard.reach") },
                {
                  key: "engagement",
                  color: "#EC4899",
                  label: t("dashboard.engagementPercent"),
                },
              ]}
              height={140}
            />
          )}
        </DashboardChartCard>

        <DashboardChartCard
          className="h-[290px]"
          bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
          title={t("dashboard.postRankings")}
        >
          {isLoading ? (
            <LoadingChart />
          ) : (
            <div className="flex h-full flex-col">
              <PostRankSection
                title={t("dashboard.popularPosts")}
                icon={TrendingUp}
                iconClassName="text-emerald-500"
                posts={data?.popularPosts ?? []}
                variant="popular"
              />
              <div className="my-3 border-t border-slate-100" />
              <PostRankSection
                title={t("dashboard.improvePosts")}
                icon={TrendingDown}
                iconClassName="text-rose-500"
                posts={data?.unpopularPosts ?? []}
                variant="unpopular"
              />
            </div>
          )}
        </DashboardChartCard>
      </div>
    </div>
  );
}

function PostRankSection({
  title,
  icon: Icon,
  iconClassName,
  posts,
  variant,
}: {
  title: string;
  icon: typeof TrendingUp;
  iconClassName?: string;
  posts: SocialAnalyticsResponse["popularPosts"];
  variant: "popular" | "unpopular";
}) {
  const { t } = useT();
  return (
    <div>
      <div className="mb-2.5 flex items-center gap-1.5">
        <Icon className={cn("h-3.5 w-3.5", iconClassName)} strokeWidth={2.5} />
        <p className="text-xs font-bold text-slate-800">{title}</p>
      </div>
      {posts.length === 0 ? (
        <p className="text-xs text-slate-400">{t("dashboard.noData")}</p>
      ) : (
        <ul className="space-y-2.5">
          {posts.slice(0, 3).map((post, index) => (
            <li key={post.id} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2.5">
                <span className="mt-0.5 w-3 shrink-0 text-xs font-bold text-slate-400">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {truncateText(post.text, 36)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {post.channelService} · {(post.engagementRate || 0).toFixed(1)}%
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 text-sm font-bold",
                  variant === "popular" ? "text-[#22C55E]" : "text-[#EF4444]"
                )}
              >
                {formatCompact(post.reach || post.score)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatTrendLabel(date: string) {
  const parts = date.split("-");
  if (parts.length >= 3) {
    const day = Number(parts[2]);
    const month = Number(parts[1]);
    const months = [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ];
    return `${day} ${months[month - 1] ?? ""}`;
  }
  return date.slice(5);
}

function LoadingChart() {
  const { t } = useT();
  return (
    <div className="flex h-full flex-1 items-center justify-center text-xs text-slate-400">
      {t("common.loading")}
    </div>
  );
}

function Empty() {
  const { t } = useT();
  return (
    <div className="flex h-full flex-1 items-center justify-center text-xs text-slate-400">
      {t("dashboard.noData")}
    </div>
  );
}
