import { randomUUID } from "crypto";
import { google, type calendar_v3 } from "googleapis";
import {
  createGoogleOAuthClient,
  type GoogleOAuth2Client,
} from "@/lib/integrations/google/oauth";
import { getOAuthClientForUser } from "@/lib/integrations/google/connections";

const DEFAULT_TIME_ZONE = "Asia/Bangkok";

export function isGoogleCalendarConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN
  );
}

function getSharedOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "ยังไม่ได้ตั้งค่า Google Calendar (ต้องมี GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN)"
    );
  }

  const client = createGoogleOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}

async function resolveAuthClient(options?: {
  organizerUserId?: string;
  auth?: GoogleOAuth2Client;
}): Promise<{
  auth: GoogleOAuth2Client;
  calendarId: string;
  usedUserAuth: boolean;
}> {
  if (options?.auth) {
    return { auth: options.auth, calendarId: "primary", usedUserAuth: true };
  }

  if (options?.organizerUserId) {
    const userClient = await getOAuthClientForUser(options.organizerUserId);
    if (userClient) {
      return { auth: userClient, calendarId: "primary", usedUserAuth: true };
    }
  }

  return {
    auth: getSharedOAuthClient(),
    calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
    usedUserAuth: false,
  };
}

export type CalendarAttendee = {
  email: string;
  displayName?: string;
};

export type CreatedCalendarMeeting = {
  eventId: string;
  htmlLink: string;
  meetUrl: string;
  usedUserAuth: boolean;
};

export type CreateCalendarEventParams = {
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  attendees?: CalendarAttendee[];
  /** When true (default for meetings), provisions a Google Meet link unless manualMeetUrl is set. */
  withMeet?: boolean;
  manualMeetUrl?: string;
  timeZone?: string;
  /** If set, updates this event instead of creating a new one. */
  eventId?: string;
  /** Prefer this user's connected Google Calendar when available. */
  organizerUserId?: string;
  auth?: GoogleOAuth2Client;
};

/**
 * Creates or updates a Google Calendar event.
 * Uses the organizer's connected account when available, otherwise the shared env token.
 */
export async function createCalendarEvent(
  params: CreateCalendarEventParams
): Promise<CreatedCalendarMeeting> {
  const { auth, calendarId, usedUserAuth } = await resolveAuthClient({
    organizerUserId: params.organizerUserId,
    auth: params.auth,
  });
  const calendar = google.calendar({ version: "v3", auth });
  const timeZone = params.timeZone ?? DEFAULT_TIME_ZONE;
  const withMeet = params.withMeet ?? false;
  const shouldCreateMeet = withMeet && !params.manualMeetUrl?.trim();

  const attendees = (params.attendees ?? [])
    .filter((attendee) => Boolean(attendee.email))
    .map((attendee) => ({
      email: attendee.email,
      displayName: attendee.displayName,
    }));

  const requestBody: calendar_v3.Schema$Event = {
    summary: params.title,
    description: params.description,
    start: { dateTime: params.startsAt, timeZone },
    end: { dateTime: params.endsAt, timeZone },
    ...(attendees.length > 0 ? { attendees } : {}),
    ...(shouldCreateMeet
      ? {
          conferenceData: {
            createRequest: {
              requestId: randomUUID(),
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
        }
      : {}),
  };

  const res = params.eventId
    ? await calendar.events.patch({
        calendarId,
        eventId: params.eventId,
        sendUpdates: attendees.length > 0 ? "all" : "none",
        conferenceDataVersion: shouldCreateMeet ? 1 : 0,
        requestBody,
      })
    : await calendar.events.insert({
        calendarId,
        sendUpdates: attendees.length > 0 ? "all" : "none",
        conferenceDataVersion: shouldCreateMeet ? 1 : 0,
        requestBody,
      });

  const event = res.data;
  const generatedMeetUrl =
    event.hangoutLink ??
    event.conferenceData?.entryPoints?.find(
      (entry) => entry.entryPointType === "video"
    )?.uri ??
    "";

  return {
    eventId: event.id ?? params.eventId ?? "",
    htmlLink: event.htmlLink ?? "",
    meetUrl: params.manualMeetUrl?.trim() || generatedMeetUrl,
    usedUserAuth,
  };
}

/**
 * Creates a Google Calendar event with attendees and a Google Meet link
 * (unless a manual Meet URL is supplied).
 */
export async function createCalendarMeeting(params: {
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  attendees: CalendarAttendee[];
  manualMeetUrl?: string;
  timeZone?: string;
  organizerUserId?: string;
}): Promise<CreatedCalendarMeeting> {
  return createCalendarEvent({
    ...params,
    withMeet: true,
  });
}

/** True when shared env OR a specific user connection can write events. */
export async function canCreateCalendarEventForUser(userId?: string) {
  if (userId) {
    const userClient = await getOAuthClientForUser(userId);
    if (userClient) return true;
  }
  return isGoogleCalendarConfigured();
}
