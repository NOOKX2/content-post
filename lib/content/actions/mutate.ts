"use server";

import { revalidatePath, updateTag } from "next/cache";
import {
  CONTENTS_CACHE_TAG,
  contentCacheTag,
} from "@/lib/content/data/cache-tags";
import { auth } from "@/auth";
import { prisma } from "@/lib/shared/prisma";
import {
  formDataToUpdateInput,
  toContentItem,
} from "@/lib/content/data/mappers";
import {
  formatActionError,
  logActionError,
} from "@/lib/content/actions/errors";
import { assertCanModifyContent } from "@/lib/content/domain/permissions";
import {
  syncContentWorkflowToCollaboration,
} from "@/lib/collaboration/data/service";
import {
  detectContentChanges,
  notifyApprovalRejected,
  notifyContentDetailChanged,
} from "@/lib/notifications/domain/events";
import { writeContentUpdateAudit } from "@/lib/content/data/audit";
import { isAdminRole } from "@/lib/auth/domain/roles";
import {
  resolveNextContentIdForChannel,
} from "@/lib/content/data/content-id";
import {
  isValidPostingChannel,
} from "@/lib/content/posting/posting-channels";
import { createContentRecord, validateContentFormData, resubmitIdeaForApprovalRecord, submitClipForApprovalRecord } from "@/lib/content/actions/create";
import { approveContentRecord } from "@/lib/content/actions/approve";
import type { ContentFormData, ContentItem } from "@/lib/types";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function previewNextContentId(
  channel: string,
  platform?: import("@/lib/types").Platform
): Promise<ActionResult<string>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  if (!channel.trim()) {
    return { success: false, error: "กรุณาเลือกช่องที่ลง" };
  }

  if (!(await isValidPostingChannel(channel, platform ? [platform] : undefined))) {
    return { success: false, error: "ช่องที่ลงไม่ถูกต้อง" };
  }

  try {
    const nextContentId = await resolveNextContentIdForChannel(
      channel,
      prisma,
      platform
    );
    return { success: true, data: nextContentId };
  } catch (error) {
    logActionError("previewNextContentId", error, { channel });
    return {
      success: false,
      error: formatActionError(error),
    };
  }
}

export async function createContent(
  data: ContentFormData
): Promise<ActionResult<ContentItem>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  if (isAdminRole(session.user.role)) {
    return { success: false, error: "Forbidden" };
  }

  try {
    const item = await createContentRecord(
      data,
      session.user.id,
      session.user.name ?? "ผู้ใช้"
    );
    return { success: true, data: item };
  } catch (error) {
    logActionError("createContent", error, {
      channel: data.channel,
      mediaType: data.mediaType,
      name: data.name,
      userId: session.user.id,
    });
    return {
      success: false,
      error: formatActionError(error),
    };
  }
}

export async function submitClipForApproval(
  id: string,
  data: ContentFormData
): Promise<ActionResult<ContentItem>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const existing = await prisma.content.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Not found" };
    }

    const forbidden = assertCanModifyContent(session, existing, "edit");
    if (forbidden) {
      return { success: false, error: forbidden };
    }

    const item = await submitClipForApprovalRecord(
      id,
      data,
      session.user.name ?? "ผู้ใช้"
    );
    return { success: true, data: item };
  } catch (error) {
    logActionError("submitClipForApproval", error, { id });
    return {
      success: false,
      error: formatActionError(error),
    };
  }
}

export async function resubmitIdeaForApproval(
  id: string,
  data: ContentFormData
): Promise<ActionResult<ContentItem>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const existing = await prisma.content.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Not found" };
    }

    const forbidden = assertCanModifyContent(session, existing, "edit");
    if (forbidden) {
      return { success: false, error: forbidden };
    }

    const item = await resubmitIdeaForApprovalRecord(
      id,
      data,
      session.user.name ?? "ผู้ใช้"
    );
    return { success: true, data: item };
  } catch (error) {
    logActionError("resubmitIdeaForApproval", error, { id });
    return {
      success: false,
      error: formatActionError(error),
    };
  }
}

export async function approveContent(
  id: string
): Promise<ActionResult<ContentItem>> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Forbidden" };
  }

  try {
    const record = await approveContentRecord(
      id,
      session.user.name || "Admin"
    );

    updateTag(CONTENTS_CACHE_TAG);
    updateTag(contentCacheTag(id));
    revalidatePath("/admin");
    revalidatePath("/calendar");
    revalidatePath("/posts");
    revalidatePath(`/content/${id}`);

    return { success: true, data: toContentItem(record) };
  } catch (error) {
    logActionError("approveContent", error, { id });
    return {
      success: false,
      error: formatActionError(error),
    };
  }
}

export async function updateContent(
  id: string,
  data: ContentFormData
): Promise<ActionResult<ContentItem>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const validationError = await validateContentFormData(data, { mode: "update" });
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const existing = await prisma.content.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Not found" };
    }

    const forbidden = assertCanModifyContent(session, existing, "edit");
    if (forbidden) {
      return { success: false, error: forbidden };
    }

    const updateData = formDataToUpdateInput(data);
    const record = await prisma.content.update({
      where: { id },
      data: updateData,
    });

    const changedFields = detectContentChanges(existing, data);
    if (changedFields.length > 0) {
      await notifyContentDetailChanged(record, changedFields, session.user.id);
      await writeContentUpdateAudit({
        before: existing,
        afterForm: data,
        changedFields,
        actorId: session.user.id,
        actorName: session.user.name ?? "ผู้ใช้",
      });
      await syncContentWorkflowToCollaboration({
        content: record,
        actorName: session.user.name ?? "ผู้ใช้",
        action: "updated",
      });
    }

    updateTag(CONTENTS_CACHE_TAG);
    updateTag(contentCacheTag(id));
    revalidatePath("/admin");
    revalidatePath("/calendar");
    revalidatePath("/posts");
    revalidatePath(`/content/${id}`);

    return { success: true, data: toContentItem(record) };
  } catch (error) {
    logActionError("updateContent", error, {
      id,
      mediaType: data.mediaType,
      name: data.name,
      userId: session.user.id,
    });
    return {
      success: false,
      error: formatActionError(error),
    };
  }
}

export async function deleteContent(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const existing = await prisma.content.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Not found" };
    }

    const forbidden = assertCanModifyContent(session, existing, "delete");
    if (forbidden) {
      return { success: false, error: forbidden };
    }

    await prisma.content.delete({ where: { id } });

    updateTag(CONTENTS_CACHE_TAG);
    updateTag(contentCacheTag(id));
    revalidatePath("/admin");
    revalidatePath("/calendar");
    revalidatePath("/posts");

    return { success: true, data: undefined };
  } catch (error) {
    logActionError("deleteContent", error, { id, userId: session.user.id });
    return {
      success: false,
      error: formatActionError(error),
    };
  }
}

export async function rejectContent(
  id: string,
  rejectNote?: string
): Promise<ActionResult<ContentItem>> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Forbidden" };
  }

  try {
    const existing = await prisma.content.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Not found" };
    }

    if (existing.status === "rejected") {
      return { success: true, data: toContentItem(existing) };
    }

    if (!["pending", "clip_pending"].includes(existing.status)) {
      return {
        success: false,
        error: "ไม่สามารถปฏิเสธงานในสถานะนี้ได้",
      };
    }

    const record = await prisma.content.update({
      where: { id },
      data: { status: "rejected", approver: null },
    });

    await notifyApprovalRejected(existing);
    await syncContentWorkflowToCollaboration({
      content: existing,
      actorName: session.user.name ?? "Admin",
      action: "rejected",
      note: rejectNote,
    });

    updateTag(CONTENTS_CACHE_TAG);
    updateTag(contentCacheTag(id));
    revalidatePath("/admin");
    revalidatePath("/calendar");
    revalidatePath("/posts");
    revalidatePath(`/content/${id}`);

    return { success: true, data: toContentItem(record) };
  } catch (error) {
    logActionError("rejectContent", error, { id });
    return {
      success: false,
      error: formatActionError(error),
    };
  }
}
