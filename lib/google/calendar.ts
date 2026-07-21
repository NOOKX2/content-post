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

/**
 * Creates a Google Calendar event on the organizer's primary calendar,
 * invites all attendees (Google emails each of them so it lands on their
 * own calendars), and — unless a manual link is supplied — provisions a
 * Google Meet link automatically.
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
  const auth = getOAuthClient();
  const calendar = google.calendar({ version: "v3", auth });
  const timeZone = params.timeZone ?? DEFAULT_TIME_ZONE;
  const shouldCreateMeet = !params.manualMeetUrl?.trim();

  const attendees = params.attendees
    .filter((attendee) => Boolean(attendee.email))
    .map((attendee) => ({
      email: attendee.email,
      displayName: attendee.displayName,
    }));

  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

  const res = await calendar.events.insert({
    calendarId,
    sendUpdates: "all",
    conferenceDataVersion: shouldCreateMeet ? 1 : 0,
    requestBody: {
      summary: params.title,
      description: params.description,
      start: { dateTime: params.startsAt, timeZone },
      end: { dateTime: params.endsAt, timeZone },
      attendees,
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
    },
  });

  const event = res.data;
  const generatedMeetUrl =
    event.hangoutLink ??
    event.conferenceData?.entryPoints?.find(
      (entry) => entry.entryPointType === "video"
    )?.uri ??
    "";

  return {
    eventId: event.id ?? "",
    htmlLink: event.htmlLink ?? "",
    meetUrl: params.manualMeetUrl?.trim() || generatedMeetUrl,
  };
}
