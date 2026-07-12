import { NextResponse } from "next/server";
import { requireSession } from "@/lib/content/api-auth";
import { listChannels } from "@/lib/collaboration/service";

export async function GET() {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const channels = await listChannels();
  return NextResponse.json({ channels });
}
