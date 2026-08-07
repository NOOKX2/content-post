import type { ContentItem } from "@/lib/types";

export function contentPdfFilename(content: ContentItem): string {
  const slug = content.name
    .trim()
    .replace(/[^\w\u0E00-\u0E7F\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 40);
  return `content-${content.contentId}${slug ? `-${slug}` : ""}.pdf`;
}
