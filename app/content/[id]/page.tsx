import { ContentDetailViewPage } from "@/app/content/[id]/_components/ContentDetailViewPage";

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="min-h-full bg-white">
      <ContentDetailViewPage key={id} id={id} />
    </div>
  );
}
