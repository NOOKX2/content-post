"use server";

import { auth } from "@/auth";
import {
  disconnectGoogleCalendar,
  getGoogleCalendarConnectionStatus,
  type GoogleCalendarConnectionStatus,
} from "@/lib/integrations/google/connections";

export async function fetchGoogleCalendarConnectionStatus(): Promise<GoogleCalendarConnectionStatus> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      connected: false,
      email: null,
      connectedAt: null,
      oauthConfigured: false,
    };
  }
  return getGoogleCalendarConnectionStatus(session.user.id);
}

export async function disconnectGoogleCalendarAction(): Promise<
  { success: true } | { success: false; error: string }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }
  try {
    await disconnectGoogleCalendar(session.user.id);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Disconnect failed",
    };
  }
}
