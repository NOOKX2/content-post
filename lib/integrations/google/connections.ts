import { prisma } from "@/lib/shared/prisma";
import {
  createGoogleOAuthClient,
  isGoogleOAuthClientConfigured,
  type GoogleOAuth2Client,
} from "@/lib/integrations/google/oauth";
import {
  decryptSecret,
  encryptSecret,
} from "@/lib/integrations/google/token-crypto";

export type GoogleCalendarConnectionStatus = {
  connected: boolean;
  email: string | null;
  connectedAt: string | null;
  oauthConfigured: boolean;
};

export async function getGoogleCalendarConnectionStatus(
  userId: string
): Promise<GoogleCalendarConnectionStatus> {
  const row = await prisma.googleCalendarConnection.findUnique({
    where: { userId },
    select: { email: true, connectedAt: true },
  });
  return {
    connected: Boolean(row),
    email: row?.email ?? null,
    connectedAt: row?.connectedAt.toISOString() ?? null,
    oauthConfigured: isGoogleOAuthClientConfigured(),
  };
}

export async function listConnectedGoogleEmails(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, string>();
  const rows = await prisma.googleCalendarConnection.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, email: true },
  });
  return new Map(rows.map((row) => [row.userId, row.email]));
}

export async function listUsersWithGoogleCalendarConnected() {
  const rows = await prisma.googleCalendarConnection.findMany({
    select: { userId: true },
  });
  return new Set(rows.map((row) => row.userId));
}

export async function saveGoogleCalendarConnection(input: {
  userId: string;
  email: string;
  refreshToken: string;
  accessToken?: string | null;
  expiryDate?: Date | null;
  scope?: string | null;
}) {
  const data = {
    email: input.email.toLowerCase(),
    refreshToken: encryptSecret(input.refreshToken),
    accessToken: input.accessToken
      ? encryptSecret(input.accessToken)
      : null,
    expiryDate: input.expiryDate ?? null,
    scope: input.scope ?? null,
  };

  return prisma.googleCalendarConnection.upsert({
    where: { userId: input.userId },
    create: {
      userId: input.userId,
      ...data,
    },
    update: data,
  });
}

export async function disconnectGoogleCalendar(userId: string) {
  await prisma.googleCalendarConnection.deleteMany({ where: { userId } });
}

export async function getOAuthClientForUser(
  userId: string
): Promise<GoogleOAuth2Client | null> {
  const row = await prisma.googleCalendarConnection.findUnique({
    where: { userId },
  });
  if (!row) return null;

  const client = createGoogleOAuthClient();
  const refreshToken = decryptSecret(row.refreshToken);
  client.setCredentials({
    refresh_token: refreshToken,
    access_token: row.accessToken ? decryptSecret(row.accessToken) : undefined,
    expiry_date: row.expiryDate?.getTime(),
  });

  client.on("tokens", (tokens) => {
    void (async () => {
      try {
        await prisma.googleCalendarConnection.update({
          where: { userId },
          data: {
            accessToken: tokens.access_token
              ? encryptSecret(tokens.access_token)
              : undefined,
            expiryDate: tokens.expiry_date
              ? new Date(tokens.expiry_date)
              : undefined,
            refreshToken: tokens.refresh_token
              ? encryptSecret(tokens.refresh_token)
              : undefined,
          },
        });
      } catch (error) {
        console.error("[google-calendar] failed to persist refreshed tokens", error);
      }
    })();
  });

  return client;
}
