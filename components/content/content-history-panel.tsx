"use client";

import { useState } from "react";
import useSWR from "swr";
import { Check, Circle } from "lucide-react";
import type { AuditLogItem } from "@/lib/collaboration/team-types";
import { STATUS_LABELS } from "@/lib/constants";
import { cn, formatThaiDate } from "@/lib/utils";
import type { ContentStatus } from "@/lib/types";

async function fetchHistory(contentId: string) {
  const res = await fetch(`/api/content/${contentId}/history`);
  const data = (await res.json()) as { logs?: AuditLogItem[]; error?: string };
  if (!res.ok) throw new Error(data.error || "โหลดประวัติไม่สำเร็จ");
  return data.logs ?? [];
}

function formatActivityWhen(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfEvent = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (startOfEvent.getTime() === startOfToday.getTime()) {
    return `Today, ${time}`;
  }
  if (startOfEvent.getTime() === startOfYesterday.getTime()) {
    return `Yesterday, ${time}`;
  }
  return `${formatThaiDate(iso.slice(0, 10))} · ${time}`;
}

function statusLabel(value: unknown): string {
  if (typeof value !== "string") return String(value ?? "—");
  const known = STATUS_LABELS[value as ContentStatus];
  return known?.label ?? value;
}

function activityTitle(log: AuditLogItem): string {
  if (log.action === "status_changed") {
    const after = log.changes.find((c) => c.field === "สถานะ")?.after;
    if (after === "posted") return "Content Published";
    if (after === "post_failed") return "Post Failed";
    if (after === "approved") return "Approved Content";
    if (after === "scheduled") return "Content Scheduled";
    if (after === "rejected") return "Content Rejected";
    if (after === "pending") return "Submitted for Approval";
    if (typeof after === "string") {
      return `Status → ${statusLabel(after)}`;
    }
    return "Status Updated";
  }
  if (log.action === "created") return "Project Created";
  if (log.action === "updated") {
    const fields = log.changes.map((c) => c.field).filter(Boolean);
    if (fields.some((f) => /ไฟล์|attachment|รูป|วิดีโอ/i.test(f))) {
      return "Final Draft Uploaded";
    }
    return "Content Updated";
  }
  return "Activity";
}

export function ContentHistoryPanel({
  contentId,
  variant = "list",
}: {
  contentId: string;
  variant?: "list" | "timeline";
}) {
  const [showAll, setShowAll] = useState(false);
  const { data: logs = [], isLoading } = useSWR(
    `content-history:${contentId}`,
    () => fetchHistory(contentId)
  );

  const visibleLogs =
    variant === "timeline" && !showAll ? logs.slice(0, 4) : logs;

  return (
    <div className="space-y-3">
      {variant === "timeline" ? (
        <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-800 uppercase">
          Activity Log
        </p>
      ) : (
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-stone-800">
            ประวัติการแก้ไข
          </h3>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-stone-400">กำลังโหลด...</p>
      ) : logs.length === 0 ? (
        <p
          className={cn(
            "text-center text-sm text-stone-400",
            variant === "timeline"
              ? "py-6"
              : "rounded-lg border border-dashed border-stone-200 py-6"
          )}
        >
          ยังไม่มีประวัติการแก้ไข
        </p>
      ) : variant === "timeline" ? (
        <>
          <ol className="relative ml-1.5 space-y-0 border-l border-stone-200">
            {visibleLogs.map((log, index) => {
              const isLatest = index === 0;
              return (
                <li key={log.id} className="relative pb-5 pl-6 last:pb-0">
                  <span className="absolute top-0.5 -left-[9px] flex h-[18px] w-[18px] items-center justify-center bg-white">
                    {isLatest ? (
                      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-sky-600">
                        <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                      </span>
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-stone-300" />
                    )}
                  </span>
                  <p className="text-sm font-semibold text-slate-900">
                    {activityTitle(log)}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-400">
                    {formatActivityWhen(log.createdAt)} · {log.actorName}
                  </p>
                </li>
              );
            })}
          </ol>
          {logs.length > 4 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="w-full pt-1 text-center text-sm font-medium text-sky-700 hover:text-sky-800"
            >
              {showAll ? "Show less" : "View Full Edit History"}
            </button>
          )}
        </>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="rounded-lg border border-stone-200 bg-white px-3 py-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-stone-800">
                  {log.actorName}{" "}
                  <span className="font-normal text-stone-500">
                    {log.action === "status_changed"
                      ? "เปลี่ยนสถานะ"
                      : "แก้ไขรายละเอียด"}
                  </span>
                </p>
                <p className="text-xs text-stone-400">
                  {formatThaiDate(log.createdAt.slice(0, 10))} ·{" "}
                  {new Date(log.createdAt).toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {log.changes.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-stone-600">
                  {log.changes.map((change, index) => (
                    <li key={`${log.id}-${index}`}>
                      <span className="font-medium">{change.field}</span>
                      {change.before !== undefined || change.after !== undefined
                        ? `: ${stringifyValue(change.before)} → ${stringifyValue(change.after)}`
                        : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
