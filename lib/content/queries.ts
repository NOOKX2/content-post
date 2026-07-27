import { cache } from "react";
import { unstable_cache } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toContentItem } from "@/lib/content/mappers";
import { isAwaitingAdminApproval } from "@/lib/content/content-workflow";
import type { ContentItem } from "@/lib/types";
import { CONTENTS_CACHE_TAG, contentCacheTag } from "@/lib/content/cache-tags";

async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

async function fetchAllContentsFromDb(): Promise<ContentItem[]> {
  const records = await prisma.content.findMany({
    orderBy: { createdAt: "desc" },
  });

  return records.map(toContentItem);
}

export const getCachedContents = unstable_cache(
  fetchAllContentsFromDb,
  ["all-contents"],
  { tags: [CONTENTS_CACHE_TAG] }
);

export const getAllContents = cache(async (): Promise<ContentItem[]> => {
  await requireUser();
  return getCachedContents();
});

async function fetchContentByIdFromDb(id: string): Promise<ContentItem | null> {
  const record = await prisma.content.findUnique({ where: { id } });
  return record ? toContentItem(record) : null;
}

export async function getCachedContentById(
  id: string
): Promise<ContentItem | null> {
  return unstable_cache(
    () => fetchContentByIdFromDb(id),
    ["content-by-id", id],
    { tags: [CONTENTS_CACHE_TAG, contentCacheTag(id)] }
  )();
}

export const getContentById = cache(
  async (id: string): Promise<ContentItem | null> => {
    await requireUser();
    return getCachedContentById(id);
  }
);

export const getPendingCount = cache(async (): Promise<number> => {
  const contents = await getAllContents();
  return contents.filter((c) => isAwaitingAdminApproval(c.status)).length;
});
