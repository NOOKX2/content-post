import {
  isRejectedAtClipStage,
  isRejectedAtContentStage,
} from "@/lib/content/content-workflow";
import type { ContentItem, ContentStatus, MediaType } from "@/lib/types";

export type PostsViewGroup = "all" | "in_progress" | "completed" | "failed";

export type PostsSubFilter =
  | "all"
  | "pending"
  | "idea_approved"
  | "clip_pending"
  | "approved"
  | "scheduled"
  | "posted"
  | "content_rejected"
  | "clip_rejected"
  | "post_failed";

export const POSTS_IN_PROGRESS_STATUSES: ContentStatus[] = [
  "draft",
  "pending",
  "idea_approved",
  "clip_pending",
  "posting",
];

export const POSTS_COMPLETED_STATUSES: ContentStatus[] = [
  "approved",
  "scheduled",
  "posted",
];

export const POSTS_GROUP_TABS: {
  id: PostsViewGroup;
  label: string;
  hasSubFilter: boolean;
}[] = [
  { id: "all", label: "ทั้งหมด", hasSubFilter: false },
  { id: "in_progress", label: "กำลังดำเนินการ", hasSubFilter: true },
  { id: "completed", label: "เสร็จสิ้น", hasSubFilter: true },
  { id: "failed", label: "ยกเลิก/ไม่ผ่าน", hasSubFilter: true },
];

export const POSTS_SUB_FILTERS: Record<
  Exclude<PostsViewGroup, "all">,
  { id: PostsSubFilter; label: string }[]
> = {
  in_progress: [
    { id: "all", label: "ทั้งหมด" },
    { id: "pending", label: "รออนุมัติแนวคิด" },
    { id: "idea_approved", label: "รออัปโหลด" },
    { id: "clip_pending", label: "รออนุมัติคลิป" },
  ],
  completed: [
    { id: "all", label: "ทั้งหมด" },
    { id: "approved", label: "อนุมัติแล้ว" },
    { id: "scheduled", label: "กำหนดการแล้ว" },
    { id: "posted", label: "โพสต์แล้ว" },
  ],
  failed: [
    { id: "all", label: "ทั้งหมด" },
    { id: "content_rejected", label: "ไม่อนุมัติ Content" },
    { id: "clip_rejected", label: "ไม่อนุมัติคลิป" },
    { id: "post_failed", label: "โพสต์ไม่สำเร็จ" },
  ],
};

function matchesPostsSubFilter(
  content: ContentItem,
  subFilter: PostsSubFilter
): boolean {
  if (subFilter === "all") return true;
  if (subFilter === "content_rejected") {
    return isRejectedAtContentStage(content);
  }
  if (subFilter === "clip_rejected") {
    return isRejectedAtClipStage(content);
  }
  return content.status === subFilter;
}

export function matchesPostsViewFilter(
  content: ContentItem,
  group: PostsViewGroup,
  subFilter: PostsSubFilter,
  mediaType: MediaType | "all"
): boolean {
  if (mediaType !== "all" && content.mediaType !== mediaType) {
    return false;
  }

  if (group === "all") {
    return true;
  }

  if (group === "in_progress") {
    if (!POSTS_IN_PROGRESS_STATUSES.includes(content.status)) {
      return false;
    }
    return matchesPostsSubFilter(content, subFilter);
  }

  if (group === "completed") {
    if (!POSTS_COMPLETED_STATUSES.includes(content.status)) {
      return false;
    }
    return matchesPostsSubFilter(content, subFilter);
  }

  if (content.status !== "rejected" && content.status !== "post_failed") {
    return false;
  }

  return matchesPostsSubFilter(content, subFilter);
}

export function getDefaultPostsSubFilter(
  group: Exclude<PostsViewGroup, "all">
): PostsSubFilter {
  return "all";
}
