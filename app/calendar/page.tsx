"use client";

import { CalendarView } from "@/components/calendar/calendar-view";
import { Header } from "@/components/layout/header";
import { useContent } from "@/lib/content-context";

export default function CalendarPage() {
  const { contents } = useContent();

  return (
    <>
      <Header
        title="ปฏิทิน Content"
        description="ดูตาราง Content ที่อนุมัติแล้ว — จะโพสต์อัตโนมัติตาม schedule"
      />
      <div className="p-6">
        <CalendarView contents={contents} />
      </div>
    </>
  );
}
