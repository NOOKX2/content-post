"use client";

import { useRef, useState } from "react";
import {
  FileUp,
  Link2,
  Loader2,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentFormSection } from "@/components/content/content-form-section";
import { cn } from "@/lib/utils";
import {
  getAttachmentFilename,
  isUploadedAttachment,
} from "@/lib/content/attachments";
import { isVideoMediaUrl } from "@/lib/content/media-url";

const VIDEO_ACCEPT = "video/mp4,video/quicktime,video/webm";
const VIDEO_MIME = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);
const VIDEO_EXT = /\.(mp4|mov|webm|m4v)$/i;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

interface AttachmentLinksProps {
  links: string[];
  onChange: (links: string[]) => void;
  /** Hide inline section title when wrapped in a Card with its own title */
  hideHeader?: boolean;
  /** Hide top toolbar when rendered in a parent card header */
  hideToolbar?: boolean;
  /** Card layout with title, description, and toolbar in the header row */
  layout?: "default" | "section";
}

function isVideoAttachment(value: string) {
  return isVideoMediaUrl(value);
}

export function AttachmentLinks({
  links,
  onChange,
  hideHeader = false,
  hideToolbar = false,
  layout = "default",
}: AttachmentLinksProps) {
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

    const invalid = fileList.find(
      (file) =>
        !VIDEO_MIME.has(file.type) &&
        !VIDEO_EXT.test(file.name)
    );
    if (invalid) {
      setError("อัปโหลดได้เฉพาะไฟล์วิดีโอ (.mp4, .mov, .webm)");
      return;
    }

    const tooLarge = fileList.find((file) => file.size > MAX_VIDEO_BYTES);
    if (tooLarge) {
      setError("ไฟล์วิดีโอต้องไม่เกิน 200 MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const uploaded: string[] = [];

      for (const file of fileList) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("kind", "video");

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

  const openFilePicker = () => {
    if (!uploading) {
      fileInputRef.current?.click();
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

  const toolbar = (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={addLink}>
        <Plus className="h-4 w-4" />
        เพิ่มลิงก์วิดีโอ
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={openFilePicker}
        disabled={uploading}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileUp className="h-4 w-4" />
        )}
        อัปโหลดวิดีโอ
      </Button>
    </>
  );

  const body = (
    <>
      {layout === "default" && (
        <p className="text-xs text-stone-500">
          อัปโหลดไฟล์วิดีโอ (.mp4 / .mov / .webm) สูงสุด 200 MB
          หรือวางลิงก์วิดีโอสาธารณะ (Google Drive, Dropbox ฯลฯ)
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={VIDEO_ACCEPT}
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={openFilePicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openFilePicker();
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          "rounded-lg border border-dashed px-4 py-5 transition-colors cursor-pointer",
          uploading
            ? "border-blue-300 bg-blue-50/50"
            : "border-stone-300 bg-stone-50 hover:border-stone-400 hover:bg-stone-100/80"
        )}
      >
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            ) : (
              <Video className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-stone-700">
              {uploading ? "กำลังอัปโหลด..." : "คลิกเพื่อเลือกวิดีโอจากเครื่อง"}
            </p>
            <p className="text-xs text-stone-500">
              หรือลากวิดีโอมาวางที่นี่
              {!hideToolbar ? ' · กด "เพิ่มลิงก์วิดีโอ" สำหรับ URL' : ""}
            </p>
          </div>
        </div>

        {hideToolbar && (
          <div
            className="mt-4 flex flex-wrap justify-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openFilePicker}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileUp className="h-4 w-4" />
              )}
              เลือกวิดีโอ
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={addLink}>
              <Plus className="h-4 w-4" />
              เพิ่มลิงก์
            </Button>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {fileRows.length > 0 && (
        <div className="space-y-2">
          {fileRows.map(({ link, index }) => (
            <div
              key={`${link}-${index}`}
              className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-3 py-2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded bg-stone-100">
                <FileUp className="h-4 w-4 text-stone-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-800">
                  {getAttachmentFilename(link)}
                </p>
                <p className="truncate text-xs text-stone-500">{link}</p>
                {!isVideoAttachment(link) && (
                  <p className="text-xs text-amber-600">
                    ไฟล์นี้ไม่ใช่วิดีโอ — Buffer อาจโพสต์ไม่สำเร็จ
                  </p>
                )}
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
        <div className="space-y-3">
          {linkRows.map(({ link, index }) => (
            <div
              key={index}
              className="rounded-lg border border-stone-200 bg-white p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
                  <Link2 className="h-4 w-4 text-stone-500" />
                  ลิงก์วิดีโอ
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="rounded p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-500"
                  aria-label="ลบลิงก์"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <input
                type="url"
                value={link}
                onChange={(e) => updateLink(index, e.target.value)}
                placeholder="https://... วางลิงก์วิดีโอสาธารณะ"
                className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          ))}
        </div>
      )}
    </>
  );

  if (layout === "section") {
    return (
      <ContentFormSection
        title="ตัวอย่าง"
        description="อัปโหลดไฟล์วิดีโอ หรือแนบลิงก์วิดีโอสาธารณะ"
        icon={Video}
        className="border-amber-100"
        actions={toolbar}
        bodyClassName="space-y-3"
      >
        <p className="text-xs text-stone-500">
          อัปโหลดไฟล์วิดีโอ (.mp4 / .mov / .webm) สูงสุด 200 MB
          หรือวางลิงก์วิดีโอสาธารณะ (Google Drive, Dropbox ฯลฯ)
        </p>
        {body}
      </ContentFormSection>
    );
  }

  return (
    <div className="space-y-3">
      {!hideToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {!hideHeader && (
            <span className="text-sm font-medium text-stone-700">ตัวอย่าง</span>
          )}
          <div
            className={cn(
              "flex flex-wrap gap-2",
              hideHeader && "ml-auto"
            )}
          >
            {toolbar}
          </div>
        </div>
      )}

      {body}
    </div>
  );
}
