"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useSession } from "next-auth/react";
import type { TeamMemberItem } from "@/lib/collaboration/types/team";
import {
  COLLAB_CHANNELS_KEY,
  COLLAB_MEETINGS_KEY,
  TEAM_MEMBERS_KEY,
  useCollaborationBootstrap,
} from "@/lib/collaboration/client/collaboration-provider";
import {
  fetchCollaborationChannels,
  fetchMeetings,
  fetchMemberMeetings,
  openDirectMessage,
  postChannelMeeting,
} from "@/lib/collaboration/actions/fetch";
import { fetchTeamMembers } from "@/lib/collaboration/actions/team";
import type { NewMeetingDraft } from "@/app/collaboration/_components/NewMeetingPanel";
import { addDays, startOfMondayWeek } from "@/app/collaboration/_lib/calendar-utils";
import { dateLocale, useT } from "@/lib/i18n";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";

export function memberMeetingsKey(userId: string) {
  return `member-meetings:${userId}`;
}

export function roleLabel(member: TeamMemberItem, t: (key: string) => string) {
  if (member.position) return member.position;
  if (member.role === "ADMIN") return t("admin.roleAdmin");
  if (member.role === "EDITOR") return t("admin.roleEditor");
  if (member.role === "DESIGNER") return t("admin.roleEditor");
  return t("admin.roleViewer");
}

export function useTeamCalendarWorkspace(
  selectedMemberId: string | null,
  onSelectMember: (userId: string) => void
) {
  const { data: session } = useSession();
  const { t, locale } = useT();
  const loc = dateLocale(locale);
  const isMobile = useIsMobile();
  const bootstrap = useCollaborationBootstrap();
  const { mutate: mutateGlobal } = useSWRConfig();

  const now = new Date();
  const [view, setView] = useState<"week" | "month">("week");
  const [anchor, setAnchor] = useState(now);
  const [selectedDate, setSelectedDate] = useState(now);
  const [panelOpen, setPanelOpen] = useState(false);
  const [slotHour, setSlotHour] = useState(10);
  const [prefillStart, setPrefillStart] = useState<Date | null>(null);
  const [prefillEnd, setPrefillEnd] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: members = [] } = useSWR(TEAM_MEMBERS_KEY, fetchTeamMembers, {
    fallbackData: bootstrap?.members,
    revalidateOnMount: !bootstrap,
  });
  const { data: channels = [] } = useSWR(
    COLLAB_CHANNELS_KEY,
    fetchCollaborationChannels,
    { fallbackData: bootstrap?.channels, revalidateOnMount: !bootstrap }
  );

  const currentUserId = session?.user?.id;
  const selected =
    members.find((m) => m.id === selectedMemberId) ??
    members.find((m) => m.id === currentUserId) ??
    members[0] ??
    null;

  useEffect(() => {
    if (!selectedMemberId && selected) onSelectMember(selected.id);
  }, [onSelectMember, selected, selectedMemberId]);

  // Treat as self when currentUserId is not yet known (session loading) so we
  // can use bootstrap?.meetings as fallbackData and avoid a loading flash.
  const isSelf = !currentUserId || selected?.id === currentUserId;
  const meetingsKey = selected
    ? isSelf ? COLLAB_MEETINGS_KEY : memberMeetingsKey(selected.id)
    : null;

  const { data: meetings = [], isLoading } = useSWR(
    meetingsKey,
    () =>
      selected
        ? selected.id === currentUserId ? fetchMeetings() : fetchMemberMeetings(selected.id)
        : Promise.resolve([]),
    {
      fallbackData: isSelf ? bootstrap?.meetings : undefined,
      refreshInterval: 15000,
      // Don't keep showing previous key's data while fetching new key —
      // this causes "test" meeting from self to bleed into other members' views.
      keepPreviousData: false,
    }
  );

  const memberIds = members.map((m) => m.id).sort().join(",");
  const { data: meetingsByMemberId = {} } = useSWR(
    panelOpen && memberIds ? `member-meetings-all:${memberIds}` : null,
    async () => {
      const entries = await Promise.all(
        members.map(async (member) => {
          const list =
            member.id === currentUserId
              ? await fetchMeetings()
              : await fetchMemberMeetings(member.id);
          return [member.id, list] as const;
        })
      );
      return Object.fromEntries(entries);
    },
    { revalidateOnFocus: false }
  );

  const weekStart = startOfMondayWeek(anchor);
  const monthName = selectedDate.toLocaleDateString(loc, { month: "long" });
  const eventsThisMonth = meetings.filter((meeting) => {
    const d = new Date(meeting.startsAt);
    return d.getMonth() === anchor.getMonth() && d.getFullYear() === anchor.getFullYear();
  }).length;

  const defaultAttendeeIds = useMemo(() => {
    const ids = new Set<string>();
    if (currentUserId) ids.add(currentUserId);
    if (selected?.id) ids.add(selected.id);
    return [...ids];
  }, [currentUserId, selected?.id]);

  const openPanelFor = (start: Date, end: Date) => {
    setSelectedDate(start);
    setSlotHour(start.getHours());
    setPrefillStart(new Date(start));
    setPrefillEnd(new Date(end));
    setPanelOpen(true);
  };

  const updatePanelRange = (start: Date, end: Date) => {
    setPrefillStart(new Date(start));
    setPrefillEnd(new Date(end));
  };

  const clearPanelRange = () => {
    setPrefillStart(null);
    setPrefillEnd(null);
  };

  const navigate = (dir: -1 | 1) => {
    if (view === "week") {
      const next = addDays(weekStart, dir * 7);
      setAnchor(next);
      setSelectedDate(next);
      return;
    }
    const next = new Date(anchor.getFullYear(), anchor.getMonth() + dir, 1);
    setAnchor(next);
    setSelectedDate(next);
  };

  const handleSubmit = async (draft: NewMeetingDraft) => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const others = draft.attendeeIds.filter((id) => id !== currentUserId);
      const teamChannel = channels.find((c) => c.kind === "team");
      let channelId = teamChannel?.id;
      if (others.length === 1) {
        channelId = (await openDirectMessage(others[0])).id;
      } else if (!channelId && others[0]) {
        channelId = (await openDirectMessage(others[0])).id;
      }
      if (!channelId) throw new Error(t("team.scheduleFailed"));

      await postChannelMeeting(channelId, {
        title: draft.title,
        meetUrl: "",
        startsAt: draft.startsAt.toISOString(),
        endsAt: draft.endsAt.toISOString(),
        notes: draft.notes,
        kind: draft.kind,
      });

      setPanelOpen(false);
      if (meetingsKey) void mutateGlobal(meetingsKey);
      void mutateGlobal(COLLAB_MEETINGS_KEY);
      void mutateGlobal(COLLAB_CHANNELS_KEY);
      if (selected.id) void mutateGlobal(memberMeetingsKey(selected.id));
    } catch (error) {
      alert(error instanceof Error ? error.message : t("team.scheduleFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const resolvedMeetingsByMemberId =
    Object.keys(meetingsByMemberId).length
      ? meetingsByMemberId
      : selected ? { [selected.id]: meetings } : {};

  return {
    // data
    members,
    selected,
    meetings,
    isLoading,
    meetingsByMemberId: resolvedMeetingsByMemberId,
    defaultAttendeeIds,
    // view
    view,
    setView,
    anchor,
    weekStart,
    selectedDate,
    monthName,
    eventsThisMonth,
    currentUserId,
    isSelf,
    isMobile,
    // panel
    panelOpen,
    setPanelOpen,
    prefillStart,
    prefillEnd,
    slotHour,
    submitting,
    // actions
    navigate,
    openPanelFor,
    updatePanelRange,
    clearPanelRange,
    handleSubmit,
    // i18n
    t,
    loc,
    locale,
    roleLabel: (member: TeamMemberItem) => roleLabel(member, t),
  };
}
