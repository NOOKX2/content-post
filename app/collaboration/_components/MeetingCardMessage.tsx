"use client";

import type { MeetingCardMetadata } from "@/lib/collaboration/types";
import { CalendarCheck, Users, Video } from "lucide-react";
import { useMeetingCardMessage } from "@/app/collaboration/_hooks/use-meeting-card-message";
import { formatLocalizedDate } from "@/lib/i18n";

export function MeetingCardMessage({ metadata }: { metadata: MeetingCardMetadata }) {
  const { countdown, t, locale } = useMeetingCardMessage(metadata);

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-blue-100 bg-blue-50 px-3 py-2">
        <Video className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-semibold text-blue-900">{t("team.scheduleMeeting")}</span>
      </div>
      <div className="space-y-2 px-3 py-3 text-sm">
        <p className="font-semibold text-stone-900">{metadata.title}</p>
        <p className="text-xs text-stone-500">
          {formatLocalizedDate(metadata.startsAt.slice(0, 10), locale)}{" "}
          {metadata.startsAt.slice(11, 16)} – {metadata.endsAt.slice(11, 16)}
        </p>
        <p className="text-xs font-medium text-blue-700">{countdown}</p>
        {typeof metadata.attendeeCount === "number" && metadata.attendeeCount > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-stone-500">
            <CalendarCheck className="h-3.5 w-3.5 text-emerald-600" />
            {t("team.addedToCalendars", { count: metadata.attendeeCount })}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {metadata.meetUrl ? (
            <a href={metadata.meetUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
              <Video className="h-3.5 w-3.5" />
              {t("team.joinMeet")}
            </a>
          ) : (
            <p className="text-xs text-stone-400">{t("team.noMeetLink")}</p>
          )}
          {metadata.calendarLink && (
            <a href={metadata.calendarLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50">
              <Users className="h-3.5 w-3.5" />
              {t("team.viewCalendar")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
