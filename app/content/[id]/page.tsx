"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ContentDetail } from "@/components/content/content-detail";
import { UserMenu } from "@/components/layout/user-menu";
import { useContent } from "@/lib/content-context";
import type { ContentItem } from "@/lib/types";

function ContentDetailSubNav({
  contentId,
  name,
}: {
  contentId?: string;
  name?: string;
}) {
  return (
    <nav className="apple-sub-nav apple-detail gap-3">

      <div className="min-w-0 flex-1 text-center">
        <p className="apple-caption-strong truncate text-[#1d1d1f]">
          รายละเอียด Content
        </p>
        {(contentId || name) && (
          <p className="apple-fine-print mt-0.5 truncate">
            {contentId ? `#${contentId}` : ""}
            {contentId && name ? " — " : ""}
            {name ?? ""}
          </p>
        )}
      </div>

      <div className="shrink-0">
        <UserMenu />
      </div>
    </nav>
  );
}

export default function ContentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { contents, loading: contextLoading } = useContent();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fromContext = contents.find((item) => item.id === id);
    if (fromContext) {
      setContent(fromContext);
      setLoading(false);
      setNotFound(false);
      return;
    }

    if (contextLoading) return;

    fetch(`/api/content/${id}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json() as Promise<ContentItem>;
      })
      .then((item) => {
        if (item) setContent(item);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, contents, contextLoading]);

  if (loading) {
    return (
      <div className="apple-detail min-h-full bg-[#f5f5f7]">
        <ContentDetailSubNav />
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="apple-caption">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (notFound || !content) {
    return (
      <div className="apple-detail min-h-full bg-[#f5f5f7]">
        <ContentDetailSubNav />
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-6 text-center">
          <h1 className="apple-display-lg">ไม่พบ Content</h1>
          <p className="apple-body text-[#7a7a7a]">
            Content ที่ต้องการอาจถูกลบหรือไม่มีอยู่ในระบบ
          </p>
          <Link href="/calendar" className="apple-btn-primary">
            กลับไปปฏิทิน
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f5f5f7]">
      <ContentDetailSubNav
        contentId={content.contentId}
        name={content.name}
      />
      <ContentDetail content={content} />
    </div>
  );
}
