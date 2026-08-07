"use client";

import { useSession } from "next-auth/react";
import { ApprovalList } from "@/app/admin/_components/ApprovalList";
import { Header } from "@/components/layout/Header";

export function AdminView() {
  const { data: session } = useSession();

  return (
    <>
      <Header
        session={session}
        title="Admin — อนุมัติ Content"
        description="ตรวจสอบและอนุมัติ Content ก่อนขึ้นปฏิทินและโพสต์อัตโนมัติ"
        compact
      />
      <div className="px-4 py-4 sm:px-6 md:px-8 md:py-6">
        <ApprovalList />
      </div>
    </>
  );
}
