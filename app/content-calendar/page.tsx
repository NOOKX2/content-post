"use client";

import { ContentCalendarGrid } from "@/components/calendar/content-calendar-grid";
import { Header } from "@/components/layout/header";
import { useContent } from "@/lib/content-context";

export default function ContentCalendarPage() {
  const { contents } = useContent();

  return (
    <>
      <Header
        title="Content Calendar"
        description="มุมมองรายเดือน — ติดตาม Content ทุกช่องทาง"
        showExport
        onExport={() => alert("PDF Export จะเชื่อมต่อในขั้นตอนถัดไป")}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <ContentCalendarGrid contents={contents} />
      </div>
    </>
  );
}
