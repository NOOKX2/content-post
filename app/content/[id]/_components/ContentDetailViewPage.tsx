"use client";

import { useSession } from "next-auth/react";
import { ContentDetailView } from "@/app/content/[id]/_components/ContentDetailView";
import { ContentNotFoundView } from "@/app/content/[id]/_components/ContentNotFound";
import { useContentById } from "@/lib/content/client/contents-provider";

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
