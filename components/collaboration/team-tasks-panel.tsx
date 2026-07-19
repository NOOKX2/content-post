"use client";

import { useState } from "react";
import useSWR from "swr";
import { CheckSquare, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  TASK_STATUS_LABELS,
  type TaskItem,
  type TeamMemberItem,
} from "@/lib/collaboration/team-types";
import type { TaskStatus } from "@prisma/client";
import { useDashboardNav } from "@/lib/navigation/dashboard-nav";
import { cn } from "@/lib/utils";

async function fetchTasks(url: string) {
  const res = await fetch(url);
  const data = (await res.json()) as { tasks?: TaskItem[]; error?: string };
  if (!res.ok) throw new Error(data.error || "โหลดงานไม่สำเร็จ");
  return data.tasks ?? [];
}

async function fetchMembers() {
  const res = await fetch("/api/team/members");
  const data = (await res.json()) as { members?: TeamMemberItem[]; error?: string };
  if (!res.ok) throw new Error(data.error || "โหลดสมาชิกไม่สำเร็จ");
  return data.members ?? [];
}

interface TeamTasksPanelProps {
  contentId?: string;
  compact?: boolean;
}

export function TeamTasksPanel({ contentId, compact = false }: TeamTasksPanelProps) {
  const { navigate } = useDashboardNav();
  const tasksKey = contentId
    ? `team-tasks?contentId=${contentId}`
    : "team-tasks";
  const { data: tasks = [], mutate, isLoading } = useSWR(tasksKey, () =>
    fetchTasks(
      contentId
        ? `/api/team/tasks?contentId=${encodeURIComponent(contentId)}`
        : "/api/team/tasks"
    )
  );
  const { data: members = [] } = useSWR("team-members", fetchMembers);

  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const resetForm = () => {
    setTitle("");
    setAssigneeId("");
    setDueDate("");
    setShowForm(false);
  };

  const create = async () => {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/team/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          contentId: contentId || null,
          assigneeId: assigneeId || null,
          dueDate,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        alert(data.error || "สร้างงานไม่สำเร็จ");
        return;
      }
      resetForm();
      await mutate();
    } finally {
      setSubmitting(false);
    }
  };

  const patchTask = async (
    id: string,
    payload: Partial<{ status: TaskStatus; assigneeId: string | null }>
  ) => {
    const res = await fetch(`/api/team/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      alert(data.error || "อัปเดตงานไม่สำเร็จ");
      return;
    }
    await mutate();
  };

  const remove = async (id: string) => {
    if (!confirm("ลบงานนี้?")) return;
    const res = await fetch(`/api/team/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      alert(data.error || "ลบงานไม่สำเร็จ");
      return;
    }
    await mutate();
  };

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col",
        compact ? "space-y-3" : "h-full overflow-hidden"
      )}
    >
      {!compact && (
        <div className="border-b border-stone-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-stone-500" />
            <h2 className="text-sm font-semibold text-stone-900">มอบหมายงาน</h2>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            มอบหมายงานให้สมาชิก และแจ้งเตือนเมื่อมีการอัปเดต
          </p>
        </div>
      )}

      <div className={cn(compact ? "" : "min-h-0 flex-1 overflow-y-auto p-4")}>
        {showForm ? (
          <div className="mb-4 space-y-3 rounded-xl border border-stone-200 bg-stone-50/70 p-3">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ชื่องาน เช่น ตัดต่อคลิป, ออกแบบภาพ"
              autoFocus
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <Select
                options={members.map((m) => ({ value: m.id, label: m.name }))}
                placeholder="มอบหมายให้..."
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              />
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetForm}
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                size="sm"
                className="min-w-28"
                onClick={() => void create()}
                disabled={submitting || !title.trim()}
              >
                <Plus className="h-4 w-4" />
                มอบหมายงาน
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-4 flex justify-center sm:justify-start">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4" />
              มอบหมายงาน
            </Button>
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-stone-400">กำลังโหลด...</p>
        ) : tasks.length === 0 ? (
          <p className="rounded-lg border border-dashed border-stone-200 py-8 text-center text-sm text-stone-400">
            ยังไม่มีงานที่มอบหมาย
          </p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-stone-200 bg-white px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-stone-900">{task.title}</p>
                    <p className="mt-1 text-xs text-stone-500">
                      {task.assigneeName
                        ? `มอบหมายให้ ${task.assigneeName}`
                        : "ยังไม่ระบุผู้รับผิดชอบ"}
                      {task.dueDate ? ` · กำหนด ${task.dueDate}` : ""}
                      {task.contentCode
                        ? ` · #${task.contentCode}`
                        : ""}
                    </p>
                    {!contentId && task.contentId && (
                      <button
                        type="button"
                        className="mt-1 text-xs text-blue-600 hover:underline"
                        onClick={() => navigate(`/content/${task.contentId}`)}
                      >
                        ดู Content
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => void remove(task.id)}
                    className="rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-500"
                    aria-label="ลบงาน"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <Select
                    options={(
                      Object.keys(TASK_STATUS_LABELS) as TaskStatus[]
                    ).map((status) => ({
                      value: status,
                      label: TASK_STATUS_LABELS[status],
                    }))}
                    value={task.status}
                    onChange={(e) =>
                      void patchTask(task.id, {
                        status: e.target.value as TaskStatus,
                      })
                    }
                    className="h-9"
                  />
                  <Select
                    options={members.map((m) => ({
                      value: m.id,
                      label: m.name,
                    }))}
                    placeholder="มอบหมายให้..."
                    value={task.assigneeId ?? ""}
                    onChange={(e) =>
                      void patchTask(task.id, {
                        assigneeId: e.target.value || null,
                      })
                    }
                    className="h-9"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
