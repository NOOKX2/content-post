"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import type { TaskPriority, TaskStatus } from "@prisma/client";
import type { TaskItem, TeamMemberItem } from "@/lib/collaboration/types/team";
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

export type TaskStatusFilter = "all" | TaskStatus;

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

export function useTeamTasksPanel(
  contentId?: string,
  options?: { mineOnly?: boolean }
) {
  const { t } = useT();
  const bootstrap = useCollaborationBootstrap();
  const unavailable = t("profile.unavailable");
  const mineOnly = Boolean(options?.mineOnly);
  const tasksKey = contentId
    ? `team-tasks:content:${contentId}`
    : mineOnly
      ? "team-tasks:mine"
      : TEAM_TASKS_ALL_KEY;

  const { data: tasks = [], mutate, isLoading } = useSWR(
    tasksKey,
    () => fetchTeamTasks({ contentId, mine: mineOnly || undefined }),
    {
      fallbackData:
        contentId || mineOnly ? undefined : bootstrap?.tasks,
      revalidateOnMount: Boolean(contentId) || mineOnly || !bootstrap,
    }
  );
  const { data: members = [] } = useSWR(TEAM_MEMBERS_KEY, fetchTeamMembers, {
    fallbackData: bootstrap?.members,
    revalidateOnMount: !bootstrap,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>("all");
  const [memberFilter, setMemberFilter] = useState<string>("all");

  const statusCounts = useMemo(() => {
    const counts = { todo: 0, in_progress: 0, done: 0, total: tasks.length };
    for (const task of tasks) {
      counts[task.status] += 1;
    }
    return counts;
  }, [tasks]);

  const workload = useMemo(
    () =>
      members.map((member) => {
        const memberTasks = tasks.filter((task) => task.assigneeId === member.id);
        const doneCount = memberTasks.filter((task) => task.status === "done").length;
        const totalCount = memberTasks.length;
        const activeCount = totalCount - doneCount;
        return {
          member,
          activeCount,
          doneCount,
          totalCount,
          percent: totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100),
          busy: activeCount > 0,
        };
      }),
    [members, tasks]
  );

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      if (memberFilter !== "all" && task.assigneeId !== memberFilter) return false;
      if (!query) return true;
      const haystack = [
        task.title,
        task.description,
        task.assigneeName ?? "",
        task.contentName ?? "",
        task.contentCode ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [tasks, statusFilter, memberFilter, search]);

  const activeTasks = useMemo(
    () => tasks.filter((task) => task.status !== "done"),
    [tasks]
  );

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setAssigneeId("");
    setDueDate("");
  };

  const create = async (): Promise<boolean> => {
    if (!title.trim() || !assigneeId || !dueDate || submitting) return false;
    setSubmitting(true);
    try {
      await createTeamTask({
        title,
        description,
        priority,
        contentId: contentId || null,
        assigneeId,
        dueDate,
      });
      resetForm();
      setShowAssignForm(false);
      await mutate();
      return true;
    } catch (error) {
      alert(error instanceof Error ? error.message : t("team.createTaskFailed"));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const patchTask = async (
    id: string,
    payload: Partial<{ status: TaskStatus; assigneeId: string | null }>
  ) => {
    const previous = tasks;
    const optimistic = tasks.map((task) => {
      if (task.id !== id) return task;
      const nextAssigneeId =
        payload.assigneeId === undefined ? task.assigneeId : payload.assigneeId;
      const assignee =
        nextAssigneeId == null
          ? null
          : members.find((member) => member.id === nextAssigneeId);
      return {
        ...task,
        ...payload,
        assigneeId: nextAssigneeId,
        assigneeName:
          payload.assigneeId === undefined
            ? task.assigneeName
            : (assignee?.name ?? null),
      };
    });

    try {
      await mutate(optimistic, { revalidate: false });
      await updateTeamTask(id, payload);
      await mutate();
    } catch (error) {
      await mutate(previous, { revalidate: false });
      alert(error instanceof Error ? error.message : t("tasks.updateFailed"));
    }
  };

  const remove = async (id: string) => {
    if (!confirm(t("team.confirmDeleteTask"))) return;
    try {
      await deleteTeamTask(id);
      await mutate();
    } catch (error) {
      alert(error instanceof Error ? error.message : t("team.deleteTaskFailed"));
    }
  };

  const cycleStatus = async (task: TaskItem) => {
    const next: TaskStatus =
      task.status === "todo"
        ? "in_progress"
        : task.status === "in_progress"
          ? "done"
          : "todo";
    await patchTask(task.id, { status: next });
  };

  return {
    tasks,
    activeTasks,
    filteredTasks,
    members,
    workload,
    statusCounts,
    isLoading,
    unavailable,
    mineOnly,
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    assigneeId,
    setAssigneeId,
    dueDate,
    setDueDate,
    submitting,
    resetForm,
    showAssignForm,
    setShowAssignForm,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    memberFilter,
    setMemberFilter,
    create,
    patchTask,
    remove,
    cycleStatus,
  };
}
