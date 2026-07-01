"use client";

import { useRef, useState } from "react";
import {
  FileUp,
  Link2,
  Loader2,
  Paperclip,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AttachmentLinksProps {
  links: string[];
  onChange: (links: string[]) => void;
}

function isImageAttachment(value: string) {
  return /\.(jpe?g|png|webp|gif)$/i.test(value);
}

function getAttachmentLabel(value: string) {
  if (value.startsWith("/uploads/")) {
    return value.split("/").pop() ?? "ไฟล์ที่อัปโหลด";
  }
  return value;
}

export function AttachmentLinks({ links, onChange }: AttachmentLinksProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const addLink = () => onChange([...links, ""]);

  const updateLink = (index: number, value: string) => {
    onChange(links.map((link, i) => (i === index ? value : link)));
  };

  const removeAttachment = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    setUploading(true);
    setError("");

    try {
      const uploaded: string[] = [];

      for (const file of fileList) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = (await res.json()) as { url?: string; error?: string };

        if (!res.ok || !data.url) {
          throw new Error(data.error || "อัปโหลดไม่สำเร็จ");
        }

        uploaded.push(data.url);
      }

      onChange([...links.filter((link) => link.trim()), ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      void uploadFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      void uploadFiles(e.dataTransfer.files);
    }
  };

  const linkRows = links
    .map((link, index) => ({ link, index }))
    .filter(({ link }) => !link.startsWith("/uploads/"));

  const fileRows = links
    .map((link, index) => ({ link, index }))
    .filter(({ link }) => link.startsWith("/uploads/"));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-stone-700">แนบตัวอย่าง</span>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={addLink}>
            <Plus className="h-4 w-4" />
            เพิ่มลิงก์
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileUp className="h-4 w-4" />
            )}
            อัปโหลดไฟล์
          </Button>
        </div>
      </div>

      <p className="text-xs text-stone-500">
        วางลิงก์ reference หรืออัปโหลดรูป / PDF / วิดีโอ (สูงสุด 10 MB)
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,video/mp4,video/quicktime"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          "rounded-lg border border-dashed px-4 py-5 transition-colors",
          uploading
            ? "border-blue-300 bg-blue-50/50"
            : "border-stone-300 bg-stone-50 hover:border-stone-400"
        )}
      >
        <div className="flex items-center gap-3">
          <Paperclip className="h-5 w-5 shrink-0 text-stone-400" />
          <p className="text-sm text-stone-600">
            ลากไฟล์มาวาง หรือกด &quot;อัปโหลดไฟล์&quot; / &quot;เพิ่มลิงก์&quot;
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {fileRows.length > 0 && (
        <div className="space-y-2">
          {fileRows.map(({ link, index }) => (
            <div
              key={`${link}-${index}`}
              className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-3 py-2"
            >
              {isImageAttachment(link) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={link}
                  alt=""
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded bg-stone-100">
                  <FileUp className="h-4 w-4 text-stone-500" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-800">
                  {getAttachmentLabel(link)}
                </p>
                <p className="truncate text-xs text-stone-500">ไฟล์ที่อัปโหลด</p>
              </div>
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="rounded p-2 text-stone-400 hover:bg-red-50 hover:text-red-500"
                aria-label="ลบไฟล์"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {linkRows.length > 0 && (
        <div className="space-y-2">
          {linkRows.map(({ link, index }) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-stone-100">
                <Link2 className="h-4 w-4 text-stone-500" />
              </div>
              <Input
                value={link}
                onChange={(e) => updateLink(index, e.target.value)}
                placeholder="https://..."
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="rounded p-2 text-stone-400 hover:bg-red-50 hover:text-red-500"
                aria-label="ลบลิงก์"
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
