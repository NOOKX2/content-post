"use client";

import { useSession } from "next-auth/react";
import { Settings } from "lucide-react";
import { ApprovalList } from "@/app/admin/_components/ApprovalList";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { useDashboardNav } from "@/lib/navigation/client/dashboard-nav";
import { useT } from "@/lib/i18n";

export function AdminView() {
  const { data: session } = useSession();
  const { t } = useT();
  const { navigate } = useDashboardNav();

  return (
    <>
      <Header
        session={session}
        title={t("admin.title")}
        description={t("admin.description")}
        compact
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/settings")}
          >
            <Settings className="h-4 w-4" />
            {t("nav.adminSettings")}
          </Button>
        }
      />
      <div className="px-4 py-4 sm:px-6 md:px-8 md:py-6">
        <ApprovalList />
      </div>
    </>
  );
}
