"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useSession } from "next-auth/react";
import { ContentDetailView } from "@/components/content/content-detail-view";
import { useContentById } from "@/lib/content/contents-provider";

export default function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const content = useContentById(id);
  const { data: session } = useSession();

  if (content === null) {
    notFound();
  }

  if (!content) {
    return null;
  }

  return <ContentDetailView content={content} session={session} />;
}
