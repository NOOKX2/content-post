"use client";

import { useSession } from "next-auth/react";
import { ChannelSettings } from "@/components/admin/channel-settings";
import { Header } from "@/components/layout/header";

export function AdminChannelsView() {
  const { data: session } = useSession();

  return (
    <>
      <Header
        session={session}
        title="ตั้งค่าช่อง & แพลตฟอร์ม"
        description="เชื่อมบัญชี Buffer กับช่องที่ลง — Creator ไม่ต้องตั้งค่า API เอง"
      />
      <div className="px-8 py-6">
        <ChannelSettings />
      </div>
    </>
  );
}
