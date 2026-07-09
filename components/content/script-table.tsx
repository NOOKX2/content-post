"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ScriptRow } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { toTimeInputValue } from "@/lib/content/script";

interface ScriptTableProps {
  rows: ScriptRow[];
  onChange: (rows: ScriptRow[]) => void;
}

export function ScriptTable({ rows, onChange }: ScriptTableProps) {
  const addRow = () => {
    onChange([
      ...rows,
      {
        id: generateId(),
        startTime: "",
        endTime: "",
        action: "",
        dialogue: "",
        notes: "",
      },
    ]);
  };

  const removeRow = (id: string) => {
    onChange(rows.filter((r) => r.id !== id));
  };

  const updateRow = (
    id: string,
    field: "startTime" | "endTime" | "action" | "dialogue" | "notes",
    value: string
  ) => {
    onChange(
      rows.map((r) =>
        r.id === id
          ? {
              ...r,
              [field]:
                field === "startTime" || field === "endTime"
                  ? toTimeInputValue(value) || value
                  : value,
            }
          : r
      )
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-stone-700">สคริป</h4>
        <Button type="button" variant="ghost" size="sm" onClick={addRow}>
          <Plus className="h-4 w-4" />
          เพิ่ม Scene
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-stone-200 py-6 text-center text-sm text-stone-400">
          ยังไม่มี Script — กด &quot;เพิ่ม Scene&quot; สำหรับ Video
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="bg-stone-50 text-left">
                <th className="w-36 px-3 py-2.5 font-medium text-stone-600">
                  เวลาเริ่มต้น
                </th>
                <th className="w-36 px-3 py-2.5 font-medium text-stone-600">
                  เวลาสิ้นสุด
                </th>
                <th className="px-3 py-2.5 font-medium text-stone-600">
                  Action
                </th>
                <th className="px-3 py-2.5 font-medium text-stone-600">
                  บทพูด
                </th>
                <th className="px-3 py-2.5 font-medium text-stone-600">
                  หมายเหตุ
                </th>
                <th className="w-10 px-2 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-stone-100">
                  <td className="px-3 py-2">
                    <input
                      type="time"
                      step={60}
                      value={toTimeInputValue(row.startTime)}
                      onChange={(e) =>
                        updateRow(row.id, "startTime", e.target.value)
                      }
                      className="h-9 w-full rounded-md border border-stone-200 bg-white px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="time"
                      step={60}
                      value={toTimeInputValue(row.endTime)}
                      onChange={(e) =>
                        updateRow(row.id, "endTime", e.target.value)
                      }
                      className="h-9 w-full rounded-md border border-stone-200 bg-white px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </td>
                  {(["action", "dialogue", "notes"] as const).map((field) => (
                    <td key={field} className="px-3 py-2">
                      <input
                        value={row[field]}
                        onChange={(e) =>
                          updateRow(row.id, field, e.target.value)
                        }
                        placeholder={
                          field === "dialogue"
                            ? "Dialogue"
                            : field === "notes"
                              ? "Notes"
                              : "Action"
                        }
                        className="h-9 w-full rounded-md border border-stone-200 bg-white px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
