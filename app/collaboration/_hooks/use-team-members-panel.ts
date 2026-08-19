"use client";

import { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { isAdminRole, TEAM_ROLES, toAssignableRole } from "@/lib/auth/domain/roles";
import {
  fetchTeamMembers,
  updateTeamMemberRole,
} from "@/lib/collaboration/actions/team";
import {
  TEAM_MEMBERS_KEY,
  useCollaborationBootstrap,
} from "@/lib/collaboration/client/collaboration-provider";
import type { Role } from "@prisma/client";
import type { TeamMemberItem } from "@/lib/collaboration/types/team";
import { useT } from "@/lib/i18n";

export function useTeamMembersPanel() {
  const { data: session } = useSession();
  const bootstrap = useCollaborationBootstrap();
  const { t } = useT();

  const { data: members = [], mutate, isLoading } = useSWR(
    TEAM_MEMBERS_KEY,
    fetchTeamMembers,
    { fallbackData: bootstrap?.members, revalidateOnMount: !bootstrap }
  );

  const canEditRoles = isAdminRole(session?.user?.role);
  const roleOptions = TEAM_ROLES.map((role) => ({
    value: role,
    label:
      role === "ADMIN" ? t("admin.roleAdmin")
      : role === "EDITOR" ? t("admin.roleEditor")
      : t("admin.roleViewer"),
  }));

  const [calendarMember, setCalendarMember] = useState<TeamMemberItem | null>(null);

  const updateRole = async (userId: string, role: Role) => {
    try {
      await updateTeamMemberRole(userId, role);
      await mutate();
    } catch (error) {
      alert(error instanceof Error ? error.message : t("team.updateRoleFailed"));
    }
  };

  return {
    members,
    isLoading,
    canEditRoles,
    roleOptions,
    calendarMember,
    setCalendarMember,
    updateRole,
    toAssignableRole,
    t,
  };
}
