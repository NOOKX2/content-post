"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import {
  isAdminRole,
  TEAM_ROLES,
  toAssignableRole,
  type AssignableRole,
} from "@/lib/auth/domain/roles";
import {
  fetchTeamMembers,
  fetchTeamTasks,
  updateTeamMemberRole,
} from "@/lib/collaboration/actions/team";
import {
  TEAM_MEMBERS_KEY,
  TEAM_TASKS_ALL_KEY,
  useCollaborationBootstrap,
} from "@/lib/collaboration/client/collaboration-provider";
import type { Role } from "@prisma/client";
import type { TeamMemberItem } from "@/lib/collaboration/types/team";
import { dateLocale, useT } from "@/lib/i18n";

export function useTeamMembersPanel() {
  const { data: session } = useSession();
  const bootstrap = useCollaborationBootstrap();
  const { t, locale } = useT();
  const loc = dateLocale(locale);

  const { data: members = [], mutate, isLoading } = useSWR(
    TEAM_MEMBERS_KEY,
    fetchTeamMembers,
    { fallbackData: bootstrap?.members, revalidateOnMount: !bootstrap }
  );

  const { data: tasks = [] } = useSWR(TEAM_TASKS_ALL_KEY, () => fetchTeamTasks(), {
    fallbackData: bootstrap?.tasks,
    revalidateOnMount: !bootstrap,
  });

  const canEditRoles = isAdminRole(session?.user?.role);
  const roleOptions = TEAM_ROLES.map((role) => ({
    value: role,
    label:
      role === "ADMIN" ? t("admin.roleAdmin")
      : role === "EDITOR" ? t("admin.roleEditor")
      : t("admin.roleViewer"),
  }));

  const [calendarMember, setCalendarMember] = useState<TeamMemberItem | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<AssignableRole | null>(null);

  const taskStatsByMember = useMemo(() => {
    const map = new Map<string, { total: number; done: number }>();
    for (const task of tasks) {
      if (!task.assigneeId) continue;
      const current = map.get(task.assigneeId) ?? { total: 0, done: 0 };
      current.total += 1;
      if (task.status === "done") current.done += 1;
      map.set(task.assigneeId, current);
    }
    return map;
  }, [tasks]);

  const roleCounts = useMemo(() => {
    const counts = { ADMIN: 0, EDITOR: 0, USER: 0 };
    for (const member of members) {
      counts[toAssignableRole(member.role)] += 1;
    }
    return counts;
  }, [members]);

  const filteredMembers = useMemo(() => {
    let list = members;
    if (roleFilter) {
      list = list.filter((member) => toAssignableRole(member.role) === roleFilter);
    }
    const trimmed = query.trim().toLowerCase();
    if (trimmed) {
      list = list.filter(
        (member) =>
          member.name.toLowerCase().includes(trimmed) ||
          member.email.toLowerCase().includes(trimmed) ||
          member.position.toLowerCase().includes(trimmed)
      );
    }
    return list;
  }, [members, query, roleFilter]);

  const lastJoinedMember = useMemo(() => {
    if (members.length === 0) return null;
    return members.reduce((latest, member) =>
      new Date(member.createdAt).getTime() > new Date(latest.createdAt).getTime()
        ? member
        : latest
    );
  }, [members]);

  const lastJoinedLabel = lastJoinedMember
    ? new Date(lastJoinedMember.createdAt).toLocaleDateString(loc, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const toggleRoleFilter = (role: AssignableRole) => {
    setRoleFilter((current) => (current === role ? null : role));
  };

  const updateRole = async (userId: string, role: Role) => {
    try {
      await updateTeamMemberRole(userId, role);
      await mutate();
    } catch (error) {
      alert(error instanceof Error ? error.message : t("team.updateRoleFailed"));
    }
  };

  return {
    members: filteredMembers,
    memberCount: members.length,
    isLoading,
    canEditRoles,
    roleOptions,
    roleCounts,
    roleFilter,
    toggleRoleFilter,
    query,
    setQuery,
    taskStatsByMember,
    lastJoinedLabel,
    calendarMember,
    setCalendarMember,
    updateRole,
    toAssignableRole,
    t,
    loc,
  };
}
