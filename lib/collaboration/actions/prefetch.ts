"use server";

import { auth } from "@/auth";
import { getCollaborationBootstrap } from "@/lib/collaboration/data/queries";
import type { CollaborationBootstrap } from "@/lib/collaboration/data/queries";

export async function prefetchCollaborationBootstrap(): Promise<CollaborationBootstrap | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return getCollaborationBootstrap(session.user.id);
}
