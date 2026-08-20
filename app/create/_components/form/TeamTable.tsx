"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CreatableSingleSelect } from "@/components/ui/CreatableSingleSelect";
import { flatLabelClass } from "@/lib/shared/form-field-styles";
import { TEAM_MEMBERS, RESPONSIBILITIES } from "@/lib/constants";
import type { TeamRow } from "@/lib/types";
import { generateId } from "@/lib/shared/utils";

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
    <div className="space-y-4">
      {!hideAddButton && (
        <div className="flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={addRow}>
            <Plus className="h-4 w-4" />
            เพิ่มแถว
          </Button>
        </div>
      )}

      {rows.length === 0 ? (
        <p className="py-4 text-center text-sm text-stone-400">
          ยังไม่มีผู้เข้าร่วม — กด &quot;เพิ่มแถว&quot; เพื่อเพิ่ม
        </p>
      ) : (
        <div className="space-y-4">
          {rows.length > 0 && (
            <div className="hidden gap-4 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <span className={flatLabelClass}>ผู้เข้าร่วม</span>
              <span className={flatLabelClass}>หน้าที่รับผิดชอบ</span>
              <span className="w-8" />
            </div>
          )}
          {rows.map((row) => (
            <div
              key={row.id}
              className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
            >
              <CreatableSingleSelect
                options={TEAM_MEMBERS}
                value={row.participant}
                onChange={(value) => updateRow(row.id, "participant", value)}
                placeholder="เลือกชื่อ..."
                customPlaceholder="อื่นๆ..."
                customOptionLabel="ระบุเอง..."
                variant="flat"
              />
              <CreatableSingleSelect
                options={RESPONSIBILITIES}
                value={row.responsibility}
                onChange={(value) =>
                  updateRow(row.id, "responsibility", value)
                }
                placeholder="เลือกหน้าที่..."
                customPlaceholder="อื่นๆ..."
                customOptionLabel="ระบุเอง..."
                variant="flat"
              />
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className="rounded p-1 text-stone-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
