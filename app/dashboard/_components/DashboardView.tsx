"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Activity, BarChart3 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { SocialAnalyticsPanel } from "@/app/dashboard/_components/SocialAnalyticsPanel";
import { WorkflowPerformancePanel } from "@/app/dashboard/_components/WorkflowPerformancePanel";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/shared/utils";

type DashboardTab = "social" | "workflow";

export function DashboardView() {
  const { data: session } = useSession();
  const { t } = useT();
  const [tab, setTab] = useState<DashboardTab>("social");

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f7f8fb]">
      <Header session={session} title={t("dashboard.title")} compact hideTitle />
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-3 px-6 py-4 sm:px-8 lg:px-10">
          <div className="flex shrink-0 flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[1.5rem] leading-tight font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
                {t("dashboard.title")}
              </h2>
              <p className="mt-1 text-sm leading-snug text-slate-500">
                {tab === "social"
                  ? t("dashboard.socialSubtitle")
                  : t("dashboard.workflowSubtitle")}
              </p>
            </div>

            <div className="inline-flex shrink-0 items-center rounded-xl border border-slate-200/80 bg-white p-1 shadow-sm shadow-slate-200/40">
              <button
                type="button"
                onClick={() => setTab("social")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
                  tab === "social"
                    ? "bg-[#5b5ef0] text-white shadow-sm shadow-[#5b5ef0]/30"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Activity className="h-4 w-4" strokeWidth={2.25} />
                {t("dashboard.social")}
              </button>
              <button
                type="button"
                onClick={() => setTab("workflow")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
                  tab === "workflow"
                    ? "bg-[#5b5ef0] text-white shadow-sm shadow-[#5b5ef0]/30"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <BarChart3 className="h-4 w-4" strokeWidth={2.25} />
                {t("dashboard.workflow")}
              </button>
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
    </div>
  );
}
