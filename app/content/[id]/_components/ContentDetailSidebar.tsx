"use client";

import { ArrowUpRight, HelpCircle } from "lucide-react";
import type { ContentItem } from "@/lib/types";
import { ContentHistoryPanel } from "@/app/content/[id]/_components/ContentHistoryPanel";

type PerformanceMetrics = {
  reach: number | null;
  engagementRate: number | null;
  reachDelta: number | null;
};

function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(value);
}

function getPerformanceMetrics(_content: ContentItem): PerformanceMetrics {
  // Per-content Buffer analytics are not stored yet.
  return {
    reach: null,
    engagementRate: null,
    reachDelta: null,
  };
}

function EstPerformanceCard({ content }: { content: ContentItem }) {
  const platformCount = content.platforms.length;
  const hasPosted = content.status === "posted";
  const { reach, engagementRate, reachDelta } = getPerformanceMetrics(content);
  const engagementPct = Math.min(Math.max(engagementRate ?? 0, 0), 100);

  return (
    <section className="overflow-hidden rounded-2xl bg-[#0b3d6e] p-5 text-white shadow-sm">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-sky-200/80 uppercase">
        Est. Performance
      </p>

      <div className="mt-3 flex items-end gap-2.5">
        <p className="text-4xl font-bold tracking-tight">
          {reach != null ? formatCompactNumber(reach) : "—"}
        </p>
        {reachDelta != null && (
          <span className="mb-1 inline-flex items-center gap-0.5 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
            <ArrowUpRight className="h-3 w-3" />
            {reachDelta}%
          </span>
        )}
      </div>

      <p className="mt-1.5 text-sm text-sky-100/80">
        {hasPosted
          ? `Projected Reach across ${platformCount || 1} platform${
              platformCount === 1 ? "" : "s"
            }`
          : platformCount > 0
            ? `จะแสดง Reach เมื่อโพสต์ครบทั้ง ${platformCount} แพลตฟอร์ม`
            : "จะแสดง Reach เมื่อโพสต์แล้ว"}
      </p>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-sky-100/75">Engagement Rate</span>
          <span className="font-semibold text-white">
            {engagementRate != null ? `${engagementRate.toFixed(1)}%` : "—"}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white transition-all"
            style={{ width: `${engagementPct}%` }}
          />
        </div>
      </div>
    </section>
  );
}

function HelpCard() {
  return (
    <section className="flex items-start gap-3 rounded-2xl border border-stone-200/80 bg-stone-100/80 px-4 py-3.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
        <HelpCircle className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-stone-800">Need help?</p>
        <p className="mt-0.5 text-xs leading-relaxed text-stone-500">
          Contact our content specialists
        </p>
      </div>
    </section>
  );
}

export function ContentDetailSidebar({ content }: { content: ContentItem }) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-20">
      <EstPerformanceCard content={content} />

      <section className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
        <ContentHistoryPanel contentId={content.id} variant="timeline" />
      </section>

      <HelpCard />
    </aside>
  );
}
