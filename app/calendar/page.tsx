"use client";

import { useState } from "react";
import { CalendarView } from "@/components/calendar/calendar-view";
import { ContentCalendarGrid } from "@/components/calendar/content-calendar-grid";
import { Header } from "@/components/layout/header";
import { Tabs } from "@/components/ui/tabs";
import { CalendarLegend } from "@/components/calendar/calendar-legend";
import { useContent } from "@/lib/content-context";

const VIEW_TABS = [
  { id: "week", label: "รายสัปดาห์" },
  { id: "month", label: "รายเดือน" },
] as const;

type CalendarViewMode = (typeof VIEW_TABS)[number]["id"];

export default function CalendarPage() {
  const { contents } = useContent();
  const [view, setView] = useState<CalendarViewMode>("week");

  return (
    <>
      <Header
        title="ปฏิทิน Content"
        description={
          view === "week"
            ? "ดูตารางรายสัปดาห์ — Content ที่ส่งแล้วทุกสถานะ"
            : "ดูภาพรวมรายเดือน — Content ที่ส่งแล้วทุกสถานะ"
        }
        showExport
        onExport={() => alert("PDF Export จะเชื่อมต่อในขั้นตอนถัดไป")}
      />
      <div className="space-y-4 p-6">
        <Tabs
          tabs={[...VIEW_TABS]}
          activeTab={view}
          onChange={(id) => setView(id as CalendarViewMode)}
          className="max-w-xs"
        />
        <CalendarLegend />
        {view === "week" ? (
          <CalendarView contents={contents} />
        ) : (
          <ContentCalendarGrid contents={contents} />
        )}
      </div>
    </>
  );
}
