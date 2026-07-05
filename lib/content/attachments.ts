export function isUploadedAttachment(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/uploads/")) return true;
  return /\/uploads\/[^/?#]+$/i.test(trimmed);
}

export function getAttachmentFilename(value: string): string {
  const pathname = value.split("?")[0];
  return pathname.split("/").pop() ?? "ไฟล์ที่อัปโหลด";
}
