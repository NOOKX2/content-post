"use client";

import { ChevronLeft, ChevronRight, MessageCircle, Plus } from "lucide-react";
import { useTeamCalendarWorkspace } from "@/app/collaboration/_hooks/use-team-calendar-workspace";
import { PersonAvatar } from "@/app/collaboration/_components/PersonAvatar";
import { TeamWeekGrid } from "@/app/collaboration/_components/TeamWeekGrid";
import { TeamMonthGrid } from "@/app/collaboration/_components/TeamMonthGrid";
import { NewMeetingPanel } from "@/app/collaboration/_components/NewMeetingPanel";
import { firstName, formatWeekRange } from "@/app/collaboration/_lib/calendar-utils";
import { cn } from "@/lib/shared/utils";

export function TeamCalendarWorkspace({
  selectedMemberId,
  onSelectMember,
  onMessageMember,
}: {
  selectedMemberId: string | null;
  onSelectMember: (userId: string) => void;
  onMessageMember: (userId: string) => void;
}) {
  const {
    members,
    selected,
    meetings,
    isLoading,
    meetingsByMemberId,
    defaultAttendeeIds,
    view, setView,
    anchor,
    weekStart,
    selectedDate,
    monthName,
    eventsThisMonth,
    isMobile,
    panelOpen, setPanelOpen,
    prefillStart, prefillEnd,
    submitting,
    navigate,
    openPanelFor,
    handleSubmit,
    t, loc,
    roleLabel,
  } = useTeamCalendarWorkspace(selectedMemberId, onSelectMember);

  if (!selected) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-stone-500">
        {t("team.noMembers")}
      </div>
    );
  }

  const showPanel = panelOpen && !isMobile;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 bg-white">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-3 border-b border-stone-200 bg-white px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
            {members.map((member) => {
              const active = member.id === selected.id;
              return (
                <button
                  key={member.id}
                  type="button"
                  title={member.name}
                  onClick={() => onSelectMember(member.id)}
                  className={cn(
                    "rounded-full p-0.5",
                    active && "ring-2 ring-blue-600 ring-offset-2 ring-offset-white"
                  )}
                >
                  <PersonAvatar
                    name={member.name}
                    imageUrl={member.imageUrl}
                    size="lg"
                    letters={2}
                  />
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-36 text-center text-sm font-semibold text-stone-900">
                {view === "week"
                  ? formatWeekRange(weekStart, loc)
                  : anchor.toLocaleDateString(loc, { month: "long", year: "numeric" })}
              </span>
              <button
                type="button"
                onClick={() => navigate(1)}
                className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex rounded-lg bg-stone-100 p-0.5">
              {(["week", "month"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setView(item)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-semibold",
                    view === item
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-500 hover:text-stone-800"
                  )}
                >
                  {item === "week" ? t("team.week") : t("team.month")}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                const start = new Date(selectedDate);
                start.setHours(10, 0, 0, 0);
                const end = new Date(start);
                end.setMinutes(end.getMinutes() + 60);
                openPanelFor(start, end);
              }}
              className="inline-flex h-9 items-center gap-1 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5" />
              {t("team.newMeetingAction")}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-stone-200 bg-white px-5 py-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-semibold text-stone-900">
                {selected.name}
              </h2>
              <span className="text-sm text-stone-500">
                {roleLabel(selected)}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  selected.busy
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700"
                )}
              >
                {selected.busy ? t("team.busyNow") : t("team.online")}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {!isSelf ? (
              <button
                type="button"
                onClick={() => onMessageMember(selected.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {t("team.messageMember", { name: firstName(selected.name) })}
              </button>
            ) : null}
            <span className="text-xs text-stone-500">
              {t("team.eventsInMonth", { count: eventsThisMonth, month: monthName })}

            </span>
          </div>
        </div>

        {isLoading ? (
          <p className="py-16 text-center text-sm text-stone-500">{t("common.loading")}</p>
        ) : view === "week" ? (
          <TeamWeekGrid
            weekStart={weekStart}
            meetings={meetings}
            selectedDate={selectedDate}
            onSelectSlot={(range) => openPanelFor(range.start, range.end)}
          />
        ) : (
          <TeamMonthGrid
            year={anchor.getFullYear()}
            month={anchor.getMonth()}
            meetings={meetings}
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              const start = new Date(date);
              start.setHours(slotHour, 0, 0, 0);
              const end = new Date(start);
              end.setMinutes(end.getMinutes() + 60);
              openPanelFor(start, end);
            }}
          />
        )}
      </div>

      {showPanel ? (
        <NewMeetingPanel
          selectedDate={selectedDate}
          prefillStart={prefillStart}
          prefillEnd={prefillEnd}
          members={members}
          currentUserId={currentUserId}
          defaultAttendeeIds={defaultAttendeeIds}
          meetingsByMemberId={
            Object.keys(meetingsByMemberId).length
              ? meetingsByMemberId
              : selected
                ? { [selected.id]: meetings }
                : {}
          }
          submitting={submitting}
          onClose={() => setPanelOpen(false)}
          onSubmit={(draft) => void handleSubmit(draft)}
        />
      ) : null}

      {panelOpen && isMobile ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
          <NewMeetingPanel
            selectedDate={selectedDate}
            prefillStart={prefillStart}
            prefillEnd={prefillEnd}
            members={members}
            currentUserId={currentUserId}
            defaultAttendeeIds={defaultAttendeeIds}
            meetingsByMemberId={
              Object.keys(meetingsByMemberId).length
                ? meetingsByMemberId
                : selected
                  ? { [selected.id]: meetings }
                  : {}
            }
            submitting={submitting}
            onClose={() => setPanelOpen(false)}
            onSubmit={(draft) => void handleSubmit(draft)}
          />
        </div>
      ) : null}
    </div>
  );
}
