"use client";

import Link from "next/link";
import {
  CalendarDays,
  Eye,
  Mail,
  Pencil,
  Plus,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { Select } from "@/components/ui/Select";
import { PersonAvatar } from "@/app/collaboration/_components/PersonAvatar";
import { MemberCalendarView } from "@/app/collaboration/_components/MemberCalendarView";
import { useTeamMembersPanel } from "@/app/collaboration/_hooks/use-team-members-panel";
import { toAssignableRole, type AssignableRole } from "@/lib/auth/domain/roles";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/shared/utils";
import type { Role } from "@prisma/client";

function RoleBadge({ role }: { role: Role }) {
  const { t } = useT();
  const level = toAssignableRole(role);
  const label =
    level === "ADMIN"
      ? t("admin.roleAdmin")
      : level === "EDITOR"
        ? t("admin.roleEditor")
        : t("admin.roleViewer");

  const className =
    level === "ADMIN"
      ? "bg-blue-50 text-blue-700"
      : level === "EDITOR"
        ? "bg-amber-50 text-amber-700"
        : "bg-stone-100 text-stone-600";

  const Icon = level === "ADMIN" ? Shield : level === "EDITOR" ? Pencil : Eye;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        className
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2.5} />
      {label}
    </span>
  );
}

function RoleFilterChip({
  role,
  count,
  active,
  onClick,
  label,
}: {
  role: AssignableRole;
  count: number;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  const tone =
    role === "ADMIN"
      ? active
        ? "bg-blue-100 text-blue-800 ring-1 ring-blue-200"
        : "bg-blue-50/80 text-blue-700 hover:bg-blue-100"
      : role === "EDITOR"
        ? active
          ? "bg-amber-100 text-amber-800 ring-1 ring-amber-200"
          : "bg-amber-50/80 text-amber-700 hover:bg-amber-100"
        : active
          ? "bg-stone-200 text-stone-800 ring-1 ring-stone-300"
          : "bg-stone-100 text-stone-600 hover:bg-stone-200/80";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-semibold transition",
        tone
      )}
    >
      {label} · {count}
    </button>
  );
}

export function TeamMembersPanel() {
  const {
    members,
    memberCount,
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
  } = useTeamMembersPanel();

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
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <div className="border-b border-stone-200 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <h2 className="text-base font-bold text-stone-900">
                {t("team.memberList")}
              </h2>
            </div>
            <p className="mt-1 text-xs text-stone-500">
              {t("team.memberListHint")}
              {canEditRoles ? "" : t("team.memberListHintReadonly")}
            </p>
          </div>
          {canEditRoles ? (
            <Link
              href="/admin/settings"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5" />
              {t("team.addMember")}
            </Link>
          ) : null}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("team.searchMembersPlaceholder")}
              className="h-10 w-full rounded-full border border-stone-200 bg-stone-50/80 pr-4 pl-9 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-500/15"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RoleFilterChip
              role="ADMIN"
              count={roleCounts.ADMIN}
              active={roleFilter === "ADMIN"}
              onClick={() => toggleRoleFilter("ADMIN")}
              label={t("admin.roleAdmin")}
            />
            <RoleFilterChip
              role="EDITOR"
              count={roleCounts.EDITOR}
              active={roleFilter === "EDITOR"}
              onClick={() => toggleRoleFilter("EDITOR")}
              label={t("admin.roleEditor")}
            />
            <RoleFilterChip
              role="USER"
              count={roleCounts.USER}
              active={roleFilter === "USER"}
              onClick={() => toggleRoleFilter("USER")}
              label={t("admin.roleViewer")}
            />
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {isLoading ? (
          <p className="text-sm text-stone-400">{t("common.loading")}</p>
        ) : members.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-200 py-10 text-center text-sm text-stone-400">
            {t("team.noMembers")}
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-stone-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/80 text-left text-xs font-semibold text-stone-500">
                  <th className="px-4 py-3">{t("common.name")}</th>
                  <th className="px-4 py-3">{t("common.email")}</th>
                  <th className="px-4 py-3">{t("common.role")}</th>
                  <th className="px-4 py-3">{t("team.memberWork")}</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const stats = taskStatsByMember.get(member.id);
                  return (
                    <tr
                      key={member.id}
                      className="border-t border-stone-100 transition-colors hover:bg-stone-50/60"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <PersonAvatar
                            name={member.name}
                            imageUrl={member.imageUrl}
                            size="md"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="truncate font-semibold text-stone-900">
                                {member.name}
                              </span>
                              {member.googleCalendarConnected ? (
                                <span
                                  className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700"
                                  title={t("team.googleCalendarConnected")}
                                >
                                  GCal
                                </span>
                              ) : null}
                              <button
                                type="button"
                                onClick={() => setCalendarMember(member)}
                                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                title={t("team.viewCalendarOf", { name: member.name })}
                                aria-label={t("team.viewCalendarOf", {
                                  name: member.name,
                                })}
                              >
                                <CalendarDays className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            {member.position ? (
                              <p className="truncate text-xs text-stone-500">
                                {member.position}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex max-w-full items-center gap-1.5 text-stone-600">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                          <span className="truncate">{member.email}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {canEditRoles ? (
                          <Select
                            options={roleOptions}
                            value={toAssignableRole(member.role)}
                            onChange={(e) =>
                              void updateRole(member.id, e.target.value as Role)
                            }
                            className="h-8 max-w-34 rounded-full border-stone-200 text-xs font-semibold"
                          />
                        ) : (
                          <RoleBadge role={member.role} />
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-stone-600">
                        {stats && stats.total > 0
                          ? t("team.memberTaskSummary", {
                              total: stats.total,
                              done: stats.done,
                            })
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {memberCount > 0 && lastJoinedLabel ? (
        <div className="border-t border-stone-100 px-5 py-3 text-center text-xs text-stone-500">
          {t("team.membersFooter", {
            count: memberCount,
            date: lastJoinedLabel,
          })}
        </div>
      ) : null}
    </div>
  );
}
