import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/content/api-auth";
import { listBufferChannels } from "@/lib/buffer/list-channels";
import { isBufferConfigured } from "@/lib/buffer/client";

export async function GET() {
  const authResult = await requireAdmin();
  if ("error" in authResult) return authResult.error;

  if (!isBufferConfigured()) {
    return NextResponse.json({
      configured: false,
      channels: [],
      error: "ยังไม่ได้ตั้งค่า BUFFER_API_KEY / BUFFER_ORG_ID บนเซิร์ฟเวอร์",
    });
  }

  try {
    const channels = await listBufferChannels();
    return NextResponse.json({ configured: true, channels });
  } catch (error) {
    return NextResponse.json({
      configured: true,
      channels: [],
      error: error instanceof Error ? error.message : "Buffer API error",
    });
  }
}
