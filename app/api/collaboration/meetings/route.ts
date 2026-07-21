import { NextResponse } from "next/server";
import { requireSession } from "@/lib/content/api-auth";
import { listUserMeetings } from "@/lib/collaboration/service";

export async function GET() {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const meetings = await listUserMeetings(authResult.session.user.id);
  return NextResponse.json({ meetings });
}
