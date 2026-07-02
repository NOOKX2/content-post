"use client";

import { useState } from "react";
import { CalendarView } from "@/components/calendar/calendar-view";
import { ContentCalendarGrid } from "@/components/calendar/content-calendar-grid";
import { Header } from "@/components/layout/header";
import { Tabs } from "@/components/ui/tabs";
import { CalendarLegend } from "@/components/calendar/calendar-legend";
import type { ContentItem } from "@/lib/types";
import type { Session } from "next-auth";

const VIEW_TABS = [
  { id: "month", label: "รายเดือน" },
  { id: "week", label: "รายสัปดาห์" },
] as const;

type CalendarViewMode = (typeof VIEW_TABS)[number]["id"];

export function CalendarPageClient({
  contents,
  session,
}: {
  contents: ContentItem[];
  session: Session | null;
}) {
  const [view, setView] = useState<CalendarViewMode>("month");

  return (
    <>
      <Header
        session={session}
        title="ปฏิทิน Content"
        description={
          view === "week"
            ? "ดูตารางรายสัปดาห์ — Content ที่ส่งแล้วทุกสถานะ"
            : "ดูภาพรวมรายเดือน — Content ที่ส่งแล้วทุกสถานะ"
        }
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
