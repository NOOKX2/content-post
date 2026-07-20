"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ContentForm } from "@/components/content/content-form";
import { Header } from "@/components/layout/header";
import type { MediaType } from "@/lib/types";

export function CreateView() {
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
      <div className="flex-1 px-4 py-6 sm:px-6 lg:px-6">
        <div className="w-full max-w-none">
          <ContentForm onMediaTypeChange={setMediaType} />
        </div>
      </div>
    </>
  );
}
