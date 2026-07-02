"use client";

import { useSession } from "next-auth/react";
import { ContentForm } from "@/components/content/content-form";
import { CalendarView } from "@/components/calendar/calendar-view";
import { Header } from "@/components/layout/header";
import { useContents } from "@/lib/content/contents-provider";

export default function CreatePage() {
  const { contents } = useContents();
  const { data: session } = useSession();

  return (
    <>
      <Header
        session={session}
        title="สร้าง Content"
        description="กรอกข้อมูล Content แล้วส่งเพื่อให้ Admin อนุมัติ"
      />
      <div className="flex flex-1 flex-col xl:flex-row">
        <div className="flex-1 px-8 py-6">
          <ContentForm />
        </div>
        <div className="hidden w-[420px] shrink-0 border-l border-stone-200/80 bg-stone-50/50 p-4 xl:block">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-stone-700">
              iDea Content Calendar
            </h3>
            <p className="text-xs text-stone-500">
              Content ที่อนุมัติแล้วจะแสดงในปฏิทิน
            </p>
          </div>
          <CalendarView contents={contents} />
        </div>
      </div>
    </>
  );
}
