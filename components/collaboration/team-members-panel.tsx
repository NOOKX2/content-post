"use client";

import { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { CalendarDays, Users } from "lucide-react";
import { Select } from "@/components/ui/select";
import { PersonAvatar } from "@/components/collaboration/person-avatar";
import { MemberCalendarView } from "@/components/collaboration/member-calendar-view";
import {
  fetchTeamMembers,
  updateTeamMemberRole,
} from "@/lib/collaboration/team-actions";
import { ROLE_LABELS, TEAM_ROLES, isAdminRole } from "@/lib/auth/roles";
import type { TeamMemberItem } from "@/lib/collaboration/team-types";
import type { Role } from "@prisma/client";

export function TeamMembersPanel() {
  const { data: session } = useSession();
  const { data: members = [], mutate, isLoading } = useSWR(
    "team-members",
    fetchTeamMembers
  );
  const canEditRoles = isAdminRole(session?.user?.role);
  const [calendarMember, setCalendarMember] = useState<TeamMemberItem | null>(
    null
  );

  const updateRole = async (userId: string, role: Role) => {
    try {
      await updateTeamMemberRole(userId, role);
      await mutate();
    } catch (error) {
      alert(error instanceof Error ? error.message : "อัปเดตบทบาทไม่สำเร็จ");
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
          <h2 className="text-sm font-semibold text-stone-900">รายชื่อสมาชิก</h2>
        </div>
        <p className="mt-1 text-xs text-stone-500">
          กำหนดบทบาท Admin, Editor, Designer หรือ Creator
          {canEditRoles ? "" : " — เฉพาะ Admin ที่เปลี่ยนบทบาทได้"}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <p className="text-sm text-stone-400">กำลังโหลด...</p>
        ) : members.length === 0 ? (
          <p className="rounded-lg border border-dashed border-stone-200 py-8 text-center text-sm text-stone-400">
            ยังไม่มีสมาชิก
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-stone-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-left text-stone-600">
                  <th className="px-4 py-3 font-medium">ชื่อ</th>
                  <th className="px-4 py-3 font-medium">อีเมล</th>
                  <th className="px-4 py-3 font-medium">บทบาท</th>
                  <th className="px-4 py-3 font-medium">ปฏิทิน</th>
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
                        title={`ดูปฏิทินของ ${member.name}`}
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
                          options={TEAM_ROLES.map((role) => ({
                            value: role,
                            label: ROLE_LABELS[role],
                          }))}
                          value={member.role}
                          onChange={(e) =>
                            void updateRole(member.id, e.target.value as Role)
                          }
                          className="h-9 max-w-[160px]"
                        />
                      ) : (
                        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                          {ROLE_LABELS[member.role]}
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
                        ดูปฏิทิน
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
