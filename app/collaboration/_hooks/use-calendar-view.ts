"use client";

import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import type { MeetingDraft } from "@/app/collaboration/_components/ScheduleMeetingDialog";
import { useT } from "@/lib/i18n";

/** Shared base hook for MemberCalendarView and ChannelCalendarView */
export function useCalendarView(
  swrKey: string,
  fetcher: () => Promise<import("@/lib/collaboration/types").MeetingItem[]>,
  onMeetingPosted: (channelId: string) => Promise<void>,
  getChannelId: () => Promise<string>
) {
  const { t } = useT();
  const { mutate: mutateGlobal } = useSWRConfig();
  const { data: meetings = [], isLoading, mutate } = useSWR(swrKey, fetcher, {
    refreshInterval: 15000,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [prefill, setPrefill] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(),
  });

  const handleSchedule = (next: { start: Date; end: Date }) => {
    setPrefill(next);
    setDialogOpen(true);
  };

  const handleSubmit = async (
    draft: MeetingDraft,
    postMeeting: (channelId: string, payload: {
      title: string; meetUrl: string; startsAt: string; endsAt: string;
    }) => Promise<void>,
    invalidateKeys: string[]
  ) => {
    setSubmitting(true);
    try {
      const channelId = await getChannelId();
      await postMeeting(channelId, {
        title: draft.title,
        meetUrl: draft.meetUrl,
        startsAt: draft.startsAt,
        endsAt: draft.endsAt,
      });
      setDialogOpen(false);
      await mutate();
      for (const key of invalidateKeys) void mutateGlobal(key);
    } catch (error) {
      alert(error instanceof Error ? error.message : t("team.scheduleFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    meetings,
    isLoading,
    dialogOpen,
    setDialogOpen,
    submitting,
    prefill,
    handleSchedule,
    handleSubmit,
    t,
  };
}
