import { cache } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toContentItem } from "@/lib/content/mappers";
import type { ContentItem } from "@/lib/types";

async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export const getAllContents = cache(async (): Promise<ContentItem[]> => {
  await requireUser();

  const records = await prisma.content.findMany({
    orderBy: { createdAt: "desc" },
  });

  return records.map(toContentItem);
});

export const getContentById = cache(
  async (id: string): Promise<ContentItem | null> => {
    await requireUser();

    const record = await prisma.content.findUnique({ where: { id } });
    return record ? toContentItem(record) : null;
  }
);

export const getPendingCount = cache(async (): Promise<number> => {
  await requireUser();

  return prisma.content.count({ where: { status: "pending" } });
});
