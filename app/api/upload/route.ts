import { NextResponse } from "next/server";
import path from "path";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { uploadToR2, isR2Configured } from "@/lib/shared/storage/r2";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 200 * 1024 * 1024;

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

const PDF_MIME_TYPES = new Set(["application/pdf"]);

const ALLOWED_MIME_TYPES = new Set([
  ...IMAGE_MIME_TYPES,
  ...VIDEO_MIME_TYPES,
  ...PDF_MIME_TYPES,
]);

function getExtension(filename: string, mimeType: string): string {
  const fromName = path.extname(filename).toLowerCase();
  if (fromName) return fromName;

  const fallback: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "application/pdf": ".pdf",
    "video/mp4": ".mp4",
    "video/quicktime": ".mov",
    "video/webm": ".webm",
  };

  return fallback[mimeType] ?? "";
}

function isVideoFile(file: File) {
  if (VIDEO_MIME_TYPES.has(file.type)) return true;
  return /\.(mp4|mov|webm|m4v)$/i.test(file.name);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isR2Configured()) {
    return NextResponse.json(
      { error: "ระบบอัปโหลดยังไม่พร้อม กรุณาตั้งค่า Cloudflare R2" },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const kind = String(formData.get("kind") ?? "any");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
    }

    if (kind === "video") {
      if (!isVideoFile(file)) {
        return NextResponse.json(
          { error: "อัปโหลดได้เฉพาะไฟล์วิดีโอ (.mp4, .mov, .webm)" },
          { status: 400 }
        );
      }
    } else if (!ALLOWED_MIME_TYPES.has(file.type) && !isVideoFile(file)) {
      return NextResponse.json(
        { error: "รองรับเฉพาะไฟล์รูปภาพ, PDF หรือวิดีโอ" },
        { status: 400 }
      );
    }

    const maxSize = isVideoFile(file) ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: isVideoFile(file)
            ? "ไฟล์วิดีโอต้องไม่เกิน 200 MB"
            : "ไฟล์ต้องไม่เกิน 10 MB",
        },
        { status: 400 }
      );
    }

    const contentType =
      file.type ||
      (isVideoFile(file)
        ? file.name.toLowerCase().endsWith(".webm")
          ? "video/webm"
          : file.name.toLowerCase().endsWith(".mov")
            ? "video/quicktime"
            : "video/mp4"
        : "application/octet-stream");

    const ext = getExtension(file.name, contentType);
    const filename = `${randomUUID()}${ext}`;
    const key = `uploads/${filename}`;

    const url = await uploadToR2({
      key,
      body: Buffer.from(await file.arrayBuffer()),
      contentType,
    });

    return NextResponse.json({
      url,
      key,
      name: file.name,
    });
  } catch (error) {
    console.error("[upload] failed", error);
    return NextResponse.json(
      { error: "อัปโหลดไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}
