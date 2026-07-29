"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { BarChart3, LineChart } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Tabs } from "@/components/ui/tabs";
import { SocialAnalyticsPanel } from "@/components/dashboard/social-analytics-panel";
import { WorkflowPerformancePanel } from "@/components/dashboard/workflow-performance-panel";

const DASHBOARD_TABS = [
  { id: "social", label: "วิเคราะห์ข้อมูล" },
  { id: "workflow", label: "วิเคราะห์ผลงาน" },
] as const;

type DashboardTab = (typeof DASHBOARD_TABS)[number]["id"];

export function DashboardView() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<DashboardTab>("social");

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <Header session={session} title="Dashboard" compact />
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 py-3 sm:gap-2 sm:px-5 sm:py-2">
        <div className="flex shrink-0 items-center justify-between gap-3">
          <Tabs
            tabs={DASHBOARD_TABS.map((item) => ({
              id: item.id,
              label: item.label,
            }))}
            activeTab={tab}
            onChange={(id) => setTab(id as DashboardTab)}
            compact
          />
          <div className="hidden items-center gap-1.5 text-[11px] text-stone-400 sm:flex">
            {tab === "social" ? (
              <>
                <BarChart3 className="h-3.5 w-3.5" />
                Buffer API
              </>
            ) : (
              <>
                <LineChart className="h-3.5 w-3.5" />
                ระบบภายใน
              </>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          {tab === "social" ? (
            <SocialAnalyticsPanel />
          ) : (
            <WorkflowPerformancePanel />
          )}
        </div>
      </div>
    </div>
  );
}
