"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import {
  Calendar,
  CheckSquare,
  ClipboardList,
  Search,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import {
  TASK_STATUS_LABELS,
  type TaskItem,
} from "@/lib/collaboration/team-types";
import type { TaskStatus } from "@prisma/client";
import { useDashboardNav } from "@/lib/navigation/dashboard-nav";
import { cn, formatThaiDate } from "@/lib/utils";

const FILTER_TABS: { id: TaskStatus | "all" | "active"; label: string }[] = [
  { id: "active", label: "กำลังทำ" },
  { id: "all", label: "ทั้งหมด" },
  { id: "todo", label: "ยังไม่เริ่ม" },
  { id: "in_progress", label: "กำลังทำอยู่" },
  { id: "done", label: "เสร็จแล้ว" },
];

async function fetchMyTasks() {
  const res = await fetch("/api/team/tasks?mine=1");
  const data = (await res.json()) as { tasks?: TaskItem[]; error?: string };
  if (!res.ok) throw new Error(data.error || "โหลดงานไม่สำเร็จ");
  return data.tasks ?? [];
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDueLabel(dueDate: string) {
  if (!dueDate) return { label: "ไม่มีกำหนด", urgent: false };
  const today = todayIso();
  if (dueDate === today) return { label: "ครบกำหนด: วันนี้", urgent: true };
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

export function MyTasksView() {
  const { data: session } = useSession();
  const { navigate } = useDashboardNav();
  const { data: tasks = [], mutate, isLoading } = useSWR(
    "my-tasks",
    fetchMyTasks,
    { refreshInterval: 15000 }
  );
  const [filter, setFilter] = useState<TaskStatus | "all" | "active">("active");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return tasks.filter((task) => {
      if (filter === "active" && task.status === "done") return false;
      if (
        filter !== "all" &&
        filter !== "active" &&
        task.status !== filter
      ) {
        return false;
      }
      if (!keyword) return true;
      return (
        task.title.toLowerCase().includes(keyword) ||
        (task.contentCode ?? "").toLowerCase().includes(keyword) ||
        (task.contentName ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [tasks, filter, query]);

  const patchStatus = async (id: string, status: TaskStatus) => {
    const res = await fetch(`/api/team/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      alert(data.error || "อัปเดตสถานะไม่สำเร็จ");
      return;
    }
    await mutate();
  };

  return (
    <>
      <Header
        session={session}
        title="งานที่ได้รับมอบหมาย"
        description="ดูและอัปเดตงานที่มอบหมายให้คุณทั้งหมด"
      />
      <div className="space-y-5 px-6 py-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            tabs={FILTER_TABS}
            activeTab={filter}
            onChange={(id) =>
              setFilter(id as TaskStatus | "all" | "active")
            }
            className="flex-wrap overflow-x-auto"
            compact
          />
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาชื่องาน / รหัส content..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <ClipboardList className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                รายการงานของคุณ
              </h2>
              <p className="text-xs text-stone-500">
                {filtered.length} รายการ
              </p>
            </div>
          </div>

          {isLoading ? (
            <p className="text-sm text-stone-400">กำลังโหลด...</p>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-200 py-12 text-center">
              <CheckSquare className="mx-auto h-8 w-8 text-stone-300" />
              <p className="mt-3 text-sm text-stone-500">
                ยังไม่มีงานที่ตรงกับตัวกรองนี้
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((task) => {
                const due = formatDueLabel(task.dueDate);
                return (
                  <div
                    key={task.id}
                    className="rounded-xl border border-stone-200 px-4 py-3.5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-stone-900">
                          {task.title}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-500">
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
                              {task.contentName
                                ? ` · ${task.contentName}`
                                : ""}
                            </button>
                          )}
                          {task.createdByName && (
                            <span>มอบหมายโดย {task.createdByName}</span>
                          )}
                        </div>
                      </div>
                      <Select
                        options={(
                          Object.keys(TASK_STATUS_LABELS) as TaskStatus[]
                        ).map((status) => ({
                          value: status,
                          label: TASK_STATUS_LABELS[status],
                        }))}
                        value={task.status}
                        onChange={(e) =>
                          void patchStatus(
                            task.id,
                            e.target.value as TaskStatus
                          )
                        }
                        className={cn(
                          "h-9 w-auto min-w-[8rem] rounded-full border px-2 text-xs font-semibold",
                          statusBadgeClass(task.status)
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
