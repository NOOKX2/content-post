import { NextResponse } from "next/server";
import { requireSession } from "@/lib/shared/api-auth";
import {
  buildGoogleCalendarAuthUrl,
  isGoogleOAuthClientConfigured,
} from "@/lib/integrations/google/oauth";

export async function GET() {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  if (!isGoogleOAuthClientConfigured()) {
    return NextResponse.json(
      { error: "Google OAuth is not configured" },
      { status: 503 }
    );
  }

  const url = buildGoogleCalendarAuthUrl(authResult.session.user.id);
  return NextResponse.redirect(url);
}
