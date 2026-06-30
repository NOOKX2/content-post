"use client";

import { ApprovalList } from "@/components/admin/approval-list";
import { Header } from "@/components/layout/header";

export default function AdminPage() {
  return (
    <>
      <Header
        title="Admin — อนุมัติ Content"
        description="ตรวจสอบและอนุมัติ Content ก่อนขึ้นปฏิทินและโพสต์อัตโนมัติ"
      />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <ApprovalList />
      </div>
    </>
  );
}
