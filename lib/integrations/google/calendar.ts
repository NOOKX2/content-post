import { randomUUID } from "crypto";
import { google } from "googleapis";

const DEFAULT_TIME_ZONE = "Asia/Bangkok";

export function isGoogleCalendarConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN
  );
}

function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "ยังไม่ได้ตั้งค่า Google Calendar (ต้องมี GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN)"
    );
  }

  const client = new google.auth.OAuth2(clientId, clientSecret);
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}

export type CalendarAttendee = {
  email: string;
  displayName?: string;
};

export type CreatedCalendarMeeting = {
  eventId: string;
  htmlLink: string;
  meetUrl: string;
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
};

/**
 * Creates or updates a Google Calendar event on the organizer's primary calendar.
 * Optionally invites attendees and provisions a Google Meet link.
 */
export async function createCalendarEvent(
  params: CreateCalendarEventParams
): Promise<CreatedCalendarMeeting> {
  const auth = getOAuthClient();
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

  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  const requestBody = {
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
              conferenceSolutionKey: { type: "hangoutsMeet" as const },
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
}): Promise<CreatedCalendarMeeting> {
  return createCalendarEvent({
    ...params,
    withMeet: true,
  });
}
