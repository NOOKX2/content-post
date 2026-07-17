"use server";

import { revalidatePath, updateTag } from "next/cache";
import {
  CONTENTS_CACHE_TAG,
  contentCacheTag,
} from "@/lib/content/cache-tags";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  formDataToUpdateInput,
  toContentItem,
} from "@/lib/content/mappers";
import {
  formatActionError,
  logActionError,
} from "@/lib/content/action-errors";
import { assertCanModifyContent } from "@/lib/content/permissions";
import {
  syncContentWorkflowToCollaboration,
} from "@/lib/collaboration/service";
import {
  detectContentChanges,
  notifyApprovalRejected,
  notifyContentDetailChanged,
} from "@/lib/notifications/events";
import { writeContentUpdateAudit } from "@/lib/content/audit";
import { isAdminRole } from "@/lib/auth/roles";
import {
  resolveNextContentIdForChannel,
} from "@/lib/content/content-id";
import {
  isValidPostingChannel,
} from "@/lib/content/posting-channels";
import { createContentRecord, validateContentFormData } from "@/lib/content/create-content-record";
import { approveContentRecord } from "@/lib/content/approve-content-record";
import type { ContentFormData, ContentItem } from "@/lib/types";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function previewNextContentId(
  channel: string
): Promise<ActionResult<string>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  if (!channel.trim()) {
    return { success: false, error: "กรุณาเลือกช่องที่ลง" };
  }

  if (!(await isValidPostingChannel(channel))) {
    return { success: false, error: "ช่องที่ลงไม่ถูกต้อง" };
  }

  try {
    const nextContentId = await resolveNextContentIdForChannel(channel, prisma);
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

export async function approveContent(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Forbidden" };
  }

  try {
    await approveContentRecord(id, session.user.name || "Admin");

    updateTag(CONTENTS_CACHE_TAG);
    updateTag(contentCacheTag(id));
    revalidatePath("/admin");
    revalidatePath("/calendar");
    revalidatePath("/posts");
    revalidatePath(`/content/${id}`);

    return { success: true, data: undefined };
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

  const validationError = await validateContentFormData(data);
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
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Forbidden" };
  }

  try {
    const existing = await prisma.content.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Not found" };
    }

    await prisma.content.update({
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

    return { success: true, data: undefined };
  } catch (error) {
    logActionError("rejectContent", error, { id });
    return {
      success: false,
      error: formatActionError(error),
    };
  }
}
