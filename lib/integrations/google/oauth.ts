import { createHmac, timingSafeEqual } from "crypto";
import { google } from "googleapis";

export const GOOGLE_CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "openid",
  "email",
  "profile",
] as const;

export function isGoogleOAuthClientConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
}

export function getGoogleOAuthRedirectUri() {
  if (process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim()) {
    return process.env.GOOGLE_OAUTH_REDIRECT_URI.trim();
  }
  const base =
    process.env.AUTH_URL?.replace(/\/$/, "") ||
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  return `${base}/api/google/calendar/callback`;
}

export type GoogleOAuth2Client = InstanceType<typeof google.auth.OAuth2>;

export function createGoogleOAuthClient(
  redirectUri?: string
): GoogleOAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "ยังไม่ได้ตั้งค่า Google OAuth (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)"
    );
  }
  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri ?? getGoogleOAuthRedirectUri()
  );
}

function stateSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is required for Google OAuth state");
  }
  return secret;
}

export function signGoogleOAuthState(userId: string): string {
  const payload = `${userId}.${Date.now()}`;
  const sig = createHmac("sha256", stateSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyGoogleOAuthState(state: string): string | null {
  const parts = state.split(".");
  if (parts.length !== 3) return null;
  const [userId, ts, sig] = parts;
  if (!userId || !ts || !sig) return null;
  const payload = `${userId}.${ts}`;
  const expected = createHmac("sha256", stateSecret())
    .update(payload)
    .digest("hex");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  const ageMs = Date.now() - Number(ts);
  if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > 15 * 60 * 1000) {
    return null;
  }
  return userId;
}

export function buildGoogleCalendarAuthUrl(userId: string) {
  const client = createGoogleOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [...GOOGLE_CALENDAR_SCOPES],
    state: signGoogleOAuthState(userId),
    include_granted_scopes: true,
  });
}
