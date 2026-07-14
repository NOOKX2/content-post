"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ContentForm } from "@/components/content/content-form";
import { CalendarView } from "@/components/calendar/calendar-view";
import { Header } from "@/components/layout/header";
import { useContents } from "@/lib/content/contents-provider";
import type { MediaType } from "@/lib/types";

export function CreateView() {
  const { contents } = useContents();
  const { data: session } = useSession();
  const [mediaType, setMediaType] = useState<MediaType>("video");

  const description =
    mediaType === "video"
      ? "สำหรับกรอกข้อมูลคอนเทนต์วิดีโอ"
      : "สำหรับกรอกข้อมูลคอนเทนต์รูปภาพ";

  return (
    <>
      <Header
        session={session}
        title="สร้าง Content"
        description={description}
      />
      <div className="flex flex-1 flex-col xl:flex-row">
        <div className="flex-1 px-8 py-6">
          <ContentForm onMediaTypeChange={setMediaType} />
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
