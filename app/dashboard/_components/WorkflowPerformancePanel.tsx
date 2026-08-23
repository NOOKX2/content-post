"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  Activity,
  CalendarDays,
  Clapperboard,
  ClipboardList,
  Users,
} from "lucide-react";
import { DashboardChartCard } from "@/app/dashboard/_components/DashboardChartCard";
import { DashboardFiltersBar } from "@/app/dashboard/_components/DashboardFilters";
import { KpiCard } from "@/app/dashboard/_components/KpiCard";
import {
  SimpleDonutChart,
  SimpleStackedBarChart,
} from "@/app/dashboard/_components/SimpleCharts";
import { PersonAvatar } from "@/app/collaboration/_components/PersonAvatar";
import { filterContentsForDashboard } from "@/lib/dashboard/domain/filters";
import { buildWorkflowAnalytics } from "@/lib/dashboard/domain/workflow-metrics";
import type { DashboardFilters } from "@/lib/dashboard/types";
import { useContents } from "@/lib/content/client/contents-provider";
import {
  fetchTeamMembers,
  fetchTeamTasks,
} from "@/lib/collaboration/actions/team";
import {
  TEAM_MEMBERS_KEY,
  TEAM_TASKS_ALL_KEY,
  useCollaborationBootstrap,
} from "@/lib/collaboration/client/collaboration-provider";
import { dateLocale, useT } from "@/lib/i18n";
import { cn } from "@/lib/shared/utils";

const MEDIA_COLORS: Record<string, string> = {
  video: "#7C3AED",
  image: "#EC4899",
  graphic: "#F59E0B",
  other: "#94A3B8",
};

const STATUS_COLORS = {
  done: "#22C55E",
  inProgress: "#F59E0B",
  todo: "#94A3B8",
};

export function WorkflowPerformancePanel() {
  const { contents } = useContents();
  const bootstrap = useCollaborationBootstrap();
  const { t, locale } = useT();
  const loc = dateLocale(locale);
  const [filters, setFilters] = useState<DashboardFilters>({
    period: "30d",
    channel: undefined,
    platform: "all",
    mediaType: "all",
    memberId: "all",
  });

  const { data: members = [] } = useSWR(TEAM_MEMBERS_KEY, fetchTeamMembers, {
    fallbackData: bootstrap?.members,
    revalidateOnMount: !bootstrap,
  });
  const { data: tasks = [] } = useSWR(TEAM_TASKS_ALL_KEY, () => fetchTeamTasks(), {
    fallbackData: bootstrap?.tasks,
    revalidateOnMount: !bootstrap,
  });

  const analytics = useMemo(() => {
    const filteredContents = filterContentsForDashboard(contents, filters);
    const filteredTasks =
      filters.memberId && filters.memberId !== "all"
        ? tasks.filter((task) => task.assigneeId === filters.memberId)
        : tasks;
    return buildWorkflowAnalytics(filteredContents, filteredTasks, members);
  }, [contents, filters, tasks, members]);

  const formatDue = (dueDate: string) => {
    if (!dueDate) return "—";
    const date = new Date(`${dueDate}T12:00:00`);
    if (Number.isNaN(date.getTime())) return dueDate;
    return date.toLocaleDateString(loc, { day: "numeric", month: "short" });
  };

  const mediaItems = analytics.mediaTypeBreakdown.map((item) => ({
    ...item,
    color: MEDIA_COLORS[item.key] ?? MEDIA_COLORS.other,
  }));

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-4 overflow-y-auto pb-3">
      <DashboardFiltersBar
        filters={filters}
        onChange={setFilters}
        showPlatform={false}
        showMediaType={false}
        showChannel={false}
        showMember
        members={members}
        countLabel={t("dashboard.taskCount", { count: analytics.summary.total })}
      />

      <div className="grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          label={t("dashboard.totalContent")}
          value={analytics.summary.total}
          hint={t("dashboard.workInSystem")}
          change={`+${Math.min(4, analytics.summary.total)}`}
          changeTone="up"
          valueClassName="text-[#7C3AED]"
        />
        <KpiCard
          label={t("dashboard.inProgress")}
          value={analytics.summary.inProgress}
          hint={t("dashboard.workOngoing")}
          change={`+${Math.min(2, analytics.summary.inProgress)}`}
          changeTone="up"
          valueClassName="text-[#F59E0B]"
        />
        <KpiCard
          label={t("dashboard.publishedDone")}
          value={analytics.summary.published}
          hint={t("dashboard.workDone")}
          change={`+${Math.min(3, analytics.summary.published)}`}
          changeTone="up"
          valueClassName="text-[#22C55E]"
        />
        <KpiCard
          label={t("dashboard.overdue")}
          value={analytics.summary.overdue}
          hint={t("dashboard.needUrgent")}
          change={`${analytics.summary.overdue}`}
          changeTone={analytics.summary.overdue > 0 ? "down" : "down"}
          valueClassName="text-[#EF4444]"
        />
      </div>

      <div className="grid shrink-0 grid-cols-1 items-stretch gap-4 xl:grid-cols-5">
        <DashboardChartCard
          className="h-[290px] xl:col-span-3"
          bodyClassName="flex min-h-0 flex-1 flex-col"
          title={t("dashboard.memberPerformance")}
          description={t("dashboard.memberPerformanceHint")}
          icon={Users}
          iconClassName="text-[#7C3AED]"
        >
          {analytics.memberPerformance.length === 0 ? (
            <div className="flex h-full flex-1 items-center justify-center text-xs text-slate-400">
              {t("dashboard.noData")}
            </div>
          ) : (
            <SimpleStackedBarChart
              data={analytics.memberPerformance.map((member) => ({
                label: member.name.split(" ")[0] || member.name,
                done: member.done,
                inProgress: member.inProgress,
                todo: member.todo,
              }))}
              labelKey="label"
              series={[
                {
                  key: "done",
                  color: STATUS_COLORS.done,
                  label: t("dashboard.statusDone"),
                },
                {
                  key: "inProgress",
                  color: STATUS_COLORS.inProgress,
                  label: t("dashboard.statusInProgress"),
                },
                {
                  key: "todo",
                  color: STATUS_COLORS.todo,
                  label: t("dashboard.statusTodo"),
                },
              ]}
              height={180}
            />
          )}
        </DashboardChartCard>

        <div className="flex h-[290px] min-h-0 flex-col gap-4 xl:col-span-2">
          <DashboardChartCard
            className="min-h-0 flex-1"
            bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
            title={t("dashboard.overallStatus")}
            icon={Activity}
            iconClassName="text-slate-500"
          >
            {analytics.statusBreakdown.length === 0 ? (
              <div className="flex h-full flex-1 items-center justify-center text-xs text-slate-400">
                {t("dashboard.noData")}
              </div>
            ) : (
              <SimpleDonutChart
                compact
                size={120}
                slices={analytics.statusBreakdown.map((slice) => ({
                  label: slice.label,
                  value: slice.count,
                  color:
                    slice.status === "done"
                      ? STATUS_COLORS.done
                      : slice.status === "in_progress"
                        ? STATUS_COLORS.inProgress
                        : STATUS_COLORS.todo,
                }))}
              />
            )}
          </DashboardChartCard>

          <DashboardChartCard
            className="min-h-0 flex-1"
            bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
            title={t("dashboard.contentTypes")}
            icon={Clapperboard}
            iconClassName="text-slate-500"
          >
            {mediaItems.length === 0 ? (
              <div className="flex h-full flex-1 items-center justify-center text-xs text-slate-400">
                {t("dashboard.noData")}
              </div>
            ) : (
              <ul className="space-y-3.5">
                {mediaItems.map((item) => (
                  <li key={item.key}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{item.label}</span>
                      <span className="font-bold text-slate-900">{item.percent}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${item.percent}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </DashboardChartCard>
        </div>
      </div>

      <DashboardChartCard
        className="w-full shrink-0"
        bodyClassName="w-full"
        title={t("dashboard.upcomingDeadlines")}
        titleClassName="text-lg font-bold tracking-tight"
        description={t("dashboard.upcomingDeadlinesHint")}
        icon={ClipboardList}
        iconClassName="h-[18px] w-[18px] text-[#7C3AED]"
      >
        {analytics.upcomingDeadlines.length === 0 ? (
          <p className="text-xs text-slate-400">{t("dashboard.noData")}</p>
        ) : (
          <ul className="w-full divide-y divide-slate-100">
            {analytics.upcomingDeadlines.map((item) => {
              const priority = (item.priority ?? "medium").toLowerCase();
              const isInProgress = item.status === "in_progress";
              return (
                <li
                  key={item.id}
                  className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-x-8 py-4 first:pt-1 last:pb-1"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={cn(
                        "mt-2 h-2 w-2 shrink-0 rounded-full",
                        isInProgress ? "bg-amber-400" : "bg-slate-400"
                      )}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <PriorityBadge priority={priority} />
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                            isInProgress
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-500"
                          )}
                        >
                          {item.statusLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-5 pt-0.5">
                    <div className="flex items-center gap-2.5">
                      <PersonAvatar
                        name={item.assigneeName}
                        size="sm"
                        tone="vivid"
                        letters={2}
                      />
                      <span className="whitespace-nowrap text-sm font-medium text-slate-700">
                        {item.assigneeName}
                      </span>
                    </div>
                    <div className="flex w-20 shrink-0 items-center gap-1.5 whitespace-nowrap text-sm text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      {formatDue(item.dueDate)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </DashboardChartCard>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const { t } = useT();
  if (priority === "urgent") {
    return (
      <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600">
        {t("team.priorityUrgent")}
      </span>
    );
  }
  if (priority === "high") {
    return (
      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-600">
        {t("team.priorityHigh")}
      </span>
    );
  }
  if (priority === "low") {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
        {t("team.priorityLow")}
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
      {t("team.priorityMedium")}
    </span>
  );
}
