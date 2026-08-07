"use server";

import { auth } from "@/auth";
import { getCachedContents, getCachedContentById } from "@/lib/content/data/queries";
import type { ContentItem } from "@/lib/types";

export async function fetchContentsForClient(): Promise<ContentItem[]> {
  const session = await auth();
  if (!session?.user) {
    return [];
  }

  return getCachedContents();
}

export async function fetchContentByIdForClient(
  id: string
): Promise<ContentItem | null> {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  return getCachedContentById(id);
}
