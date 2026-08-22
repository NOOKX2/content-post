"use server";

import type { Role, TaskPriority, TaskStatus } from "@prisma/client";
import { auth } from "@/auth";
import { hashPassword } from "@/lib/auth/domain/password";
import {
  TEAM_MEMBER_LIMIT,
  TEAM_ROLES,
  toAssignableRole,
} from "@/lib/auth/domain/roles";
import { prisma } from "@/lib/shared/prisma";
import {
  createTask,
  createTeamMember,
  deleteTask,
  deleteTeamMember,
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

  return updateMemberRole(userId, toAssignableRole(role));
}

export async function createAdminUser(input: {
  name: string;
  email: string;
  password: string;
  role: Role;
}): Promise<TeamMemberItem> {
  await requireAdmin();

  const name = input.name.trim();
  const email = input.email.toLowerCase().trim();
  const role = toAssignableRole(input.role);

  if (!name || !email || !input.password) {
    throw new Error("กรุณากรอกข้อมูลให้ครบ");
  }
  if (input.password.length < 8) {
    throw new Error("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
  }
  if (!TEAM_ROLES.includes(role)) {
    throw new Error("ระดับผู้ใช้ไม่ถูกต้อง");
  }

  const count = await prisma.user.count();
  if (count >= TEAM_MEMBER_LIMIT) {
    throw new Error("จำนวนสมาชิกในแพ็กเกจเต็มแล้ว");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("อีเมลนี้ถูกใช้งานแล้ว");
  }

  return createTeamMember({
    name,
    email,
    passwordHash: await hashPassword(input.password),
    role,
  });
}

export async function removeAdminUser(userId: string): Promise<void> {
  const admin = await requireAdmin();
  if (userId === admin.id) {
    throw new Error("ไม่สามารถลบบัญชีของตัวเองได้");
  }
  await deleteTeamMember(userId);
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
  description?: string;
  priority?: TaskPriority;
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
    description: input.description,
    priority: input.priority,
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
