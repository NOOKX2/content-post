"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formDataToCreateInput, toContentItem } from "@/lib/content/mappers";
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

    revalidatePath("/calendar");
    revalidatePath("/admin");
    revalidatePath("/create");

    return { success: true, data: toContentItem(record) };
  } catch {
    return { success: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
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

    revalidatePath("/admin");
    revalidatePath("/calendar");
    revalidatePath(`/content/${id}`);

    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
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

    revalidatePath("/admin");
    revalidatePath("/calendar");
    revalidatePath(`/content/${id}`);

    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
  }
}
