"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/layout/Header";
import { PostListCard } from "@/app/posts/_components/PostListCard";
import { PostsFilterBar } from "@/app/posts/_components/PostsFilterBar";
import { Card } from "@/components/ui/Card";
import { useContents } from "@/lib/content/client/contents-provider";
import {
  getDefaultPostsSubFilter,
  matchesPostsViewFilter,
  type PostsSubFilter,
  type PostsViewGroup,
} from "@/lib/content/client/posts-filters";
import type { ContentItem, MediaType } from "@/lib/types";

function sortByNewest(contents: ContentItem[]): ContentItem[] {
  return [...contents].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

export function PostsView() {
  const { data: session } = useSession();
  const { contents } = useContents();
  const [group, setGroup] = useState<PostsViewGroup>("all");
  const [subFilter, setSubFilter] = useState<PostsSubFilter>("all");
  const [mediaType, setMediaType] = useState<MediaType | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return sortByNewest(
      contents.filter((content) => {
        if (
          !matchesPostsViewFilter(content, group, subFilter, mediaType)
        ) {
          return false;
        }

        if (!keyword) return true;

        return (
          content.name.toLowerCase().includes(keyword) ||
          content.contentId.toLowerCase().includes(keyword) ||
          content.channel.toLowerCase().includes(keyword) ||
          content.ideaCreator.toLowerCase().includes(keyword)
        );
      })
    );
  }, [contents, group, subFilter, mediaType, query]);

  const handleGroupChange = (nextGroup: PostsViewGroup) => {
    setGroup(nextGroup);
    if (nextGroup === "all") {
      setSubFilter("all");
      return;
    }
    setSubFilter(getDefaultPostsSubFilter(nextGroup));
  };

  return (
    <>
      <Header
        session={session}
        title="รายการ post ทั้งหมด"
        description="ดูและตรวจสอบ Content ทุกสถานะได้จากที่เดียว"
        compact
      />
      <div className="space-y-5 px-4 py-4 sm:px-6 md:px-8 md:py-6">
        <PostsFilterBar
          group={group}
          subFilter={subFilter}
          mediaType={mediaType}
          query={query}
          onGroupChange={handleGroupChange}
          onSubFilterChange={setSubFilter}
          onMediaTypeChange={setMediaType}
          onQueryChange={setQuery}
        />

        <p className="text-sm text-stone-500">พบ {filtered.length} รายการ</p>

        {filtered.length === 0 ? (
          <Card className="py-12 text-center text-sm text-stone-400">
            ไม่พบ post ตามเงื่อนไขที่เลือก
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((content) => (
              <PostListCard key={content.id} content={content} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
