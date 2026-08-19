"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import type { TaskStatus } from "@prisma/client";
import type { TeamMemberItem } from "@/lib/collaboration/types/team";
import {
  createTeamTask,
  deleteTeamTask,
  fetchTeamMembers,
  fetchTeamTasks,
  updateTeamTask,
} from "@/lib/collaboration/actions/team";
import {
  TEAM_MEMBERS_KEY,
  TEAM_TASKS_ALL_KEY,
  useCollaborationBootstrap,
} from "@/lib/collaboration/client/collaboration-provider";
import { useT } from "@/lib/i18n";

export function assigneeOptions(
  members: TeamMemberItem[],
  unavailableLabel: string,
  keepId?: string | null
) {
  return members
    .filter((m) => !m.busy || m.id === keepId)
    .map((m) => ({
      value: m.id,
      label: m.busy ? `${m.name} (${unavailableLabel})` : m.name,
    }));
}

export function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDaysIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function useTeamTasksPanel(contentId?: string) {
  const { t } = useT();
  const bootstrap = useCollaborationBootstrap();
  const unavailable = t("profile.unavailable");
  const tasksKey = contentId ? `team-tasks:content:${contentId}` : TEAM_TASKS_ALL_KEY;

  const { data: tasks = [], mutate, isLoading } = useSWR(
    tasksKey,
    () => fetchTeamTasks({ contentId }),
    {
      fallbackData: contentId ? undefined : bootstrap?.tasks,
      revalidateOnMount: Boolean(contentId) || !bootstrap,
    }
  );
  const { data: members = [] } = useSWR(TEAM_MEMBERS_KEY, fetchTeamMembers, {
    fallbackData: bootstrap?.members,
    revalidateOnMount: !bootstrap,
  });

  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const activeTasks = useMemo(
    () => tasks.filter((task) => task.status !== "done"),
    [tasks]
  );

  const workload = useMemo(
    () =>
      members.map((member) => ({
        member,
        activeCount: activeTasks.filter((t) => t.assigneeId === member.id).length,
        busy: activeTasks.filter((t) => t.assigneeId === member.id).length > 0,
      })),
    [members, activeTasks]
  );

  const resetForm = () => {
    setTitle("");
    setAssigneeId("");
    setDueDate("");
  };

  const create = async (): Promise<boolean> => {
    if (!title.trim() || submitting) return false;
    setSubmitting(true);
    try {
      await createTeamTask({ title, contentId: contentId || null, assigneeId: assigneeId || null, dueDate });
      resetForm();
      await mutate();
      return true;
    } catch (error) {
      alert(error instanceof Error ? error.message : "สร้างงานไม่สำเร็จ");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const patchTask = async (
    id: string,
    payload: Partial<{ status: TaskStatus; assigneeId: string | null }>
  ) => {
    try {
      await updateTeamTask(id, payload);
      await mutate();
    } catch (error) {
      alert(error instanceof Error ? error.message : "อัปเดตงานไม่สำเร็จ");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("ลบงานนี้?")) return;
    try {
      await deleteTeamTask(id);
      await mutate();
    } catch (error) {
      alert(error instanceof Error ? error.message : "ลบงานไม่สำเร็จ");
    }
  };

  return {
    // data
    tasks,
    activeTasks,
    members,
    workload,
    isLoading,
    unavailable,
    // form
    title,
    setTitle,
    assigneeId,
    setAssigneeId,
    dueDate,
    setDueDate,
    submitting,
    resetForm,
    // actions
    create,
    patchTask,
    remove,
  };
}
