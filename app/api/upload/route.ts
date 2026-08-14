import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import {
  createPresignedUpload,
  isR2Configured,
  uploadToR2,
} from "@/lib/shared/storage/r2";
import {
  getUploadExtension,
  resolveUploadContentType,
  validateUpload,
} from "@/lib/shared/storage/upload";

function buildObjectKey(filename: string, contentType: string) {
  const ext = getUploadExtension(filename, contentType);
  return `uploads/${randomUUID()}${ext}`;
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

  const contentTypeHeader = request.headers.get("content-type") ?? "";

  try {
    if (contentTypeHeader.includes("application/json")) {
      const body = (await request.json()) as {
        filename?: string;
        contentType?: string;
        size?: number;
        kind?: string;
      };
      const filename = body.filename?.trim() ?? "";
      const contentType = resolveUploadContentType(
        filename,
        body.contentType ?? ""
      );
      const size = Number(body.size ?? 0);

      const error = validateUpload({
        filename,
        contentType,
        size,
        kind: body.kind,
      });
      if (error) {
        return NextResponse.json({ error }, { status: 400 });
      }

      const key = buildObjectKey(filename, contentType);
      const { uploadUrl, publicUrl } = await createPresignedUpload({
        key,
        contentType,
      });

      return NextResponse.json({
        uploadUrl,
        url: publicUrl,
        key,
        name: filename,
      });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const kind = String(formData.get("kind") ?? "any");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
    }

    const contentType = resolveUploadContentType(file.name, file.type);
    const error = validateUpload({
      filename: file.name,
      contentType,
      size: file.size,
      kind,
    });
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const key = buildObjectKey(file.name, contentType);
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
