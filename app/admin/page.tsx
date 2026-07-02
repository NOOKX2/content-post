"use client";

import { useSession } from "next-auth/react";
import { ApprovalList } from "@/components/admin/approval-list";
import { Header } from "@/components/layout/header";

export default function AdminPage() {
  const { data: session } = useSession();

  return (
    <>
      <Header
        session={session}
        title="Admin — อนุมัติ Content"
        description="ตรวจสอบและอนุมัติ Content ก่อนขึ้นปฏิทินและโพสต์อัตโนมัติ"
      />
      <div className="px-8 py-6">
        <ApprovalList />
      </div>
    </>
  );
}
