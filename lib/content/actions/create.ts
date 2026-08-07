import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/shared/prisma";
import {
  CONTENTS_CACHE_TAG,
} from "@/lib/content/data/cache-tags";
import {
  formDataToCreateInput,
  formDataToUpdateInput,
  toContentItem,
} from "@/lib/content/data/mappers";
import {
  postApprovalRequest,
  syncContentWorkflowToCollaboration,
} from "@/lib/collaboration/data/service";
import {
  formatChannelContentId,
  MAX_CONTENT_ID_SEQUENCE,
  parseChannelContentIdSequence,
  resolveNextContentIdForChannel,
} from "@/lib/content/data/content-id";
import {
  resolvePostingTargetsFromSlugs,
} from "@/lib/integrations/buffer/posting-targets";
import {
  getAvailablePlatformsForPostingChannel,
  getPostingChannelPrefix,
  isValidPostingChannel,
} from "@/lib/content/posting/posting-channels";
import {
  hasExampleImages,
  hasFinalVideoClip,
} from "@/lib/content/domain/workflow";
import type { ContentFormData, ContentItem } from "@/lib/types";

export type ContentValidationMode =
  | "create"
  | "update"
  | "submit_idea"
  | "submit_clip";

export async function validateContentFormData(
  data: ContentFormData,
  options?: { mode?: ContentValidationMode }
): Promise<string | null> {
  const mode = options?.mode ?? "create";

  if (!data.name?.trim()) {
    return "กรุณากรอกชื่อ Content";
  }

  if (!data.postingTargets?.length) {
    if (!data.channel?.trim()) {
      return "กรุณาเลือกช่องที่ลง";
    }

    if (!(await isValidPostingChannel(data.channel, data.platforms))) {
      return "ช่องที่ลงไม่ถูกต้อง";
    }

    if (!data.platforms.length) {
      return "กรุณาเลือกแพลตฟอร์มอย่างน้อย 1 แพลตฟอร์ม";
    }

    const available = await getAvailablePlatformsForPostingChannel(
      data.channel,
      data.platforms[0]
    );
    const invalid = data.platforms.filter((p) => !available.includes(p));
    if (invalid.length > 0) {
      return `แพลตฟอร์มไม่รองรับสำหรับช่องนี้: ${invalid.join(", ")}`;
    }
  } else {
    const resolved = await resolvePostingTargetsFromSlugs(
      data.postingTargets.map((target) => target.bufferChannelId)
    );
    if (resolved.length !== data.postingTargets.length) {
      return "ช่องที่ลงไม่ถูกต้อง";
    }
  }

  if (!data.scheduledDate?.trim()) {
    return "กรุณาเลือกวันโพสต์";
  }

  if (!data.scheduledTime?.trim()) {
    return "กรุณาเลือกเวลาโพสต์";
  }

  if (data.mediaType === "video") {
    if (mode === "submit_clip") {
      if (!hasFinalVideoClip(data)) {
        return "กรุณาอัปโหลดหรือแนบลิงก์คลิปวิดีโอที่ตัดต่อแล้ว";
      }
      return null;
    }

    if (mode === "create" || mode === "submit_idea") {
      if (!hasExampleImages(data)) {
        return "กรุณาแนบรูปภาพตัวอย่างอย่างน้อย 1 รูป (ในส่วนรูปตัวอย่างหรือในสคริป)";
      }
      return null;
    }
  }

  return null;
}

export async function createContentRecord(
  data: ContentFormData,
  userId: string,
  actorName: string
): Promise<ContentItem> {
  const validationError = await validateContentFormData(data, { mode: "create" });
  if (validationError) {
    throw new Error(validationError);
  }

  const primaryTarget = data.postingTargets[0];
  const channelForId = primaryTarget?.name ?? data.channel;
  const platformForId = primaryTarget?.platform ?? data.platforms[0];

  let nextContentId = await resolveNextContentIdForChannel(
    channelForId,
    prisma,
    platformForId
  );
  let attempts = 0;

  while (attempts < 5) {
    const existing = await prisma.content.findUnique({
      where: { contentId: nextContentId },
    });
    if (!existing) break;

    const prefix = await getPostingChannelPrefix(channelForId, platformForId);
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

  await postApprovalRequest(record, actorName, { round: 1 });
  await syncContentWorkflowToCollaboration({
    content: record,
    actorName,
    action: "submitted",
    approvalRound: 1,
  });

  updateTag(CONTENTS_CACHE_TAG);
  revalidatePath("/calendar");
  revalidatePath("/admin");
  revalidatePath("/create");
  revalidatePath("/posts");

  return toContentItem(record);
}

export async function submitClipForApprovalRecord(
  id: string,
  data: ContentFormData,
  actorName: string
): Promise<ContentItem> {
  const validationError = await validateContentFormData(data, {
    mode: "submit_clip",
  });
  if (validationError) {
    throw new Error(validationError);
  }

  const existing = await prisma.content.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Not found");
  }

  if (existing.mediaType !== "video") {
    throw new Error("รองรับเฉพาะงานวิดีโอ");
  }

  if (!["idea_approved", "rejected"].includes(existing.status)) {
    throw new Error("สถานะงานไม่พร้อมส่งคลิปเพื่ออนุมัติ");
  }

  const record = await prisma.content.update({
    where: { id },
    data: {
      ...formDataToUpdateInput(data),
      status: "clip_pending",
      approver: null,
    },
  });

  await postApprovalRequest(record, actorName, { round: 2 });
  await syncContentWorkflowToCollaboration({
    content: record,
    actorName,
    action: "clip_submitted",
    approvalRound: 2,
  });

  updateTag(CONTENTS_CACHE_TAG);
  revalidatePath("/calendar");
  revalidatePath("/admin");
  revalidatePath("/create");
  revalidatePath("/posts");
  revalidatePath(`/content/${id}`);

  return toContentItem(record);
}

export async function resubmitIdeaForApprovalRecord(
  id: string,
  data: ContentFormData,
  actorName: string
): Promise<ContentItem> {
  const validationError = await validateContentFormData(data, {
    mode: "submit_idea",
  });
  if (validationError) {
    throw new Error(validationError);
  }

  const existing = await prisma.content.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Not found");
  }

  if (existing.mediaType !== "video") {
    throw new Error("รองรับเฉพาะงานวิดีโอ");
  }

  if (existing.status !== "rejected") {
    throw new Error("สถานะงานไม่พร้อมส่งแนวคิดเพื่ออนุมัติ");
  }

  const record = await prisma.content.update({
    where: { id },
    data: {
      ...formDataToUpdateInput(data),
      status: "pending",
      approver: null,
      attachments: [],
    },
  });

  await postApprovalRequest(record, actorName, { round: 1 });
  await syncContentWorkflowToCollaboration({
    content: record,
    actorName,
    action: "submitted",
    approvalRound: 1,
  });

  updateTag(CONTENTS_CACHE_TAG);
  revalidatePath("/calendar");
  revalidatePath("/admin");
  revalidatePath("/create");
  revalidatePath("/posts");
  revalidatePath(`/content/${id}`);

  return toContentItem(record);
}
