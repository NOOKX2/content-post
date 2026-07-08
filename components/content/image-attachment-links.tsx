"use client";

import { useRef, useState } from "react";
import {
  FileUp,
  ImageIcon,
  Link2,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getAttachmentFilename,
  isUploadedAttachment,
} from "@/lib/content/attachments";

interface ImageAttachmentLinksProps {
  links: string[];
  onChange: (links: string[]) => void;
}

function isImageAttachment(value: string) {
  return /\.(jpe?g|png|webp|gif)$/i.test(value.split("?")[0]);
}

export function ImageAttachmentLinks({
  links,
  onChange,
}: ImageAttachmentLinksProps) {
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
    .filter(({ link }) => !isUploadedAttachment(link));

  const fileRows = links
    .map((link, index) => ({ link, index }))
    .filter(({ link }) => isUploadedAttachment(link));

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
            อัปโหลดรูป
          </Button>
        </div>
      </div>

      <p className="text-xs text-stone-500">
        แนบได้มากกว่า 1 รายการ — วางลิงก์ reference หรืออัปโหลดรูปภาพ (สูงสุด 10
        MB)
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          "rounded-lg border border-dashed px-4 py-6 transition-colors",
          uploading
            ? "border-pink-300 bg-pink-50/50"
            : "border-pink-200 bg-pink-50/30 hover:border-pink-300"
        )}
      >
        <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100">
            <ImageIcon className="h-5 w-5 text-pink-600" />
          </div>
          <p className="text-sm text-stone-600">
            ลากรูปมาวาง หรือกด &quot;อัปโหลดรูป&quot; / &quot;เพิ่มลิงก์&quot;
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {fileRows.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {fileRows.map(({ link, index }) => (
            <div
              key={`${link}-${index}`}
              className="overflow-hidden rounded-lg border border-stone-200 bg-white"
            >
              {isImageAttachment(link) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={link}
                  alt=""
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-stone-100">
                  <FileUp className="h-6 w-6 text-stone-400" />
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-2">
                <p className="min-w-0 flex-1 truncate text-xs text-stone-600">
                  {getAttachmentFilename(link)}
                </p>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="rounded p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-500"
                  aria-label="ลบไฟล์"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
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
