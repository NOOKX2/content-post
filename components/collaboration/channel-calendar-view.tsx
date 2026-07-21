"use client";

import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { ArrowLeft, Users } from "lucide-react";
import {
  fetchChannelMeetings,
  postChannelMeeting,
} from "@/lib/collaboration/fetch-actions";
import { MeetingsWeekCalendar } from "@/components/collaboration/meetings-week-calendar";
import {
  ScheduleMeetingDialog,
  type MeetingDraft,
} from "@/components/collaboration/schedule-meeting-dialog";
import { Button } from "@/components/ui/button";

export function ChannelCalendarView({
  channelId,
  channelName,
  channelKind,
  onBack,
}: {
  channelId: string;
  channelName: string;
  channelKind: "team" | "group";
  onBack: () => void;
}) {
  const { mutate: mutateGlobal } = useSWRConfig();
  const {
    data: meetings = [],
    isLoading,
    mutate,
  } = useSWR(`channel-meetings:${channelId}`, () =>
    fetchChannelMeetings(channelId), {
    refreshInterval: 15000,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [prefill, setPrefill] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(),
  });

  const title =
    channelKind === "team"
      ? `ปฏิทิน${channelName}`
      : `ปฏิทินกลุ่ม ${channelName}`;
  const subtitle =
    channelKind === "team"
      ? "นัดประชุมทีมในห้องนี้ — เลือกช่วงเวลาที่ว่าง"
      : "นัดประชุมกลุ่มในห้องนี้ — เลือกช่วงเวลาที่ว่าง";

  const handleSchedule = (next: { start: Date; end: Date }) => {
    setPrefill(next);
    setDialogOpen(true);
  };

  const handleSubmit = async (draft: MeetingDraft) => {
    setSubmitting(true);
    try {
      await postChannelMeeting(channelId, {
        title: draft.title,
        meetUrl: draft.meetUrl,
        startsAt: draft.startsAt,
        endsAt: draft.endsAt,
      });
      setDialogOpen(false);
      await mutate();
      void mutateGlobal("collab-meetings");
      void mutateGlobal("collab-channels");
      void mutateGlobal(`collab-messages:${channelId}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "นัดประชุมไม่สำเร็จ");
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
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4" />
                กลับ
              </Button>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                <Users className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <span className="block truncate text-sm font-semibold text-stone-900">
                  {title}
                </span>
                <span className="block truncate text-[11px] font-normal text-stone-500">
                  {subtitle}
                </span>
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
