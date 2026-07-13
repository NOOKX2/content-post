import { updateTag } from "next/cache";

export const CONTENTS_CACHE_TAG = "contents";

export function contentCacheTag(id: string) {
  return `content-${id}`;
}

export function invalidateContentsCache(id?: string) {
  updateTag(CONTENTS_CACHE_TAG);
  if (id) {
    updateTag(contentCacheTag(id));
  }
}
