import {
  resolveUploadContentType,
  validateUpload,
} from "@/lib/shared/storage/upload";

const APP_PROXY_LIMIT = 4 * 1024 * 1024;

async function parseUploadResponse(response: Response) {
  const text = await response.text();
  try {
    return {
      data: JSON.parse(text) as { url?: string; uploadUrl?: string; error?: string },
      text,
    };
  } catch {
    return { data: null, text };
  }
}

function responseError(response: Response, text: string, fallback: string) {
  if (response.status === 413 || /request entity too large/i.test(text)) {
    return "ไฟล์ใหญ่เกินลิมิตของ Vercel (ประมาณ 4.5 MB)";
  }
  return text.trim().slice(0, 160) || fallback;
}

async function uploadThroughApp(file: File, kind: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("kind", kind);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  const { data, text } = await parseUploadResponse(response);

  if (!response.ok || !data?.url) {
    throw new Error(
      data?.error || responseError(response, text, "อัปโหลดไม่สำเร็จ")
    );
  }

  return data.url;
}

export async function uploadBrowserFile(
  file: File,
  kind: "video" | "any" = "any"
): Promise<string> {
  const contentType = resolveUploadContentType(file.name, file.type);
  const validationError = validateUpload({
    filename: file.name,
    contentType,
    size: file.size,
    kind,
  });
  if (validationError) {
    throw new Error(validationError);
  }

  const presignResponse = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType,
      size: file.size,
      kind,
    }),
  });
  const { data, text } = await parseUploadResponse(presignResponse);

  if (!presignResponse.ok || !data?.uploadUrl || !data.url) {
    throw new Error(
      data?.error ||
        responseError(presignResponse, text, "ไม่สามารถเริ่มอัปโหลดได้")
    );
  }

  try {
    const putResponse = await fetch(data.uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": contentType },
    });

    if (putResponse.ok) {
      return data.url;
    }

    if (file.size <= APP_PROXY_LIMIT) {
      return uploadThroughApp(file, kind);
    }

    throw new Error(
      `อัปโหลดวิดีโอตรงไปคลังไฟล์ไม่สำเร็จ (${putResponse.status}) — ตรวจ CORS ของ Cloudflare R2 ให้โดเมนนี้ใช้ PUT ได้`
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("คลังไฟล์")) {
      throw error;
    }
  }

  if (file.size <= APP_PROXY_LIMIT) {
    return uploadThroughApp(file, kind);
  }

  throw new Error(
    "อัปโหลดวิดีโอตรงไปคลังไฟล์ไม่สำเร็จ ตั้งค่า CORS บน Cloudflare R2 ให้โดเมนนี้ใช้ PUT ได้"
  );
}
