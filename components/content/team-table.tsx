"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEAM_MEMBERS, RESPONSIBILITIES } from "@/lib/constants";
import type { TeamRow } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface TeamTableProps {
  rows: TeamRow[];
  onChange: (rows: TeamRow[]) => void;
}

export function TeamTable({ rows, onChange }: TeamTableProps) {
  const addRow = () => {
    onChange([
      ...rows,
      { id: generateId(), participant: "", responsibility: "" },
    ]);
  };

  const removeRow = (id: string) => {
    onChange(rows.filter((r) => r.id !== id));
  };

  const updateRow = (id: string, field: keyof TeamRow, value: string) => {
    onChange(
      rows.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-stone-700">
          ผู้เข้าร่วม & หน้าที่รับผิดชอบ
        </h4>
        <Button type="button" variant="ghost" size="sm" onClick={addRow}>
          <Plus className="h-4 w-4" />
          เพิ่มแถว
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-stone-200 py-6 text-center text-sm text-stone-400">
          ยังไม่มีผู้เข้าร่วม — กด &quot;เพิ่มแถว&quot; เพื่อเพิ่ม
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-left">
                <th className="px-3 py-2.5 font-medium text-stone-600">
                  ผู้เข้าร่วม
                </th>
                <th className="px-3 py-2.5 font-medium text-stone-600">
                  หน้าที่รับผิดชอบ
                </th>
                <th className="w-10 px-2 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-stone-100">
                  <td className="px-3 py-2">
                    <select
                      value={row.participant}
                      onChange={(e) =>
                        updateRow(row.id, "participant", e.target.value)
                      }
                      className="h-9 w-full rounded-md border border-stone-200 bg-white px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">เลือก...</option>
                      {TEAM_MEMBERS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={row.responsibility}
                      onChange={(e) =>
                        updateRow(row.id, "responsibility", e.target.value)
                      }
                      className="h-9 w-full rounded-md border border-stone-200 bg-white px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">เลือก...</option>
                      {RESPONSIBILITIES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
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
