import { NextResponse } from "next/server";
import { requireSession } from "@/lib/shared/api-auth";
import { listPostingChannelsForForm } from "@/lib/content/posting/posting-channels";

export async function GET() {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const { channels, source } = await listPostingChannelsForForm();
  return NextResponse.json({ channels, source });
}
