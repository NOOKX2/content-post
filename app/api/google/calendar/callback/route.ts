import { NextResponse } from "next/server";
import { google } from "googleapis";
import { requireSession } from "@/lib/shared/api-auth";
import {
  createGoogleOAuthClient,
  verifyGoogleOAuthState,
} from "@/lib/integrations/google/oauth";
import { saveGoogleCalendarConnection } from "@/lib/integrations/google/connections";
import { decryptSecret } from "@/lib/integrations/google/token-crypto";
import { prisma } from "@/lib/shared/prisma";

function settingsRedirect(request: Request, query: Record<string, string>) {
  const params = new URLSearchParams(query);
  const url = new URL("/settings", request.url);
  params.forEach((value, key) => url.searchParams.set(key, value));
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const authResult = await requireSession();
  if ("error" in authResult) {
    const login = new URL("/login", request.url);
    login.searchParams.set("callbackUrl", "/settings");
    return NextResponse.redirect(login);
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return settingsRedirect(request, {
      googleCalendar: "error",
      reason: oauthError,
    });
  }
  if (!code || !state) {
    return settingsRedirect(request, {
      googleCalendar: "error",
      reason: "missing_code",
    });
  }

  const stateUserId = verifyGoogleOAuthState(state);
  if (!stateUserId || stateUserId !== authResult.session.user.id) {
    return settingsRedirect(request, {
      googleCalendar: "error",
      reason: "invalid_state",
    });
  }

  try {
    const client = createGoogleOAuthClient();
    const { tokens } = await client.getToken(code);
    if (!tokens.refresh_token && !tokens.access_token) {
      return settingsRedirect(request, {
        googleCalendar: "error",
        reason: "missing_token",
      });
    }

    client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: "v2", auth: client });
    const profile = await oauth2.userinfo.get();
    const email = profile.data.email?.trim();
    if (!email) {
      return settingsRedirect(request, {
        googleCalendar: "error",
        reason: "missing_email",
      });
    }

    let refreshToken = tokens.refresh_token ?? "";
    if (!refreshToken) {
      const existing = await prisma.googleCalendarConnection.findUnique({
        where: { userId: stateUserId },
        select: { refreshToken: true },
      });
      if (!existing) {
        return settingsRedirect(request, {
          googleCalendar: "error",
          reason: "missing_refresh_token",
        });
      }
      refreshToken = decryptSecret(existing.refreshToken);
    }

    await saveGoogleCalendarConnection({
      userId: stateUserId,
      email,
      refreshToken,
      accessToken: tokens.access_token ?? null,
      expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      scope: tokens.scope ?? null,
    });

    return settingsRedirect(request, { googleCalendar: "connected" });
  } catch (error) {
    console.error("[google-calendar/callback]", error);
    return settingsRedirect(request, {
      googleCalendar: "error",
      reason: "exchange_failed",
    });
  }
}
