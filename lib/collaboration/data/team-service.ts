import { prisma } from "@/lib/shared/prisma";
import type { Prisma, Role, TaskPriority, TaskStatus } from "@prisma/client";
import type {
  AuditLogItem,
  TaskItem,
  TeamMemberItem,
} from "@/lib/collaboration/types/team";
import { createNotifications } from "@/lib/notifications/data/service";

const memberSelect = {
  id: true,
  name: true,
  displayName: true,
  email: true,
  phone: true,
  phoneCountry: true,
  role: true,
  position: true,
  imageUrl: true,
  busy: true,
  createdAt: true,
  googleCalendar: { select: { userId: true } },
} as const;

function toMember(user: {
  id: string;
  name: string;
  displayName: string;
  email: string;
  phone: string;
  phoneCountry: string;
  role: Role;
  position: string;
  imageUrl: string;
  busy: boolean;
  createdAt: Date;
  googleCalendar?: { userId: string } | null;
}): TeamMemberItem {
  return {
    id: user.id,
    name: user.displayName || user.name,
    email: user.email,
    phone: user.phone,
    phoneCountry: user.phoneCountry,
    role: user.role,
    position: user.position,
    imageUrl: user.imageUrl,
    busy: user.busy,
    googleCalendarConnected: Boolean(user.googleCalendar),
    createdAt: user.createdAt.toISOString(),
  };
}

function toTask(task: {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  contentId: string | null;
  assigneeId: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
  content?: { contentId: string; name: string } | null;
  assignee?: { name: string } | null;
  createdBy?: { name: string } | null;
}): TaskItem {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    contentId: task.contentId,
    contentCode: task.content?.contentId ?? null,
    contentName: task.content?.name ?? null,
    assigneeId: task.assigneeId,
    assigneeName: task.assignee?.name ?? null,
    createdById: task.createdById,
    createdByName: task.createdBy?.name ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export async function listTeamMembers(): Promise<TeamMemberItem[]> {
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: memberSelect,
  });
  return users.map(toMember);
}

export async function createTeamMember(input: {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}): Promise<TeamMemberItem> {
  const user = await prisma.user.create({
    data: {
      name: input.name,
      displayName: input.name,
      email: input.email,
      password: input.passwordHash,
      role: input.role,
    },
    select: memberSelect,
  });
  return toMember(user);
}

export async function deleteTeamMember(userId: string): Promise<void> {
  await prisma.user.delete({ where: { id: userId } });
}

export async function updateMemberRole(
  userId: string,
  role: Role
): Promise<TeamMemberItem> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: memberSelect,
  });
  return toMember(user);
}

const taskInclude = {
  content: { select: { contentId: true, name: true } },
  assignee: { select: { name: true } },
  createdBy: { select: { name: true } },
} as const;

export async function listTasks(options?: {
  contentId?: string;
  assigneeId?: string;
}): Promise<TaskItem[]> {
  const tasks = await prisma.task.findMany({
    where: {
      contentId: options?.contentId,
      assigneeId: options?.assigneeId,
    },
    include: taskInclude,
    orderBy: { createdAt: "desc" },
  });
  return tasks.map(toTask);
}

async function assertAssigneeAvailable(assigneeId?: string | null) {
  if (!assigneeId) return;
  const assignee = await prisma.user.findUnique({
    where: { id: assigneeId },
    select: { busy: true, name: true, displayName: true },
  });
  if (assignee?.busy) {
    const label = assignee.displayName || assignee.name;
    throw new Error(`${label} ตั้งสถานะไม่ว่าง จึงยังไม่สามารถมอบหมายงานได้`);
  }
}

export async function createTask(input: {
  title: string;
  description?: string;
  priority?: TaskPriority;
  contentId?: string | null;
  assigneeId?: string | null;
  dueDate?: string;
  createdById: string;
  createdByName: string;
}): Promise<TaskItem> {
  await assertAssigneeAvailable(input.assigneeId);
  const task = await prisma.task.create({
    data: {
      title: input.title.trim(),
      description: input.description?.trim() ?? "",
      priority: input.priority ?? "medium",
      contentId: input.contentId || null,
      assigneeId: input.assigneeId || null,
      dueDate: input.dueDate ?? "",
      createdById: input.createdById,
    },
    include: taskInclude,
  });

  if (task.assigneeId && task.assigneeId !== input.createdById) {
    await createNotifications([task.assigneeId], {
      type: "task_assigned",
      title: "ได้รับมอบหมายงาน",
      message: `${input.createdByName} มอบหมายงาน: ${task.title}`,
      contentId: task.contentId ?? undefined,
      link: task.contentId ? `/content/${task.contentId}` : "/collaboration",
    });
  }

  return toTask(task);
}

export async function updateTask(
  taskId: string,
  input: {
    title?: string;
    status?: TaskStatus;
    assigneeId?: string | null;
    dueDate?: string;
    actorId: string;
    actorName: string;
  }
): Promise<TaskItem> {
  const before = await prisma.task.findUnique({ where: { id: taskId } });
  if (!before) {
    throw new Error("ไม่พบงาน");
  }

  if (
    input.assigneeId &&
    input.assigneeId !== before.assigneeId
  ) {
    await assertAssigneeAvailable(input.assigneeId);
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      title: input.title?.trim(),
      status: input.status,
      assigneeId: input.assigneeId,
      dueDate: input.dueDate,
    },
    include: taskInclude,
  });

  const notifyIds = new Set<string>();
  if (
    input.assigneeId &&
    input.assigneeId !== before.assigneeId &&
    input.assigneeId !== input.actorId
  ) {
    notifyIds.add(input.assigneeId);
  }
  if (
    before.assigneeId &&
    before.assigneeId !== input.actorId &&
    (input.status !== undefined || input.title !== undefined)
  ) {
    notifyIds.add(before.assigneeId);
  }

  if (notifyIds.size > 0) {
    await createNotifications([...notifyIds], {
      type: "task_updated",
      title: "งานมีการอัปเดต",
      message: `${input.actorName} อัปเดตงาน: ${task.title}`,
      contentId: task.contentId ?? undefined,
      link: task.contentId ? `/content/${task.contentId}` : "/collaboration",
    });
  }

  return toTask(task);
}

export async function deleteTask(taskId: string): Promise<void> {
  await prisma.task.delete({ where: { id: taskId } });
}

export async function listContentAuditLogs(
  contentId: string
): Promise<AuditLogItem[]> {
  const logs = await prisma.contentAuditLog.findMany({
    where: { contentId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return logs.map((log) => ({
    id: log.id,
    contentId: log.contentId,
    actorId: log.actorId,
    actorName: log.actorName,
    action: log.action,
    changes: Array.isArray(log.changes)
      ? (log.changes as AuditLogItem["changes"])
      : [],
    createdAt: log.createdAt.toISOString(),
  }));
}

export async function recordContentAuditLog(input: {
  contentId: string;
  actorId?: string | null;
  actorName: string;
  action: string;
  changes: AuditLogItem["changes"];
}): Promise<void> {
  if (input.changes.length === 0 && input.action === "updated") return;

  await prisma.contentAuditLog.create({
    data: {
      contentId: input.contentId,
      actorId: input.actorId || null,
      actorName: input.actorName,
      action: input.action,
      changes: input.changes as Prisma.InputJsonValue,
    },
  });
}
