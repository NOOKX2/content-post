import { NextResponse } from "next/server";
import path from "path";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { uploadToR2, isR2Configured } from "@/lib/storage/r2";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "video/mp4",
  "video/quicktime",
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
  };

  return fallback[mimeType] ?? "";
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

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "รองรับเฉพาะไฟล์รูปภาพ, PDF หรือวิดีโอ" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "ไฟล์ต้องไม่เกิน 10 MB" },
        { status: 400 }
      );
    }

    const ext = getExtension(file.name, file.type);
    const filename = `${randomUUID()}${ext}`;
    const key = `uploads/${filename}`;

    const url = await uploadToR2({
      key,
      body: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
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
