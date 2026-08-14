"use server";

import { auth } from "@/auth";
import { isGoogleCalendarConfigured } from "@/lib/integrations/google/calendar";
import { syncScheduledContentsToGoogleCalendar } from "@/lib/content/data/google-calendar-sync";

export async function getGoogleCalendarStatusAction() {
  return { configured: isGoogleCalendarConfigured() };
}

export async function syncContentCalendarToGoogleAction() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return syncScheduledContentsToGoogleCalendar();
}
