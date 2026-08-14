"use client";

import { Suspense } from "react";
import { ContentWorkflowView } from "@/app/create/_components/ContentWorkflowView";
import { Header } from "@/components/layout/Header";
import { useSession } from "next-auth/react";
import { useT } from "@/lib/i18n";

function CreateWorkflowContent() {
  return <ContentWorkflowView />;
}

export function CreateView() {
  const { data: session } = useSession();
  const { t } = useT();

  return (
    <>
      <Header
        session={session}
        title={t("create.title")}
        description={t("create.description")}
        compact
      />
      <div className="flex-1 px-4 py-4 sm:px-6 sm:py-6">
        <div className="w-full max-w-none">
          <Suspense fallback={<div className="py-8 text-center text-sm text-stone-500">{t("create.loading")}</div>}>
            <CreateWorkflowContent />
          </Suspense>
        </div>
      </div>
    </>
  );
}
