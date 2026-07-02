"use client";

import { DashboardLink } from "@/components/layout/dashboard-link";

export function ContentNotFoundView() {
  return (
    <div className="apple-detail min-h-full bg-[#f5f5f7]">
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="apple-display-lg">ไม่พบ Content</h1>
        <p className="apple-body text-[#7a7a7a]">
          Content ที่ต้องการอาจถูกลบหรือไม่มีอยู่ในระบบ
        </p>
        <DashboardLink href="/calendar" className="apple-btn-primary">
          กลับไปปฏิทิน
        </DashboardLink>
      </div>
    </div>
  );
}
