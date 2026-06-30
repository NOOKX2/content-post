"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ScriptRow } from "@/lib/types";
import { generateId } from "@/lib/utils";

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
        duration: "",
        action: "",
        dialogue: "",
        notes: "",
      },
    ]);
  };

  const removeRow = (id: string) => {
    onChange(rows.filter((r) => r.id !== id));
  };

  const updateRow = (id: string, field: keyof ScriptRow, value: string) => {
    onChange(
      rows.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-stone-700">Script / Storyboard</h4>
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
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="bg-stone-50 text-left">
                <th className="w-28 px-3 py-2.5 font-medium text-stone-600">
                  Duration
                </th>
                <th className="px-3 py-2.5 font-medium text-stone-600">
                  Action
                </th>
                <th className="px-3 py-2.5 font-medium text-stone-600">
                  Dialogue
                </th>
                <th className="px-3 py-2.5 font-medium text-stone-600">
                  Notes
                </th>
                <th className="w-10 px-2 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-stone-100">
                  {(["duration", "action", "dialogue", "notes"] as const).map(
                    (field) => (
                      <td key={field} className="px-3 py-2">
                        <input
                          value={row[field]}
                          onChange={(e) =>
                            updateRow(row.id, field, e.target.value)
                          }
                          placeholder={
                            field === "duration"
                              ? "0:00-0:15"
                              : field.charAt(0).toUpperCase() + field.slice(1)
                          }
                          className="h-9 w-full rounded-md border border-stone-200 bg-white px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </td>
                    )
                  )}
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
