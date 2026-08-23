# Google Calendar (shared + per-user)

## Overview

The app supports two modes:

1. **Shared organizer** (existing) — env `GOOGLE_REFRESH_TOKEN` writes events to one company calendar and invites `User.email` as attendees.
2. **Per-user connect** (new) — each signed-in user can link their own Google account. Meetings they create are written to **their** primary calendar; attendees prefer the Google email from their connection when available.

App login stays **email/password**. Google OAuth is only for Calendar scopes (account linking), not Sign in with Google.

## Google Cloud setup

1. Open [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → enable **Google Calendar API**.
2. Create (or reuse) an **OAuth 2.0 Client ID** (Web application).
3. Add **Authorized redirect URIs**:
   - Local: `http://localhost:3000/api/google/calendar/callback`
   - Production: `https://<your-domain>/api/google/calendar/callback`
4. Under OAuth consent screen, request these scopes:
   - `https://www.googleapis.com/auth/calendar.events`
   - `openid`
   - `email`
   - `profile`

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `GOOGLE_CLIENT_ID` | Yes (for any Calendar) | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | OAuth client secret |
| `GOOGLE_REFRESH_TOKEN` | Shared mode / content sync fallback | Long-lived token for the company calendar |
| `GOOGLE_CALENDAR_ID` | No (default `primary`) | Target calendar for shared writes |
| `GOOGLE_OAUTH_REDIRECT_URI` | Recommended for per-user | Exact callback URL registered in Google Cloud |
| `AUTH_SECRET` | Yes | Also used to encrypt stored refresh tokens and sign OAuth `state` |
| `AUTH_URL` / `NEXTAUTH_URL` | Recommended | Used to build redirect URI when `GOOGLE_OAUTH_REDIRECT_URI` is unset |

### Generating the shared refresh token (company calendar)

Use Google’s OAuth playground or a one-time script with `access_type=offline` and `prompt=consent`, then store the refresh token as `GOOGLE_REFRESH_TOKEN`.

### Per-user connect

Users open **Settings → Connect Google Calendar**. The app redirects to Google, then stores an encrypted refresh token on `GoogleCalendarConnection`.

## Meeting write rules

1. If the meeting author has a Google Calendar connection → create the event with **their** credentials on `primary`.
2. Else if shared env credentials exist → create on the shared calendar.
3. Attendee emails: use connected Google email when present, otherwise `User.email`.

Fake/local emails (e.g. `nook@local.test`) will not receive real calendar invites.
