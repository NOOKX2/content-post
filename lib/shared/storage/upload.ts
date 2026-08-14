export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 200 * 1024 * 1024;

export const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

export const PDF_MIME_TYPES = new Set(["application/pdf"]);

const ALLOWED_MIME_TYPES = new Set([
  ...IMAGE_MIME_TYPES,
  ...VIDEO_MIME_TYPES,
  ...PDF_MIME_TYPES,
]);

export function isVideoFilename(filename: string) {
  return /\.(mp4|mov|webm|m4v)$/i.test(filename);
}

export function isVideoUpload(filename: string, mimeType: string) {
  return VIDEO_MIME_TYPES.has(mimeType) || isVideoFilename(filename);
}

export function resolveUploadContentType(filename: string, mimeType: string) {
  if (mimeType) return mimeType;
  const lower = filename.toLowerCase();
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".mov")) return "video/quicktime";
  if (lower.endsWith(".mp4") || lower.endsWith(".m4v")) return "video/mp4";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (/\.jpe?g$/i.test(lower)) return "image/jpeg";
  return "application/octet-stream";
}

export function getUploadExtension(filename: string, mimeType: string): string {
  const fromName = filename.toLowerCase().match(/\.[a-z0-9]+$/);
  if (fromName) return fromName[0];

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

export function validateUpload(input: {
  filename: string;
  contentType: string;
  size: number;
  kind?: string;
}): string | null {
  const kind = input.kind ?? "any";
  const video = isVideoUpload(input.filename, input.contentType);

  if (kind === "video") {
    if (!video) {
      return "อัปโหลดได้เฉพาะไฟล์วิดีโอ (.mp4, .mov, .webm)";
    }
  } else if (!ALLOWED_MIME_TYPES.has(input.contentType) && !video) {
    return "รองรับเฉพาะไฟล์รูปภาพ, PDF หรือวิดีโอ";
  }

  const maxSize = video ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (input.size > maxSize) {
    return video ? "ไฟล์วิดีโอต้องไม่เกิน 200 MB" : "ไฟล์ต้องไม่เกิน 10 MB";
  }

  return null;
}
