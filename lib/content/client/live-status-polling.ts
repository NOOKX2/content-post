import type { ContentItem, ContentStatus } from "@/lib/types";

/** Statuses that may change without user action (n8n / Buffer pipeline). */
export const LIVE_POST_STATUSES: ContentStatus[] = [
  "approved",
  "scheduled",
  "posting",
];

export function hasLivePostStatus(
  contents: Pick<ContentItem, "status">[]
): boolean {
  return contents.some((content) =>
    LIVE_POST_STATUSES.includes(content.status)
  );
}

export function getContentsRefreshInterval(
  contents: ContentItem[] | undefined
): number {
  if (!contents?.length) return 0;

  if (contents.some((c) => c.status === "posting")) return 3000;
  if (contents.some((c) => c.status === "scheduled")) return 10000;
  if (contents.some((c) => c.status === "approved")) return 30000;

  return 0;
}

export function getContentRefreshInterval(
  content: Pick<ContentItem, "status"> | null | undefined
): number {
  if (!content) return 0;
  if (content.status === "posting") return 3000;
  if (content.status === "scheduled") return 10000;
  if (content.status === "approved") return 30000;
  return 0;
}
