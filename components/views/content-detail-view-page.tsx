"use client";

import { useSession } from "next-auth/react";
import { ContentDetailView } from "@/components/content/content-detail-view";
import { ContentNotFoundView } from "@/components/views/content-not-found";
import { useContentById } from "@/lib/content/contents-provider";

export function ContentDetailViewPage({ id }: { id: string }) {
  const content = useContentById(id);
  const { data: session } = useSession();

  if (content === null) {
    return <ContentNotFoundView />;
  }

  if (!content) {
    return null;
  }

  return <ContentDetailView content={content} session={session ?? null} />;
}
