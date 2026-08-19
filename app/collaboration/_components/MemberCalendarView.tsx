"use client";

import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { ArrowLeft } from "lucide-react";
import { fetchMemberMeetings, openDirectMessage, postChannelMeeting } from "@/lib/collaboration/actions/fetch";
import { PersonAvatar } from "@/app/collaboration/_components/PersonAvatar";
import { MeetingsWeekCalendar } from "@/app/collaboration/_components/MeetingsWeekCalendar";
import { ScheduleMeetingDialog, type MeetingDraft } from "@/app/collaboration/_components/ScheduleMeetingDialog";
import { Button } from "@/components/ui/Button";
import { useT } from "@/lib/i18n";

export function MemberCalendarView({
  userId,
  memberName,
  onBack,
  channelId,
  subtitle,
}: {
  userId: string;
  memberName: string;
  onBack: () => void;
  channelId?: string;
  subtitle?: string;
}) {
  const { t } = useT();
  const { mutate: mutateGlobal } = useSWRConfig();
  const calendarSubtitle = subtitle ?? t("team.sharedMeetings");

  const { data: meetings = [], isLoading, mutate } = useSWR(
    `member-meetings:${userId}`,
    () => fetchMemberMeetings(userId),
    { refreshInterval: 15000 }
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [prefill, setPrefill] = useState<{ start: Date; end: Date }>({ start: new Date(), end: new Date() });

  const handleSchedule = (next: { start: Date; end: Date }) => {
    setPrefill(next);
    setDialogOpen(true);
  };

  const handleSubmit = async (draft: MeetingDraft) => {
    setSubmitting(true);
    try {
      const targetChannelId = channelId ?? (await openDirectMessage(userId)).id;
      await postChannelMeeting(targetChannelId, {
        title: draft.title,
        meetUrl: draft.meetUrl,
        startsAt: draft.startsAt,
        endsAt: draft.endsAt,
      });
      setDialogOpen(false);
      await mutate();
      void mutateGlobal("collab-meetings");
      void mutateGlobal("collab-channels");
      if (channelId) void mutateGlobal(`collab-messages:${channelId}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : t("team.scheduleFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <MeetingsWeekCalendar
          meetings={meetings}
          isLoading={isLoading}
          onSchedule={handleSchedule}
          className="h-full w-full flex-1 rounded-none border-0 shadow-none"
          headerLeading={
            <>
              <Button variant="ghost" size="sm" className="shrink-0" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
                {t("common.back")}
              </Button>
              <PersonAvatar name={memberName} size="sm" />
              <div className="min-w-0">
                <span className="block truncate text-sm font-semibold text-stone-900">{t("team.viewCalendarOf", { name: memberName })}</span>
                <span className="block truncate text-[11px] font-normal text-stone-500">{calendarSubtitle}</span>
              </div>
            </>
          }
        />
      </div>
      <ScheduleMeetingDialog
        open={dialogOpen}
        prefillStart={prefill.start}
        prefillEnd={prefill.end}
        submitting={submitting}
        onClose={() => setDialogOpen(false)}
        onSubmit={(draft) => void handleSubmit(draft)}
      />
    </div>
  );
}
