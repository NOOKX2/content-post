"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock3,
  RotateCcw,
} from "lucide-react";
import { DashboardChartCard } from "@/components/dashboard/dashboard-chart-card";
import { DashboardFiltersBar } from "@/components/dashboard/dashboard-filters";
import { KpiCard } from "@/components/dashboard/kpi-card";
import {
  SimpleAreaChart,
  SimpleBarChart,
  SimpleDonutChart,
} from "@/components/dashboard/simple-charts";
import { filterContentsForDashboard } from "@/lib/dashboard/filters";
import { buildWorkflowAnalytics } from "@/lib/dashboard/workflow-metrics";
import type { DashboardFilters } from "@/lib/dashboard/types";
import { useContents } from "@/lib/content/contents-provider";

export function WorkflowPerformancePanel() {
  const { contents } = useContents();
  const [filters, setFilters] = useState<DashboardFilters>({
    period: "month",
    channel: undefined,
    platform: "all",
    mediaType: "all",
  });

  const analytics = useMemo(() => {
    const filtered = filterContentsForDashboard(contents, filters);
    return buildWorkflowAnalytics(filtered);
  }, [contents, filters]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 sm:gap-2">
      <DashboardFiltersBar filters={filters} onChange={setFilters} />

      <div className="grid shrink-0 grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-2 xl:grid-cols-5">
        <KpiCard
          label="งานทั้งหมด"
          value={analytics.summary.total}
          icon={ClipboardList}
          accent="blue"
          compact
        />
        <KpiCard
          label="กำลังดำเนินการ"
          value={analytics.summary.inProgress}
          icon={Clock3}
          accent="amber"
          compact
        />
        <KpiCard
          label="โพสต์แล้ว"
          value={analytics.summary.published}
          icon={CheckCircle2}
          accent="green"
          compact
        />
        <KpiCard
          label="รอแก้ไข"
          value={analytics.summary.rejected}
          icon={RotateCcw}
          accent="purple"
          compact
        />
        <KpiCard
          label="ใกล้ครบกำหนด"
          value={analytics.summary.nearDeadline}
          icon={AlertTriangle}
          accent="rose"
          compact
        />
      </div>

      <div className="grid shrink-0 grid-cols-1 gap-3 sm:min-h-0 sm:flex-1 sm:gap-2 xl:grid-cols-3">
        <DashboardChartCard
          title="สรุปสถานะงาน"
          description="สัดส่วนงานตามสถานะปัจจุบัน"
          bodyClassName="py-1"
        >
          {analytics.statusBreakdown.length === 0 ? (
            <p className="text-xs text-stone-500">ยังไม่มีข้อมูล</p>
          ) : (
            <SimpleDonutChart
              compact
              slices={analytics.statusBreakdown.map((slice) => ({
                label: slice.label,
                value: slice.count,
                color: slice.color,
              }))}
            />
          )}
        </DashboardChartCard>

        <DashboardChartCard
          className="xl:col-span-2"
          title="แนวโน้มงานรายวัน"
          description="จำนวนงานที่สร้างและโพสต์สำเร็จ"
        >
          <SimpleAreaChart
            compact
            data={analytics.trend.map((point) => ({
              label: point.label.slice(5),
              created: point.created,
              published: point.published,
            }))}
            lines={[
              { key: "created", color: "#3b82f6", label: "สร้างใหม่" },
              { key: "published", color: "#10b981", label: "โพสต์แล้ว" },
            ]}
          />
        </DashboardChartCard>
      </div>

      <DashboardChartCard
        className="shrink-0"
        title="งานตามช่องที่ลง"
        description="เปรียบเทียบปริมาณงานของแต่ละช่อง"
        bodyClassName="h-[4.5rem]"
      >
        {analytics.channelBreakdown.length === 0 ? (
          <p className="text-xs text-stone-500">ยังไม่มีข้อมูล</p>
        ) : (
          <SimpleBarChart
            compact
            data={analytics.channelBreakdown.map((item) => ({
              label: item.channel,
              count: item.count,
            }))}
            labelKey="label"
            valueKey="count"
            color="#8b5cf6"
          />
        )}
      </DashboardChartCard>
    </div>
  );
}
