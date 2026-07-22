"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ScriptRow } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { toTimeInputValue } from "@/lib/content/script";

interface ScriptTableProps {
  rows: ScriptRow[];
  onChange: (rows: ScriptRow[]) => void;
  hideAddButton?: boolean;
}

type ScriptField = "startTime" | "endTime" | "action" | "dialogue" | "notes";

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
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        throw new Error(data.error || "อัปโหลดรูปไม่สำเร็จ");
      }

      updateRowImage(rowId, data.url);
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
            เพิ่ม Scene
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
          ยังไม่มี Scene — กด &quot;เพิ่ม Scene&quot; สำหรับ Video
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-stone-200">
          <table className="w-full min-w-[880px] text-sm">
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
                  <td className="px-3 py-2">
                    {row.imageUrl ? (
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={row.imageUrl}
                          alt=""
                          className="h-9 w-9 rounded object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => updateRowImage(row.id, "")}
                          className="rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-500"
                          aria-label="ลบรูป"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2"
                        disabled={uploadingRowId === row.id}
                        onClick={() => openImagePicker(row.id)}
                      >
                        {uploadingRowId === row.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ImagePlus className="h-4 w-4" />
                        )}
                        รูป
                      </Button>
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
