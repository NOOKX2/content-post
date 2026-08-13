import { NextResponse } from "next/server";
import { requireSession } from "@/lib/shared/api-auth";
import { listPostingChannelsForForm } from "@/lib/content/posting/posting-channels";

export async function GET() {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  try {
    const { channels, source } = await listPostingChannelsForForm();
    return NextResponse.json({ channels, source });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ดึงช่อง Buffer ไม่สำเร็จ";
    console.error("[api/posting-channels] Buffer fetch failed", { error: message });
    return NextResponse.json({
      channels: [],
      source: "legacy",
      error: `ดึงช่อง Buffer ไม่สำเร็จ — ${message}`,
    });
  }
}
