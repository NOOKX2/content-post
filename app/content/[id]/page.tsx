import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getContentById } from "@/lib/content/queries";
import { ContentDetailView } from "@/components/content/content-detail-view";

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [content, session] = await Promise.all([getContentById(id), auth()]);

  if (!content) {
    notFound();
  }

  return <ContentDetailView content={content} session={session} />;
}
