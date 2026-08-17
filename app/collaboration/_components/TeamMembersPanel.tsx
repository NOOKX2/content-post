"use client";

import { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { CalendarDays, Users } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { PersonAvatar } from "@/app/collaboration/_components/PersonAvatar";
import { MemberCalendarView } from "@/app/collaboration/_components/MemberCalendarView";
import {
  fetchTeamMembers,
  updateTeamMemberRole,
} from "@/lib/collaboration/actions/team";
import {
  TEAM_ROLES,
  isAdminRole,
  toAssignableRole,
} from "@/lib/auth/domain/roles";
import {
  TEAM_MEMBERS_KEY,
  useCollaborationBootstrap,
} from "@/lib/collaboration/client/collaboration-provider";
import type { Role } from "@prisma/client";
import type { TeamMemberItem } from "@/lib/collaboration/types/team";
import { useT } from "@/lib/i18n";

export function TeamMembersPanel() {
  const { data: session } = useSession();
  const bootstrap = useCollaborationBootstrap();
  const { data: members = [], mutate, isLoading } = useSWR(
    TEAM_MEMBERS_KEY,
    fetchTeamMembers,
    {
      fallbackData: bootstrap?.members,
      revalidateOnMount: !bootstrap,
    }
  );
  const { t } = useT();
  const canEditRoles = isAdminRole(session?.user?.role);
  const roleOptions = TEAM_ROLES.map((role) => ({
    value: role,
    label:
      role === "ADMIN"
        ? t("admin.roleAdmin")
        : role === "EDITOR"
          ? t("admin.roleEditor")
          : t("admin.roleViewer"),
  }));
  const [calendarMember, setCalendarMember] = useState<TeamMemberItem | null>(
    null
  );

  const updateRole = async (userId: string, role: Role) => {
    try {
      await updateTeamMemberRole(userId, role);
      await mutate();
    } catch (error) {
      alert(error instanceof Error ? error.message : t("team.updateRoleFailed"));
    }
  };

  if (calendarMember) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <MemberCalendarView
          userId={calendarMember.id}
          memberName={calendarMember.name}
          onBack={() => setCalendarMember(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="border-b border-stone-200 px-5 py-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-stone-500" />
          <h2 className="text-sm font-semibold text-stone-900">
            {t("team.memberList")}
          </h2>
        </div>
        <p className="mt-1 text-xs text-stone-500">
          {t("team.memberListHint")}
          {canEditRoles ? "" : t("team.memberListHintReadonly")}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <p className="text-sm text-stone-400">{t("common.loading")}</p>
        ) : members.length === 0 ? (
          <p className="rounded-lg border border-dashed border-stone-200 py-8 text-center text-sm text-stone-400">
            {t("team.noMembers")}
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-stone-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-left text-stone-600">
                  <th className="px-4 py-3 font-medium">{t("common.name")}</th>
                  <th className="px-4 py-3 font-medium">{t("common.email")}</th>
                  <th className="px-4 py-3 font-medium">{t("common.role")}</th>
                  <th className="px-4 py-3 font-medium">{t("team.viewCalendar")}</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-t border-stone-100">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setCalendarMember(member)}
                        className="flex items-center gap-3 text-left transition-colors hover:text-blue-700"
                        title={t("team.viewCalendarOf", { name: member.name })}
                      >
                        <PersonAvatar name={member.name} size="md" />
                        <span className="font-medium text-stone-900">
                          {member.name}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{member.email}</td>
                    <td className="px-4 py-3">
                      {canEditRoles ? (
                        <Select
                          options={roleOptions}
                          value={toAssignableRole(member.role)}
                          onChange={(e) =>
                            void updateRole(member.id, e.target.value as Role)
                          }
                          className="h-9 max-w-40"
                        />
                      ) : (
                        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                          {roleOptions.find(
                            (item) => item.value === toAssignableRole(member.role)
                          )?.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setCalendarMember(member)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 hover:text-blue-700"
                      >
                        <CalendarDays className="h-3.5 w-3.5" />
                        {t("team.viewCalendar")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
