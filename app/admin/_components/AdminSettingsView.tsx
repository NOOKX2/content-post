"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import {
  ChevronRight,
  HelpCircle,
  MoreVertical,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PersonAvatar } from "@/app/collaboration/_components/PersonAvatar";
import { UserAvatar } from "@/components/layout/UserMenu";
import {
  createAdminUser,
  fetchTeamMembers,
  removeAdminUser,
  updateTeamMemberRole,
} from "@/lib/collaboration/actions/team";
import {
  TEAM_MEMBER_LIMIT,
  TEAM_ROLES,
  toAssignableRole,
  type AssignableRole,
} from "@/lib/auth/domain/roles";
import type { TeamMemberItem } from "@/lib/collaboration/types/team";
import { useT } from "@/lib/i18n";
import { adminUserSchema } from "@/lib/content/domain/form-schema";
import { cn } from "@/lib/shared/utils";
import type { Role } from "@prisma/client";

function roleKey(role: Role) {
  const level = toAssignableRole(role);
  if (level === "ADMIN") return "admin.roleAdmin";
  if (level === "EDITOR") return "admin.roleEditor";
  return "admin.roleViewer";
}

function roleBadgeClass(role: Role) {
  const level = toAssignableRole(role);
  if (level === "ADMIN") return "bg-amber-100 text-amber-800";
  if (level === "EDITOR") return "bg-sky-100 text-sky-800";
  return "bg-stone-100 text-stone-600";
}

function formatContact(member: TeamMemberItem) {
  const phone = member.phone
    ? `${member.phoneCountry || "+66"}${member.phone}`
    : "";
  if (member.email && phone) return `${member.email} ${phone}`;
  return member.email || phone || "—";
}

export function AdminSettingsView() {
  const { data: session } = useSession();
  const { t } = useT();
  const { data: members = [], mutate, isLoading } = useSWR(
    "team-members",
    fetchTeamMembers
  );
  const [query, setQuery] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const addUserForm = useForm({
    resolver: zodResolver(adminUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER" as AssignableRole,
    },
  });

  const currentUserId = session?.user?.id;
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return members.filter((member) => {
      if (!keyword) return true;
      return (
        member.name.toLowerCase().includes(keyword) ||
        member.email.toLowerCase().includes(keyword) ||
        member.position.toLowerCase().includes(keyword)
      );
    });
  }, [members, query]);

  const resetForm = () => {
    setAdding(false);
    setError("");
    addUserForm.reset();
  };

  const handleCreate = addUserForm.handleSubmit(async (values) => {
    setError("");
    try {
      await createAdminUser(values);
      await mutate();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    }
  });

  const handleRole = async (userId: string, nextRole: Role) => {
    try {
      await updateTeamMemberRole(userId, nextRole);
      await mutate();
      setMenuId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : t("common.error"));
    }
  };

  const handleDelete = async (member: TeamMemberItem) => {
    if (!confirm(t("admin.confirmDelete", { name: member.name }))) return;
    try {
      await removeAdminUser(member.id);
      await mutate();
      setMenuId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : t("common.error"));
    }
  };

  const roleOptions = TEAM_ROLES.map((item) => ({
    value: item,
    label: t(roleKey(item)),
  }));

  return (
    <>
      <Header session={session} title={t("nav.adminSettings")} compact />
      <div className="space-y-6 px-4 py-5 sm:px-6 md:px-8 md:py-8">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-stone-700" />
            <h1 className="text-2xl font-bold text-stone-900">
              {t("admin.settingsTitle")}{" "}
              <span className="text-lg font-semibold text-amber-800">
                {t("admin.settingsAdmin")}
              </span>
            </h1>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-stone-500">
            {t("admin.settingsCrumb")}
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-stone-700">
              {t("admin.manageTeam")}
            </span>
          </p>
        </div>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">
                {t("admin.users")} ({members.length})
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                {t("admin.seatUsage", {
                  used: members.length,
                  limit: TEAM_MEMBER_LIMIT,
                })}
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setAdding(true)}
              disabled={members.length >= TEAM_MEMBER_LIMIT}
              className="bg-stone-900 shadow-none hover:bg-stone-800"
            >
              <Plus className="h-4 w-4" />
              {t("admin.addUser")}
            </Button>
          </div>

          <div className="relative mt-5 max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("admin.searchUsers")}
              className="pl-9"
            />
          </div>

          {adding && (
            <form
              onSubmit={handleCreate}
              className="mt-5 grid gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 md:grid-cols-2 xl:grid-cols-4"
            >
              <Input
                label={t("admin.username")}
                error={addUserForm.formState.errors.name?.message}
                {...addUserForm.register("name")}
              />
              <Input
                label={t("auth.email")}
                type="email"
                error={addUserForm.formState.errors.email?.message}
                {...addUserForm.register("email")}
              />
              <Input
                label={t("admin.tempPassword")}
                type="password"
                error={addUserForm.formState.errors.password?.message}
                {...addUserForm.register("password")}
              />
              <Select
                label={t("admin.roleColumn")}
                options={roleOptions}
                {...addUserForm.register("role")}
              />
              {error && (
                <p className="text-sm text-red-600 md:col-span-2 xl:col-span-4">
                  {error}
                </p>
              )}
              <div className="flex gap-2 md:col-span-2 xl:col-span-4">
                <Button type="submit" disabled={addUserForm.formState.isSubmitting}>
                  {addUserForm.formState.isSubmitting
                    ? t("common.saving")
                    : t("admin.addUser")}
                </Button>
                <Button type="button" variant="ghost" onClick={resetForm}>
                  {t("common.cancel")}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-5 overflow-x-auto">
            {isLoading ? (
              <p className="py-10 text-center text-sm text-stone-400">
                {t("common.loading")}
              </p>
            ) : filtered.length === 0 ? (
              <p className="rounded-xl border border-dashed border-stone-200 py-10 text-center text-sm text-stone-400">
                {t("admin.emptyUsers")}
              </p>
            ) : (
              <table className="w-full min-w-180 text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500">
                    <th className="px-3 py-3 font-medium">{t("admin.username")}</th>
                    <th className="px-3 py-3 font-medium">
                      <span className="inline-flex items-center gap-1">
                        {t("admin.roleColumn")}
                        <HelpCircle className="h-3.5 w-3.5" />
                      </span>
                    </th>
                    <th className="px-3 py-3 font-medium">
                      {t("admin.connectionAccess")}
                    </th>
                    <th className="px-3 py-3 font-medium">{t("admin.contact")}</th>
                    <th className="px-3 py-3 font-medium">
                      <span className="inline-flex items-center gap-1">
                        {t("admin.workingHours")}
                        <HelpCircle className="h-3.5 w-3.5" />
                      </span>
                    </th>
                    <th className="w-10 px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((member) => {
                    const isYou = member.id === currentUserId;
                    return (
                      <tr
                        key={member.id}
                        className="border-b border-stone-100 last:border-0"
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            {member.imageUrl ? (
                              <UserAvatar
                                name={member.name}
                                imageUrl={member.imageUrl}
                                size="sm"
                              />
                            ) : (
                              <PersonAvatar name={member.name} size="lg" />
                            )}
                            <div className="min-w-0">
                              <p className="truncate font-medium text-stone-900">
                                {member.name}
                                {isYou ? (
                                  <span className="ml-1 text-xs font-normal text-stone-400">
                                    ({t("admin.you")})
                                  </span>
                                ) : null}
                              </p>
                              {member.position ? (
                                <p className="truncate text-xs text-stone-400">
                                  {member.position}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <Select
                            options={roleOptions}
                            value={toAssignableRole(member.role)}
                            onChange={(event) =>
                              void handleRole(
                                member.id,
                                event.target.value as Role
                              )
                            }
                            disabled={isYou}
                            className={cn(
                              "h-9 min-w-32 rounded-full border-0 px-3 font-medium",
                              roleBadgeClass(member.role)
                            )}
                          />
                        </td>
                        <td className="px-3 py-3 text-stone-600">
                          {t("admin.allAccounts")}
                        </td>
                        <td className="px-3 py-3 text-stone-600">
                          {formatContact(member)}
                        </td>
                        <td className="px-3 py-3 text-stone-600">
                          {t("admin.sameHours")}
                        </td>
                        <td className="relative px-3 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              setMenuId((current) =>
                                current === member.id ? null : member.id
                              )
                            }
                            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                            aria-label={t("admin.actions")}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {menuId === member.id && (
                            <div className="absolute top-10 right-3 z-20 min-w-40 rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
                              <button
                                type="button"
                                disabled={isYou}
                                onClick={() => void handleDelete(member)}
                                className={cn(
                                  "block w-full px-3 py-2 text-left text-sm hover:bg-red-50",
                                  isYou
                                    ? "cursor-not-allowed text-stone-300"
                                    : "text-red-600"
                                )}
                              >
                                {t("admin.deleteUser")}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
