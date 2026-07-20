"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  Calendar,
  ClipboardList,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PersonAvatar } from "@/components/collaboration/person-avatar";
import {
  TASK_STATUS_LABELS,
  type TaskItem,
  type TeamMemberItem,
} from "@/lib/collaboration/team-types";
import type { TaskStatus } from "@prisma/client";
import { useDashboardNav } from "@/lib/navigation/dashboard-nav";
import { cn, formatThaiDate } from "@/lib/utils";

async function fetchTasks(url: string) {
  const res = await fetch(url);
  const data = (await res.json()) as { tasks?: TaskItem[]; error?: string };
  if (!res.ok) throw new Error(data.error || "โหลดงานไม่สำเร็จ");
  return data.tasks ?? [];
}

async function fetchMembers() {
  const res = await fetch("/api/team/members");
  const data = (await res.json()) as {
    members?: TeamMemberItem[];
    error?: string;
  };
  if (!res.ok) throw new Error(data.error || "โหลดสมาชิกไม่สำเร็จ");
  return data.members ?? [];
}

function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDaysIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDueLabel(dueDate: string): {
  label: string;
  urgent: boolean;
} {
  if (!dueDate) return { label: "ไม่มีกำหนด", urgent: false };
  const today = todayIso();
  const tomorrow = addDaysIso(1);
  if (dueDate === today) return { label: "ครบกำหนด: วันนี้", urgent: true };
  if (dueDate === tomorrow) return { label: "ครบกำหนด: พรุ่งนี้", urgent: false };
  if (dueDate < today) {
    return { label: `เกินกำหนด · ${formatThaiDate(dueDate)}`, urgent: true };
  }
  return { label: `ครบกำหนด: ${formatThaiDate(dueDate)}`, urgent: false };
}

function statusBadgeClass(status: TaskStatus) {
  switch (status) {
    case "done":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "in_progress":
      return "bg-sky-50 text-sky-700 border-sky-200";
    default:
      return "bg-stone-100 text-stone-600 border-stone-200";
  }
}

interface TeamTasksPanelProps {
  contentId?: string;
  compact?: boolean;
}

export function TeamTasksPanel({
  contentId,
  compact = false,
}: TeamTasksPanelProps) {
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
  const [showForm, setShowForm] = useState(!compact);

  const activeTasks = useMemo(
    () => tasks.filter((task) => task.status !== "done"),
    [tasks]
  );

  const workload = useMemo(() => {
    return members.map((member) => {
      const count = activeTasks.filter(
        (task) => task.assigneeId === member.id
      ).length;
      return {
        member,
        activeCount: count,
        busy: count > 0,
      };
    });
  }, [members, activeTasks]);

  const resetForm = () => {
    setTitle("");
    setAssigneeId("");
    setDueDate("");
    if (compact) setShowForm(false);
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

  if (compact) {
    return (
      <CompactTasksView
        tasks={tasks}
        members={members}
        isLoading={isLoading}
        showForm={showForm}
        setShowForm={setShowForm}
        title={title}
        setTitle={setTitle}
        assigneeId={assigneeId}
        setAssigneeId={setAssigneeId}
        dueDate={dueDate}
        setDueDate={setDueDate}
        submitting={submitting}
        onCreate={() => void create()}
        onReset={resetForm}
        onPatch={patchTask}
        onRemove={remove}
        contentId={contentId}
        navigate={navigate}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f5f5f7]">
      <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-5">
        <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
          <section className="h-fit rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-stone-400 uppercase">
              ภาระงานทีม
            </p>
            <div className="mt-3 space-y-2.5">
              {workload.length === 0 ? (
                <p className="text-sm text-stone-400">ยังไม่มีสมาชิก</p>
              ) : (
                workload.map(({ member, activeCount, busy }) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50/80 px-3 py-2.5"
                  >
                    <PersonAvatar name={member.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-stone-900">
                        {member.name}
                      </p>
                      <p className="text-xs text-stone-500">
                        {activeCount} งานที่กำลังทำ
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                        busy
                          ? "bg-sky-100 text-sky-700"
                          : "bg-stone-200 text-stone-600"
                      )}
                    >
                      {busy ? "ไม่ว่าง" : "ว่าง"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <ClipboardList className="h-5 w-5" strokeWidth={2.25} />
                </span>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  จัดการงาน
                </h2>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4">
                  <p className="mb-3 text-xs font-semibold tracking-wide text-stone-500 uppercase">
                    มอบหมายด่วน
                  </p>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                    <div className="min-w-0 flex-1">
                      <label className="mb-1 block text-xs font-medium text-stone-600">
                        ชื่องาน
                      </label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="เช่น ถ่ายรูปสินค้าใหม่"
                        autoFocus
                      />
                    </div>
                    <div className="w-full shrink-0 lg:w-44">
                      <label className="mb-1 block text-xs font-medium text-stone-600">
                        ผู้รับผิดชอบ
                      </label>
                      <Select
                        options={members.map((m) => ({
                          value: m.id,
                          label: m.name,
                        }))}
                        placeholder="เลือกสมาชิก..."
                        value={assigneeId}
                        onChange={(e) => setAssigneeId(e.target.value)}
                      />
                    </div>
                    <div className="w-full shrink-0 lg:w-40">
                      <label className="mb-1 block text-xs font-medium text-stone-600">
                        กำหนดส่ง
                      </label>
                      <Input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      className="shrink-0 lg:mb-0"
                      onClick={() => void create()}
                      disabled={submitting || !title.trim()}
                    >
                      มอบหมาย
                    </Button>
                  </div>
                </div>
            </div>

            <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
              <p className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-stone-400 uppercase">
                งานที่กำลังทำ
              </p>

              {isLoading ? (
                <p className="text-sm text-stone-400">กำลังโหลด...</p>
              ) : activeTasks.length === 0 ? (
                <p className="rounded-lg border border-dashed border-stone-200 py-8 text-center text-sm text-stone-400">
                  ยังไม่มีงานที่มอบหมาย
                </p>
              ) : (
                <div className="space-y-2.5">
                  {activeTasks.map((task) => {
                    const due = formatDueLabel(task.dueDate);
                    return (
                      <div
                        key={task.id}
                        className="rounded-xl border border-stone-200 bg-white px-4 py-3.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-stone-900">
                              {task.title}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-500">
                              <span className="inline-flex items-center gap-1.5">
                                {task.assigneeName ? (
                                  <PersonAvatar
                                    name={task.assigneeName}
                                    size="sm"
                                    className="!h-5 !w-5 !text-[9px] !ring-1"
                                  />
                                ) : (
                                  <UserRound className="h-3.5 w-3.5 text-stone-400" />
                                )}
                                {task.assigneeName
                                  ? `มอบหมายให้ ${task.assigneeName}`
                                  : "ยังไม่ระบุผู้รับผิดชอบ"}
                              </span>
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1",
                                  due.urgent && "font-medium text-red-600"
                                )}
                              >
                                <Calendar className="h-3.5 w-3.5" />
                                {due.label}
                              </span>
                              {task.contentCode && (
                                <button
                                  type="button"
                                  className="text-blue-600 hover:underline"
                                  onClick={() =>
                                    task.contentId &&
                                    navigate(`/content/${task.contentId}`)
                                  }
                                >
                                  #{task.contentCode}
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <select
                              value={task.status}
                              onChange={(e) =>
                                void patchTask(task.id, {
                                  status: e.target.value as TaskStatus,
                                })
                              }
                              className={cn(
                                "rounded-full border px-2.5 py-1 text-[11px] font-semibold outline-none",
                                statusBadgeClass(task.status)
                              )}
                            >
                              {(
                                Object.keys(TASK_STATUS_LABELS) as TaskStatus[]
                              ).map((status) => (
                                <option key={status} value={status}>
                                  {TASK_STATUS_LABELS[status]}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => void remove(task.id)}
                              className="rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-500"
                              aria-label="ลบงาน"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Select
                            options={members.map((m) => ({
                              value: m.id,
                              label: m.name,
                            }))}
                            placeholder="เปลี่ยนผู้รับผิดชอบ..."
                            value={task.assigneeId ?? ""}
                            onChange={(e) =>
                              void patchTask(task.id, {
                                assigneeId: e.target.value || null,
                              })
                            }
                            className="h-9 max-w-xs"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function CompactTasksView({
  tasks,
  members,
  isLoading,
  showForm,
  setShowForm,
  title,
  setTitle,
  assigneeId,
  setAssigneeId,
  dueDate,
  setDueDate,
  submitting,
  onCreate,
  onReset,
  onPatch,
  onRemove,
  contentId,
  navigate,
}: {
  tasks: TaskItem[];
  members: TeamMemberItem[];
  isLoading: boolean;
  showForm: boolean;
  setShowForm: (v: boolean) => void;
  title: string;
  setTitle: (v: string) => void;
  assigneeId: string;
  setAssigneeId: (v: string) => void;
  dueDate: string;
  setDueDate: (v: string) => void;
  submitting: boolean;
  onCreate: () => void;
  onReset: () => void;
  onPatch: (
    id: string,
    payload: Partial<{ status: TaskStatus; assigneeId: string | null }>
  ) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  contentId?: string;
  navigate: (href: string) => void;
}) {
  return (
    <div className="space-y-3">
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
            <Button type="button" variant="outline" size="sm" onClick={onReset}>
              ยกเลิก
            </Button>
            <Button
              type="button"
              size="sm"
              className="min-w-28"
              onClick={onCreate}
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
                    {task.contentCode ? ` · #${task.contentCode}` : ""}
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
                  onClick={() => void onRemove(task.id)}
                  className="rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-500"
                  aria-label="ลบงาน"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Select
                  options={(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map(
                    (status) => ({
                      value: status,
                      label: TASK_STATUS_LABELS[status],
                    })
                  )}
                  value={task.status}
                  onChange={(e) =>
                    void onPatch(task.id, {
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
                    void onPatch(task.id, {
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
  );
}
