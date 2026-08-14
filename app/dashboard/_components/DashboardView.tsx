"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { BarChart3, LineChart } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Tabs } from "@/components/ui/Tabs";
import { SocialAnalyticsPanel } from "@/app/dashboard/_components/SocialAnalyticsPanel";
import { WorkflowPerformancePanel } from "@/app/dashboard/_components/WorkflowPerformancePanel";
import { useT } from "@/lib/i18n";

const DASHBOARD_TABS = [
  { id: "social", label: "วิเคราะห์ข้อมูล" },
  { id: "workflow", label: "วิเคราะห์ผลงาน" },
] as const;

type DashboardTab = (typeof DASHBOARD_TABS)[number]["id"];

export function DashboardView() {
  const { data: session } = useSession();
  const { t } = useT();
  const [tab, setTab] = useState<DashboardTab>("social");

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <Header session={session} title={t("dashboard.title")} compact />
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 py-3 sm:gap-2 sm:px-5 sm:py-2">
        <div className="flex shrink-0 items-center justify-between gap-3">
          <Tabs
            tabs={[
              { id: "social", label: t("dashboard.social") },
              { id: "workflow", label: t("dashboard.workflow") },
            ]}
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
                {t("dashboard.internalSystem")}
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
