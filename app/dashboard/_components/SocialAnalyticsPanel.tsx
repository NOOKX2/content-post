"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { DashboardChartCard } from "@/app/dashboard/_components/DashboardChartCard";
import { DashboardFiltersBar } from "@/app/dashboard/_components/DashboardFilters";
import { MiniKpi } from "@/app/dashboard/_components/MiniKpi";
import { SimpleAreaChart, SimpleBarChart } from "@/app/dashboard/_components/SimpleCharts";
import { getDateRangeForPeriod } from "@/lib/dashboard/domain/filters";
import type { DashboardFilters, SocialAnalyticsResponse } from "@/lib/dashboard/types";

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

function truncateText(text: string, max = 48) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max)}...`;
}

export function SocialAnalyticsPanel() {
  const [filters, setFilters] = useState<DashboardFilters>({
    period: "month",
    platform: "all",
    mediaType: "all",
  });

  const swrKey = useMemo(() => buildSocialKey(filters), [filters]);
  const { data, isLoading, error } = useSWR(swrKey, fetchSocialAnalytics, {
    revalidateOnFocus: false,
  });

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 sm:gap-2">
      <DashboardFiltersBar
        filters={filters}
        onChange={setFilters}
        showMediaType={false}
      />

      {(error || data?.error) && (
        <div className="shrink-0 space-y-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] text-amber-900">
          <p className="font-medium">
            {data?.error ||
              (error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ")}
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

      <div className="grid shrink-0 grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-2 xl:grid-cols-7">
        <MiniKpi label="Reach" value={data?.summary.reach ?? 0} />
        <MiniKpi label="Views" value={data?.summary.views ?? 0} />
        <MiniKpi
          label="Engagement"
          value={(data?.summary.engagementRate ?? 0).toFixed(1)}
          suffix="%"
        />
        <MiniKpi
          label="CTR"
          value={(data?.summary.ctr ?? 0).toFixed(2)}
          suffix="%"
        />
        <MiniKpi label="Likes" value={data?.summary.reactions ?? 0} />
        <MiniKpi label="Comments" value={data?.summary.comments ?? 0} />
        <MiniKpi label="Shares" value={data?.summary.shares ?? 0} />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:gap-2 xl:grid-cols-3">
        <DashboardChartCard
          className="xl:col-span-2"
          title="เปรียบเทียบ Engagement ต่อโพสต์"
        >
          {isLoading ? (
            <LoadingChart />
          ) : (
            <SimpleBarChart
              compact
              data={(data?.comparison ?? []).map((item) => ({
                label: item.label,
                engagement: item.engagement,
              }))}
              labelKey="label"
              valueKey="engagement"
              color="#3b82f6"
            />
          )}
        </DashboardChartCard>

        <DashboardChartCard title="แนวโน้ม Engagement">
          {isLoading ? (
            <LoadingChart />
          ) : (
            <SimpleAreaChart
              compact
              data={(data?.trend ?? []).map((point) => ({
                label: point.date,
                engagement: point.engagement,
                reach: point.reach,
              }))}
              lines={[
                { key: "engagement", color: "#3b82f6", label: "Engagement" },
                { key: "reach", color: "#10b981", label: "Reach" },
              ]}
            />
          )}
        </DashboardChartCard>
      </div>

      <div className="grid min-h-0 shrink-0 grid-cols-1 gap-3 sm:gap-2 lg:grid-cols-2 lg:max-h-[9.5rem]">
        <CompactPostList
          title="โพสต์ยอดนิยม"
          posts={data?.popularPosts ?? []}
          loading={isLoading}
          variant="popular"
        />
        <CompactPostList
          title="โพสต์ที่ทำผลงานต่ำ"
          posts={data?.unpopularPosts ?? []}
          loading={isLoading}
          variant="unpopular"
        />
      </div>
    </div>
  );
}

function CompactPostList({
  title,
  posts,
  loading,
  variant,
}: {
  title: string;
  posts: SocialAnalyticsResponse["popularPosts"];
  loading: boolean;
  variant: "popular" | "unpopular";
}) {
  return (
    <DashboardChartCard title={title} bodyClassName="overflow-hidden">
      {loading ? (
        <LoadingChart />
      ) : posts.length === 0 ? (
        <p className="text-xs text-stone-500">ยังไม่มีข้อมูล</p>
      ) : (
        <ul className="space-y-2 sm:space-y-1">
          {posts.slice(0, 2).map((post, index) => (
            <li
              key={post.id}
              className="flex items-start justify-between gap-2.5 rounded-md border border-stone-200/80 bg-stone-50/70 px-2.5 py-2 sm:gap-2 sm:px-2 sm:py-1.5"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-stone-500 sm:text-[10px]">
                  #{index + 1} · {post.channelService}
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-stone-800 sm:truncate sm:text-xs">
                  {truncateText(post.text)}
                </p>
              </div>
              <span
                className={
                  variant === "popular"
                    ? "shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700"
                    : "shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700"
                }
              >
                {Math.round(post.score)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </DashboardChartCard>
  );
}

function LoadingChart() {
  return (
    <div className="flex h-full items-center justify-center text-xs text-stone-400">
      กำลังโหลด...
    </div>
  );
}
