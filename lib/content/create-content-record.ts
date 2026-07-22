import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  CONTENTS_CACHE_TAG,
} from "@/lib/content/cache-tags";
import {
  formDataToCreateInput,
  toContentItem,
} from "@/lib/content/mappers";
import {
  postApprovalRequest,
  syncContentWorkflowToCollaboration,
} from "@/lib/collaboration/service";
import {
  formatChannelContentId,
  MAX_CONTENT_ID_SEQUENCE,
  parseChannelContentIdSequence,
  resolveNextContentIdForChannel,
} from "@/lib/content/content-id";
import {
  getAvailablePlatformsForPostingChannel,
  getPostingChannelPrefix,
  isValidPostingChannel,
} from "@/lib/content/posting-channels";
import { isVideoAttachmentUrl } from "@/lib/content/media-url";
import type { ContentFormData, ContentItem } from "@/lib/types";

export async function validateContentFormData(
  data: ContentFormData
): Promise<string | null> {
  if (!data.name?.trim()) {
    return "กรุณากรอกชื่อ Content";
  }

  if (!data.channel?.trim()) {
    return "กรุณาเลือกช่องที่ลง";
  }

  if (!(await isValidPostingChannel(data.channel))) {
    return "ช่องที่ลงไม่ถูกต้อง";
  }

  if (!data.platforms.length) {
    return "กรุณาเลือกแพลตฟอร์มอย่างน้อย 1 แพลตฟอร์ม";
  }

  const available = await getAvailablePlatformsForPostingChannel(data.channel);
  const invalid = data.platforms.filter((p) => !available.includes(p));
  if (invalid.length > 0) {
    return `แพลตฟอร์มไม่รองรับสำหรับช่องนี้: ${invalid.join(", ")}`;
  }

  if (data.mediaType === "video") {
    const attachments = (data.attachments ?? []).filter((url) => url.trim());
    if (attachments.length === 0) {
      return "กรุณาอัปโหลดหรือแนบลิงก์วิดีโออย่างน้อย 1 ไฟล์";
    }
    if (!attachments.some((url) => isVideoAttachmentUrl(url))) {
      return "กรุณาแนบลิงก์วิดีโอหรือไฟล์วิดีโออย่างน้อย 1 รายการ";
    }
  }

  return null;
}

export async function createContentRecord(
  data: ContentFormData,
  userId: string,
  actorName: string
): Promise<ContentItem> {
  const validationError = await validateContentFormData(data);
  if (validationError) {
    throw new Error(validationError);
  }

  let nextContentId = await resolveNextContentIdForChannel(data.channel, prisma);
  let attempts = 0;

  while (attempts < 5) {
    const existing = await prisma.content.findUnique({
      where: { contentId: nextContentId },
    });
    if (!existing) break;

    const prefix = await getPostingChannelPrefix(data.channel);
    const sequence = prefix
      ? parseChannelContentIdSequence(nextContentId, prefix)
      : null;
    if (!prefix || sequence === null || sequence >= MAX_CONTENT_ID_SEQUENCE) {
      break;
    }
    nextContentId = formatChannelContentId(prefix, sequence + 1);
    attempts++;
  }

  const record = await prisma.content.create({
    data: formDataToCreateInput(data, nextContentId, userId),
  });

  await postApprovalRequest(record, actorName);
  await syncContentWorkflowToCollaboration({
    content: record,
    actorName,
    action: "submitted",
  });

  updateTag(CONTENTS_CACHE_TAG);
  revalidatePath("/calendar");
  revalidatePath("/admin");
  revalidatePath("/create");
  revalidatePath("/posts");

  return toContentItem(record);
}
