"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardList,
  Clock3,
  Flame,
  List,
  Minus,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { PersonAvatar } from "@/app/collaboration/_components/PersonAvatar";
import type { TaskItem, TeamMemberItem } from "@/lib/collaboration/types/team";
import type { TaskPriority, TaskStatus } from "@prisma/client";
import { useDashboardNav } from "@/lib/navigation/client/dashboard-nav";
import { cn, formatThaiDate } from "@/lib/shared/utils";
import {
  useTeamTasksPanel,
  assigneeOptions,
  todayIso,
  addDaysIso,
  type TaskStatusFilter,
} from "@/app/collaboration/_hooks/use-team-tasks-panel";
import { dateLocale, useT } from "@/lib/i18n";

function formatDueShort(dueDate: string, locale: string): string | null {
  if (!dueDate) return null;
  const date = new Date(`${dueDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return formatThaiDate(dueDate);
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDueLabel(dueDate: string, t: (key: string, params?: Record<string, string | number>) => string): {
  label: string;
  urgent: boolean;
} {
  if (!dueDate) return { label: t("tasks.noDue"), urgent: false };
  const today = todayIso();
  const tomorrow = addDaysIso(1);
  if (dueDate === today) return { label: t("tasks.dueToday"), urgent: true };
  if (dueDate === tomorrow) return { label: t("tasks.dueOn", { date: formatThaiDate(dueDate) }), urgent: false };
  if (dueDate < today) return { label: t("tasks.overdue", { date: formatThaiDate(dueDate) }), urgent: true };
  return { label: t("tasks.dueOn", { date: formatThaiDate(dueDate) }), urgent: false };
}

function statusLabel(
  status: TaskStatus,
  t: (key: "team.statusTodo" | "team.statusInProgress" | "team.statusDone") => string
) {
  if (status === "done") return t("team.statusDone");
  if (status === "in_progress") return t("team.statusInProgress");
  return t("team.statusTodo");
}

function StatusGlyph({
  status,
  className,
}: {
  status: TaskStatus;
  className?: string;
}) {
  if (status === "done") {
    return (
      <CheckCircle2
        className={cn("h-5 w-5 text-emerald-500", className)}
        strokeWidth={2}
      />
    );
  }
  if (status === "in_progress") {
    return (
      <Clock3 className={cn("h-5 w-5 text-amber-500", className)} strokeWidth={2} />
    );
  }
  return <Circle className={cn("h-5 w-5 text-stone-400", className)} strokeWidth={2} />;
}

function StatusMenu({
  status,
  onChange,
}: {
  status: TaskStatus;
  onChange: (status: TaskStatus) => void;
}) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const options: { value: TaskStatus; label: string }[] = [
    { value: "todo", label: t("team.statusTodo") },
    { value: "in_progress", label: t("team.statusInProgress") },
    { value: "done", label: t("team.statusDone") },
  ];

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full p-0.5 transition hover:bg-stone-100"
        aria-haspopup="menu"
        aria-expanded={open}
        title={t("team.changeTaskStatus")}
      >
        <StatusGlyph status={status} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute top-full left-0 z-30 mt-1.5 min-w-48 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg shadow-stone-900/10"
        >
          {options.map((option) => {
            const selected = option.value === status;
            return (
              <button
                key={option.value}
                type="button"
                role="menuitem"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition",
                  selected
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-stone-700 hover:bg-stone-50"
                )}
              >
                <StatusGlyph status={option.value} className="h-4 w-4" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function statusTextClass(status: TaskStatus) {
  switch (status) {
    case "done":
      return "text-emerald-600";
    case "in_progress":
      return "text-amber-600";
    default:
      return "text-stone-500";
  }
}

function priorityTextClass(priority: TaskPriority) {
  switch (priority) {
    case "urgent":
      return "text-rose-600";
    case "high":
      return "text-orange-500";
    case "low":
      return "text-stone-500";
    default:
      return "text-blue-600";
  }
}

function PriorityIcon({
  priority,
  className,
}: {
  priority: TaskPriority;
  className?: string;
}) {
  const iconClass = cn("h-4 w-4 shrink-0", className);
  switch (priority) {
    case "urgent":
      return <Flame className={iconClass} strokeWidth={2.25} />;
    case "high":
      return <ArrowUp className={iconClass} strokeWidth={2.5} />;
    case "low":
      return <ArrowDown className={iconClass} strokeWidth={2.5} />;
    default:
      return <Minus className={iconClass} strokeWidth={2.5} />;
  }
}

function priorityButtonClass(priority: TaskPriority, selected: boolean) {
  if (!selected) {
    return cn(
      "border-stone-200 bg-white hover:bg-stone-50",
      priority === "urgent" && "text-rose-600",
      priority === "high" && "text-orange-500",
      priority === "medium" && "text-blue-600",
      priority === "low" && "text-stone-500"
    );
  }
  switch (priority) {
    case "urgent":
      return "border-rose-400 bg-rose-50 text-rose-700 shadow-sm shadow-rose-500/10";
    case "high":
      return "border-orange-400 bg-orange-50 text-orange-700 shadow-sm shadow-orange-500/10";
    case "low":
      return "border-stone-300 bg-stone-100 text-stone-600 shadow-sm";
    default:
      return "border-blue-400 bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/10";
  }
}

function priorityLabel(
  priority: TaskPriority,
  t: ReturnType<typeof useT>["t"]
) {
  switch (priority) {
    case "urgent":
      return t("team.priorityUrgent");
    case "high":
      return t("team.priorityHigh");
    case "low":
      return t("team.priorityLow");
    default:
      return t("team.priorityMedium");
  }
}

function TaskCard({
  task,
  members,
  unavailable,
  locale,
  allowAssign = true,
  allowDelete = true,
  onPatch,
  onRemove,
  onOpenContent,
}: {
  task: TaskItem;
  members: TeamMemberItem[];
  unavailable: string;
  locale: string;
  allowAssign?: boolean;
  allowDelete?: boolean;
  onPatch: (
    id: string,
    payload: Partial<{ status: TaskStatus; assigneeId: string | null }>
  ) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onOpenContent: (contentId: string) => void;
}) {
  const { t } = useT();
  const dueShort = formatDueShort(task.dueDate, locale);
  const dueUrgent =
    Boolean(task.dueDate) && task.dueDate <= todayIso() && task.status !== "done";
  const subtitle =
    task.description ||
    task.contentName ||
    (task.contentCode ? `#${task.contentCode}` : null);

  return (
    <article className="group flex items-center gap-3 rounded-xl border border-stone-200/80 bg-white px-3.5 py-2.5 shadow-sm transition hover:border-stone-300 sm:gap-3.5 sm:px-4">
      <StatusMenu
        status={task.status}
        onChange={(next) => void onPatch(task.id, { status: next })}
      />

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-bold leading-tight text-stone-900",
            task.status === "done" && "text-stone-400 line-through"
          )}
        >
          {task.title}
        </p>
        {subtitle ? (
          <p className="mt-0.5 truncate text-xs text-stone-500">{subtitle}</p>
        ) : null}

        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] font-semibold">
          <span className={statusTextClass(task.status)}>
            {statusLabel(task.status, t)}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1",
              priorityTextClass(task.priority)
            )}
          >
            <PriorityIcon priority={task.priority} className="h-3 w-3" />
            {priorityLabel(task.priority, t)}
          </span>
          {dueShort ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-medium text-stone-500",
                dueUrgent && "text-rose-600"
              )}
            >
              <Calendar className="h-3 w-3" />
              {dueShort}
            </span>
          ) : null}
          {task.contentId && task.contentCode ? (
            <button
              type="button"
              className="font-medium text-blue-600 hover:underline"
              onClick={() => onOpenContent(task.contentId!)}
            >
              #{task.contentCode}
            </button>
          ) : null}
        </div>
      </div>

      <div className="relative flex shrink-0 items-center gap-1.5 sm:gap-2.5">
        <div className="relative flex items-center gap-2">
          {task.assigneeName ? (
            <>
              <PersonAvatar
                name={task.assigneeName}
                size="sm"
                letters={2}
                className="h-7! w-7! text-[10px]! ring-0!"
              />
              <span className="hidden max-w-32 truncate text-xs text-stone-500 sm:inline">
                {task.assigneeName}
              </span>
            </>
          ) : (
            <span className="hidden text-xs text-stone-400 sm:inline">
              {t("team.unassignedTasks")}
            </span>
          )}
          {allowAssign ? (
            <select
              value={task.assigneeId ?? ""}
              onChange={(e) =>
                void onPatch(task.id, { assigneeId: e.target.value || null })
              }
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label={t("team.pickMember")}
              title={t("team.pickMember")}
            >
              <option value="">{t("team.pickMember")}</option>
              {assigneeOptions(members, unavailable, task.assigneeId).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : null}
        </div>
        {allowDelete ? (
          <button
            type="button"
            onClick={() => void onRemove(task.id)}
            className="rounded-md p-1 text-stone-300 opacity-100 transition hover:bg-rose-50 hover:text-rose-500 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label={t("team.confirmDeleteTask")}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </article>
  );
}

interface TeamTasksPanelProps {
  contentId?: string;
  compact?: boolean;
  /** Personal inbox: only tasks assigned to the current user. */
  mineOnly?: boolean;
}

export function TeamTasksPanel({
  contentId,
  compact = false,
  mineOnly = false,
}: TeamTasksPanelProps) {
  const { navigate } = useDashboardNav();
  const { t, locale } = useT();
  const loc = dateLocale(locale);
  const {
    tasks,
    filteredTasks,
    members,
    workload,
    statusCounts,
    isLoading,
    unavailable,
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
  } = useTeamTasksPanel(contentId, { mineOnly });

  if (compact) {
    return (
      <CompactTasksView
        tasks={tasks}
        members={members}
        isLoading={isLoading}
        title={title}
        setTitle={setTitle}
        assigneeId={assigneeId}
        setAssigneeId={setAssigneeId}
        dueDate={dueDate}
        setDueDate={setDueDate}
        submitting={submitting}
        onCreate={create}
        onReset={resetForm}
        onPatch={patchTask}
        onRemove={remove}
        contentId={contentId}
        navigate={navigate}
        unavailable={unavailable}
      />
    );
  }

  const statusTabs: { id: TaskStatusFilter; label: string }[] = [
    { id: "all", label: t("team.filterAll") },
    { id: "todo", label: t("team.filterTodo") },
    { id: "in_progress", label: t("team.filterInProgress") },
    { id: "done", label: t("team.filterDone") },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f3f4f6]">
      {!mineOnly ? (
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-white px-4 py-3 md:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
              <ClipboardList className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight text-stone-900">
                {t("team.taskFlow")}
              </h1>
              <p className="truncate text-xs text-stone-500">
                {t("team.taskFlowSubtitle")}
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-4 text-xs font-medium text-stone-600 sm:flex">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              {t("team.todoCount", { count: statusCounts.todo })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              {t("team.inProgressCount", { count: statusCounts.in_progress })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t("team.doneCount", { count: statusCounts.done })}
            </span>
          </div>
        </header>
      ) : null}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {!mineOnly ? (
          <aside className="hidden w-70 shrink-0 flex-col overflow-hidden border-r border-stone-200 bg-white md:flex">
            <div className="flex items-center gap-2 border-b border-stone-100 px-4 py-3.5">
              <Users className="h-4 w-4 text-stone-400" />
              <p className="text-xs font-semibold tracking-wide text-stone-500 uppercase">
                {t("team.teamMembersSection")}
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              <button
                type="button"
                onClick={() => setMemberFilter("all")}
                className={cn(
                  "mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition",
                  memberFilter === "all"
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                    : "text-stone-700 hover:bg-stone-50"
                )}
              >
                {t("team.allTasksCount", { count: statusCounts.total })}
              </button>

              <div className="mt-1 space-y-0.5">
                {workload.map(({ member, doneCount, totalCount, percent }) => {
                  const selected = memberFilter === member.id;
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setMemberFilter(member.id)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition",
                        selected ? "bg-blue-50 ring-1 ring-blue-200" : "hover:bg-stone-50"
                      )}
                    >
                      <PersonAvatar
                        name={member.name}
                        imageUrl={member.imageUrl}
                        size="md"
                        letters={2}
                        className="ring-0!"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-stone-900">
                              {member.name}
                            </p>
                            <p className="truncate text-[11px] text-stone-500">
                              {member.position || member.role}
                            </p>
                          </div>
                          <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-stone-300" />
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2 text-[10px] font-medium text-stone-500">
                          <span>
                            {t("team.taskProgress", {
                              done: doneCount,
                              total: totalCount,
                            })}
                          </span>
                          <span>{percent}%</span>
                        </div>
                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-stone-100">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        ) : null}

        <section
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-3 md:p-4",
            mineOnly && "mx-auto w-full max-w-5xl"
          )}
        >          <div className="mb-3 flex flex-wrap items-center gap-2.5 sm:gap-3">
            <div className="relative w-full max-w-56 sm:max-w-64">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("team.searchTasks")}
                className="h-10 w-full rounded-xl border border-stone-200 bg-white py-2 pr-3 pl-9 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="inline-flex items-center gap-0.5 overflow-x-auto rounded-xl border border-stone-200 bg-white p-1">
              {statusTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={cn(
                    "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                    statusFilter === tab.id
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                      : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {!mineOnly ? (
              <button
                type="button"
                onClick={() => setShowAssignForm(true)}
                className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                {t("team.assignTask")}
              </button>
            ) : null}
            <p
              className={cn(
                "shrink-0 items-center gap-1.5 text-xs font-medium text-stone-500",
                mineOnly
                  ? "ml-auto inline-flex"
                  : "hidden lg:inline-flex"
              )}
            >
              <List className="h-3.5 w-3.5" />
              {t("team.itemsCount", { count: filteredTasks.length })}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <p className="py-12 text-center text-sm text-stone-400">{t("common.loading")}</p>
            ) : filteredTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-200 bg-white/70 px-6 py-12 text-center text-sm text-stone-400">
                {tasks.length === 0 ? t("team.noTasksYet") : t("team.noTasksMatch")}
              </div>
            ) : (
              <div className="space-y-2 pb-2">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    members={members}
                    unavailable={unavailable}
                    locale={loc}
                    allowAssign={!mineOnly}
                    allowDelete={!mineOnly}
                    onPatch={patchTask}
                    onRemove={remove}
                    onOpenContent={(id) => navigate(`/content/${id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {showAssignForm && !mineOnly ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="assign-task-title"
            className="flex max-h-[min(92vh,720px)] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-xl"
          >
            <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-5 pb-3">
              <div>
                <h2
                  id="assign-task-title"
                  className="text-xl font-bold tracking-tight text-stone-900"
                >
                  {t("team.assignTaskNew")}
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  {t("team.assignTaskHint")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowAssignForm(false);
                }}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                aria-label={t("common.close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={(e) => {
                e.preventDefault();
                void create();
              }}
            >
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 pb-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-stone-800">
                    {t("team.taskTitleRequired")}{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("team.taskTitlePlaceholderShort")}
                    autoFocus
                    className="h-11 rounded-xl border-0 bg-stone-100"
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-stone-800">
                    {t("team.assigneeRequired")}{" "}
                    <span className="text-rose-500">*</span>
                  </p>
                  <div className="max-h-52 space-y-2 overflow-y-auto pr-0.5">
                    {members
                      .filter((member) => !member.busy)
                      .map((member) => {
                        const selected = assigneeId === member.id;
                        return (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => setAssigneeId(member.id)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition",
                              selected
                                ? "border-blue-400 bg-blue-50"
                                : "border-stone-200 bg-white hover:bg-stone-50"
                            )}
                          >
                            <PersonAvatar
                              name={member.name}
                              imageUrl={member.imageUrl}
                              size="md"
                              letters={2}
                              className="ring-0!"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-bold text-stone-900">
                                {member.name}
                              </span>
                              <span className="block truncate text-xs text-stone-500">
                                {member.position || member.role}
                              </span>
                            </span>
                            {selected ? (
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-stone-800">
                    {t("team.dueDateRequired")}{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-11 rounded-xl border-0 bg-stone-100"
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-stone-800">
                    {t("team.priorityLabel")}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        "urgent",
                        "high",
                        "medium",
                        "low",
                      ] as const satisfies readonly TaskPriority[]
                    ).map((value) => {
                      const selected = priority === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setPriority(value)}
                          className={cn(
                            "inline-flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition",
                            priorityButtonClass(value, selected)
                          )}
                        >
                          <PriorityIcon priority={value} />
                          {priorityLabel(value, t)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-stone-800">
                    {t("team.taskDescriptionOptional")}
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("team.taskDescriptionPlaceholder")}
                    rows={3}
                    className="rounded-xl border-0 bg-stone-100"
                  />
                </div>
              </div>

              <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-stone-100 px-5 py-4">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowAssignForm(false);
                  }}
                  className="h-11 rounded-xl border border-stone-200 bg-white text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={
                    submitting || !title.trim() || !assigneeId || !dueDate
                  }
                  className="h-11 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {t("team.assignTask")}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CompactTasksView({
  tasks,
  members,
  isLoading,
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
  unavailable,
}: {
  tasks: TaskItem[];
  members: TeamMemberItem[];
  isLoading: boolean;
  title: string;
  setTitle: (v: string) => void;
  assigneeId: string;
  setAssigneeId: (v: string) => void;
  dueDate: string;
  setDueDate: (v: string) => void;
  submitting: boolean;
  onCreate: () => Promise<boolean>;
  onReset: () => void;
  onPatch: (
    id: string,
    payload: Partial<{ status: TaskStatus; assigneeId: string | null }>
  ) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  contentId?: string;
  navigate: (href: string) => void;
  unavailable: string;
}) {
  const { t } = useT();
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async () => {
    const ok = await onCreate();
    if (ok) setShowForm(false);
  };

  const handleCancel = () => {
    onReset();
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      {showForm ? (
        <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4">
          <p className="mb-3 text-xs font-semibold tracking-wide text-stone-500 uppercase">
            {t("team.quickAssign")}
          </p>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="min-w-0 flex-1">
              <label className="mb-1 block text-xs font-medium text-stone-600">
                {t("team.taskTitle")}
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("team.taskTitlePlaceholder")}
                autoFocus
              />
            </div>
            <div className="w-full shrink-0 lg:w-44">
              <label className="mb-1 block text-xs font-medium text-stone-600">
                {t("team.assignee")}
              </label>
              <Select
                options={assigneeOptions(members, unavailable)}
                placeholder={t("team.pickMember")}
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              />
            </div>
            <div className="w-full shrink-0 lg:w-40">
              <label className="mb-1 block text-xs font-medium text-stone-600">
                {t("team.dueDate")}
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="flex shrink-0 items-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                onClick={() => void handleCreate()}
                disabled={submitting || !title.trim()}
              >
                {t("team.assignTask")}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            {t("team.assignTask")}
          </Button>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-stone-400">{t("common.loading")}</p>
      ) : tasks.length === 0 ? (
        <p className="rounded-lg border border-dashed border-stone-200 py-8 text-center text-sm text-stone-400">
          {t("team.noTasksYet")}
        </p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const due = formatDueLabel(task.dueDate, t);
            return (
              <div key={task.id} className="rounded-xl border border-stone-200 bg-white px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-stone-900">{task.title}</p>
                    <p className="mt-1 text-xs text-stone-500">
                      {task.assigneeName
                        ? `${t("team.assignee")}: ${task.assigneeName}`
                        : t("team.pickMember")}
                      {due.label ? ` · ${due.label}` : ""}
                      {task.contentCode ? ` · #${task.contentCode}` : ""}
                    </p>
                    {!contentId && task.contentId && (
                      <button
                        type="button"
                        className="mt-1 text-xs text-blue-600 hover:underline"
                        onClick={() => navigate(`/content/${task.contentId}`)}
                      >
                        {t("team.details")}
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => void onRemove(task.id)}
                    className="rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-500"
                    aria-label={t("team.confirmDeleteTask")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <Select
                    options={[
                      { value: "todo", label: t("team.statusTodo") },
                      { value: "in_progress", label: t("team.statusInProgress") },
                      { value: "done", label: t("team.statusDone") },
                    ]}
                    value={task.status}
                    onChange={(e) =>
                      void onPatch(task.id, { status: e.target.value as TaskStatus })
                    }
                    className="h-9"
                  />
                  <Select
                    options={assigneeOptions(members, unavailable, task.assigneeId)}
                    placeholder={t("team.pickMember")}
                    value={task.assigneeId ?? ""}
                    onChange={(e) =>
                      void onPatch(task.id, { assigneeId: e.target.value || null })
                    }
                    className="h-9"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
