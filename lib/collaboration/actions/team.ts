"use server";

import type { Role, TaskStatus } from "@prisma/client";
import { auth } from "@/auth";
import { TEAM_ROLES } from "@/lib/auth/domain/roles";
import {
  createTask,
  deleteTask,
  listTasks,
  listTeamMembers,
  updateMemberRole,
  updateTask,
} from "@/lib/collaboration/data/team-service";
import type { TaskItem, TeamMemberItem } from "@/lib/collaboration/types/team";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}

export async function fetchTeamMembers(): Promise<TeamMemberItem[]> {
  await requireUser();
  return listTeamMembers();
}

export async function updateTeamMemberRole(
  userId: string,
  role: Role
): Promise<TeamMemberItem> {
  const admin = await requireAdmin();

  if (!TEAM_ROLES.includes(role)) {
    throw new Error("userId และ role ไม่ถูกต้อง");
  }
  if (userId === admin.id && role !== "ADMIN") {
    throw new Error("ไม่สามารถลดบทบาทของตัวเองได้");
  }

  return updateMemberRole(userId, role);
}

export async function fetchTeamTasks(options?: {
  contentId?: string;
  mine?: boolean;
}): Promise<TaskItem[]> {
  const user = await requireUser();
  return listTasks({
    contentId: options?.contentId,
    assigneeId: options?.mine ? user.id! : undefined,
  });
}

export async function createTeamTask(input: {
  title: string;
  contentId?: string | null;
  assigneeId?: string | null;
  dueDate?: string;
  status?: TaskStatus;
}): Promise<TaskItem> {
  const user = await requireUser();

  if (!input.title?.trim()) {
    throw new Error("กรุณาระบุชื่องาน");
  }

  return createTask({
    title: input.title,
    contentId: input.contentId,
    assigneeId: input.assigneeId,
    dueDate: input.dueDate,
    createdById: user.id!,
    createdByName: user.name ?? "ผู้ใช้",
  });
}

export async function updateTeamTask(
  taskId: string,
  payload: Partial<{
    title: string;
    status: TaskStatus;
    assigneeId: string | null;
    dueDate: string;
  }>
): Promise<TaskItem> {
  const user = await requireUser();
  return updateTask(taskId, {
    title: payload.title,
    status: payload.status,
    assigneeId: payload.assigneeId,
    dueDate: payload.dueDate,
    actorId: user.id!,
    actorName: user.name ?? "ผู้ใช้",
  });
}

export async function deleteTeamTask(taskId: string): Promise<void> {
  await requireUser();
  await deleteTask(taskId);
}
