import { NextResponse } from "next/server";
import { requireSession } from "@/lib/shared/api-auth";
import { markNotificationRead } from "@/lib/notifications/data/service";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  await markNotificationRead(id, authResult.session.user.id);
  return NextResponse.json({ success: true });
}
