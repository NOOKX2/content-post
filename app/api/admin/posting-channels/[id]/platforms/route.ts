import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/content/api-auth";
import {
  removePostingChannelPlatformLink,
  upsertPostingChannelPlatformLink,
} from "@/lib/content/posting-channels";
import type { Platform } from "@/lib/types";

const PLATFORMS: Platform[] = ["facebook", "instagram", "tiktok", "youtube"];

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const body = (await request.json()) as {
    platform?: Platform;
    bufferChannelId?: string | null;
    bufferChannelName?: string;
  };

  if (!body.platform || !PLATFORMS.includes(body.platform)) {
    return NextResponse.json({ error: "แพลตฟอร์มไม่ถูกต้อง" }, { status: 400 });
  }

  if (!body.bufferChannelId) {
    await removePostingChannelPlatformLink(id, body.platform);
    return NextResponse.json({ success: true });
  }

  await upsertPostingChannelPlatformLink({
    channelId: id,
    platform: body.platform,
    bufferChannelId: body.bufferChannelId,
    bufferChannelName: body.bufferChannelName ?? "",
  });

  return NextResponse.json({ success: true });
}
