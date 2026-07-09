"use server";

import { revalidatePath, updateTag } from "next/cache";
import {
  CONTENTS_CACHE_TAG,
  contentCacheTag,
} from "@/lib/content/cache-tags";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  formDataToCreateInput,
  formDataToUpdateInput,
  toContentItem,
} from "@/lib/content/mappers";
import {
  formatActionError,
  logActionError,
} from "@/lib/content/action-errors";
import { assertCanModifyContent } from "@/lib/content/permissions";
import type { ContentFormData, ContentItem } from "@/lib/types";
import { generateContentId } from "@/lib/utils";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createContent(
  data: ContentFormData,
  contentId?: string
): Promise<ActionResult<ContentItem>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  if (session.user.role === "ADMIN") {
    return { success: false, error: "Forbidden" };
  }

  if (!data.name?.trim()) {
    return { success: false, error: "กรุณากรอกชื่อ Content" };
  }

  try {
    let nextContentId = contentId?.trim() || generateContentId();
    let attempts = 0;

    while (attempts < 5) {
      const existing = await prisma.content.findUnique({
        where: { contentId: nextContentId },
      });
      if (!existing) break;
      nextContentId = generateContentId();
      attempts++;
    }

    const record = await prisma.content.create({
      data: formDataToCreateInput(data, nextContentId, session.user.id),
    });

    updateTag(CONTENTS_CACHE_TAG);
    revalidatePath("/calendar");
    revalidatePath("/admin");
    revalidatePath("/create");
    revalidatePath("/posts");

    return { success: true, data: toContentItem(record) };
  } catch (error) {
    logActionError("createContent", error, {
      contentId,
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
    const existing = await prisma.content.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Not found" };
    }

    await prisma.content.update({
      where: { id },
      data: {
        status: "approved",
        approver: session.user.name || "Admin",
      },
    });

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

  if (!data.name?.trim()) {
    return { success: false, error: "กรุณากรอกชื่อ Content" };
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

    const record = await prisma.content.update({
      where: { id },
      data: formDataToUpdateInput(data),
    });

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

export async function rejectContent(id: string): Promise<ActionResult> {
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
