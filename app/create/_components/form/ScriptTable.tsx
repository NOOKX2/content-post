"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ScriptRow } from "@/lib/types";
import { generateId } from "@/lib/shared/utils";
import { toTimeInputValue } from "@/lib/content/domain/script";
import { uploadBrowserFile } from "@/lib/shared/storage/upload-browser";

interface ScriptTableProps {
  rows: ScriptRow[];
  onChange: (rows: ScriptRow[]) => void;
  hideAddButton?: boolean;
}

type ScriptField =
  | "startTime"
  | "endTime"
  | "speaker"
  | "action"
  | "dialogue"
  | "notes";

export function ScriptTable({
  rows,
  onChange,
  hideAddButton = false,
}: ScriptTableProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingRowId, setUploadingRowId] = useState<string | null>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");

  const addRow = () => {
    onChange([
      ...rows,
      {
        id: generateId(),
        startTime: "",
        endTime: "",
        speaker: "",
        action: "",
        dialogue: "",
        notes: "",
        imageUrl: "",
      },
    ]);
  };

  const removeRow = (id: string) => {
    onChange(rows.filter((r) => r.id !== id));
  };

  const updateRow = (id: string, field: ScriptField, value: string) => {
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

  const updateRowImage = (id: string, imageUrl: string) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, imageUrl } : r)));
  };

  const openImagePicker = (rowId: string) => {
    setUploadTargetId(rowId);
    setUploadError("");
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (file: File, rowId: string) => {
    setUploadingRowId(rowId);
    setUploadError("");

    try {
      const url = await uploadBrowserFile(file);
      updateRowImage(rowId, url);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "อัปโหลดรูปไม่สำเร็จ"
      );
    } finally {
      setUploadingRowId(null);
      setUploadTargetId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {!hideAddButton && (
        <div className="flex items-center justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={addRow}>
            <Plus className="h-4 w-4" />
            เพิ่มซีน
          </Button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && uploadTargetId) {
            void handleImageUpload(file, uploadTargetId);
          }
        }}
      />

      {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-stone-200 py-6 text-center text-sm text-stone-400">
          ยังไม่มีซีน-กด&quot;เพิ่มซีน&quot;สำหรับวิดีโอ
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="bg-stone-50 text-left">
                <th className="w-36 px-3 py-2.5 font-medium text-stone-600">
                  เวลาเริ่มต้น
                </th>
                <th className="w-36 px-3 py-2.5 font-medium text-stone-600">
                  เวลาสิ้นสุด
                </th>
                <th className="w-36 px-3 py-2.5 font-medium text-stone-600">
                  คนพูด
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
                <th className="w-36 px-3 py-2.5 font-medium text-stone-600">
                  เพิ่มรูปภาพ
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
                  {(
                    ["speaker", "action", "dialogue", "notes"] as const
                  ).map((field) => (
                    <td key={field} className="px-3 py-2">
                      <input
                        value={row[field]}
                        onChange={(e) =>
                          updateRow(row.id, field, e.target.value)
                        }
                        placeholder={
                          field === "speaker"
                            ? "คนพูด"
                            : field === "dialogue"
                              ? "Dialogue"
                              : field === "notes"
                                ? "Notes"
                                : "Action"
                        }
                        className="h-9 w-full rounded-md border border-stone-200 bg-white px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    {row.imageUrl ? (
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={row.imageUrl}
                          alt=""
                          className="h-12 w-12 rounded-md object-cover"
                        />
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => openImagePicker(row.id)}
                            disabled={uploadingRowId === row.id}
                            className="text-left text-xs font-medium text-blue-600 hover:text-blue-700"
                          >
                            เปลี่ยนรูป
                          </button>
                          <button
                            type="button"
                            onClick={() => updateRowImage(row.id, "")}
                            className="text-left text-xs text-stone-400 hover:text-red-500"
                          >
                            ลบรูป
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openImagePicker(row.id)}
                        disabled={uploadingRowId === row.id}
                        className="flex h-16 w-full min-w-[120px] flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-pink-200 bg-pink-50/30 px-2 text-center transition hover:border-pink-300 hover:bg-pink-50/50 disabled:opacity-60"
                      >
                        {uploadingRowId === row.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-pink-600" />
                        ) : (
                          <>
                            <ImagePlus className="h-4 w-4 text-pink-600" />
                            <span className="text-xs font-medium leading-tight text-stone-600">
                              คลิกเลือกรูป
                            </span>
                          </>
                        )}
                      </button>
                    )}
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
