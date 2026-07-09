import { NextResponse } from "next/server";
import { requireSession } from "@/lib/content/api-auth";
import { markAllNotificationsRead } from "@/lib/notifications/service";

export async function PATCH() {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  await markAllNotificationsRead(authResult.session.user.id);
  return NextResponse.json({ success: true });
}
