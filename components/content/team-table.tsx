"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreatableSingleSelect } from "@/components/ui/creatable-single-select";
import { TEAM_MEMBERS, RESPONSIBILITIES } from "@/lib/constants";
import type { TeamRow } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface TeamTableProps {
  rows: TeamRow[];
  onChange: (rows: TeamRow[]) => void;
  hideAddButton?: boolean;
}

export function TeamTable({
  rows,
  onChange,
  hideAddButton = false,
}: TeamTableProps) {
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
    onChange(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  return (
    <div className="space-y-3">
      {!hideAddButton && (
        <div className="flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={addRow}>
            <Plus className="h-4 w-4" />
            เพิ่มแถว
          </Button>
        </div>
      )}

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-stone-200 py-6 text-center text-sm text-stone-400">
          ยังไม่มีผู้เข้าร่วม — กด &quot;เพิ่มแถว&quot; เพื่อเพิ่ม
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-[46%]" />
              <col className="w-[46%]" />
              <col className="w-[8%]" />
            </colgroup>
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
                  <td className="overflow-hidden px-3 py-2">
                    <CreatableSingleSelect
                      options={TEAM_MEMBERS}
                      value={row.participant}
                      onChange={(value) =>
                        updateRow(row.id, "participant", value)
                      }
                      placeholder="เลือกชื่อ..."
                      customPlaceholder="พิมพ์ชื่อ..."
                      customOptionLabel="ระบุเอง..."
                    />
                  </td>
                  <td className="overflow-hidden px-3 py-2">
                    <CreatableSingleSelect
                      options={RESPONSIBILITIES}
                      value={row.responsibility}
                      onChange={(value) =>
                        updateRow(row.id, "responsibility", value)
                      }
                      placeholder="เลือกหน้าที่..."
                      customPlaceholder="พิมพ์หน้าที่..."
                      customOptionLabel="ระบุเอง..."
                    />
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
