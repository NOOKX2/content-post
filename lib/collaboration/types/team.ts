import type { TaskStatus } from "@prisma/client";

export type TeamMemberItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  phoneCountry: string;
  role: "USER" | "EDITOR" | "DESIGNER" | "ADMIN";
  position: string;
  imageUrl: string;
  busy: boolean;
  createdAt: string;
};

export type TaskItem = {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate: string;
  contentId: string | null;
  contentCode: string | null;
  contentName: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  createdById: string | null;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuditLogItem = {
  id: string;
  contentId: string;
  actorId: string | null;
  actorName: string;
  action: string;
  changes: { field: string; before?: unknown; after?: unknown }[];
  createdAt: string;
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "ยังไม่เริ่ม",
  in_progress: "กำลังทำ",
  done: "เสร็จแล้ว",
};
