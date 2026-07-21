import { NextResponse } from "next/server";
import { requireSession } from "@/lib/content/api-auth";
import { listSharedMeetings } from "@/lib/collaboration/service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const meetings = await listSharedMeetings(authResult.session.user.id, id);
  return NextResponse.json({ meetings });
}
