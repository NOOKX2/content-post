"use client";

import useSWR from "swr";
import { History } from "lucide-react";
import type { AuditLogItem } from "@/lib/collaboration/team-types";
import { formatThaiDate } from "@/lib/utils";

async function fetchHistory(contentId: string) {
  const res = await fetch(`/api/content/${contentId}/history`);
  const data = (await res.json()) as { logs?: AuditLogItem[]; error?: string };
  if (!res.ok) throw new Error(data.error || "โหลดประวัติไม่สำเร็จ");
  return data.logs ?? [];
}

export function ContentHistoryPanel({ contentId }: { contentId: string }) {
  const { data: logs = [], isLoading } = useSWR(
    `content-history:${contentId}`,
    () => fetchHistory(contentId)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-stone-500" />
        <h3 className="text-sm font-semibold text-stone-800">ประวัติการแก้ไข</h3>
      </div>

      {isLoading ? (
        <p className="text-sm text-stone-400">กำลังโหลด...</p>
      ) : logs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-stone-200 py-6 text-center text-sm text-stone-400">
          ยังไม่มีประวัติการแก้ไข
        </p>
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
