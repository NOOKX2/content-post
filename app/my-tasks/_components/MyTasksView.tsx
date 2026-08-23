"use client";

import { useSession } from "next-auth/react";
import { TeamTasksPanel } from "@/app/collaboration/_components/TeamTasksPanel";
import { Header } from "@/components/layout/Header";
import { useT } from "@/lib/i18n";

export function MyTasksView() {
  const { data: session } = useSession();
  const { t } = useT();

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <Header session={session} title={t("tasks.title")} compact />
      <div className="min-h-0 flex-1 overflow-hidden bg-stone-50">
        <TeamTasksPanel mineOnly />
      </div>
    </div>
  );
}
