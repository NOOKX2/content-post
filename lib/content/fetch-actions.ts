"use server";

import { auth } from "@/auth";
import { getCachedContents, getCachedContentById } from "@/lib/content/queries";
import type { ContentItem } from "@/lib/types";

export async function fetchContentsForClient(): Promise<ContentItem[]> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return getCachedContents();
}

export async function fetchContentByIdForClient(
  id: string
): Promise<ContentItem | null> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return getCachedContentById(id);
}
