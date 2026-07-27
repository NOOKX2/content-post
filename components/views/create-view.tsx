"use client";

import { Suspense } from "react";
import { ContentWorkflowView } from "@/components/content/content-workflow-view";
import { Header } from "@/components/layout/header";
import { useSession } from "next-auth/react";

function CreateWorkflowContent() {
  return <ContentWorkflowView />;
}

export function CreateView() {
  const { data: session } = useSession();

  return (
    <>
      <Header
        session={session}
        title="สร้าง Content"
        description="ติดตามสถานะและจัดการงานคอนเทนต์ของคุณ"
      />
      <div className="flex-1 px-4 py-6 sm:px-6 lg:px-6">
        <div className="w-full max-w-none">
          <Suspense fallback={<div className="py-8 text-center text-sm text-stone-500">กำลังโหลด...</div>}>
            <CreateWorkflowContent />
          </Suspense>
        </div>
      </div>
    </>
  );
}
