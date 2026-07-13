import { revalidateTag } from "next/cache";

export const CONTENTS_CACHE_TAG = "contents";

export function contentCacheTag(id: string) {
  return `content-${id}`;
}

/** Route Handlers must use revalidateTag — updateTag is Server Actions only. */
export function invalidateContentsCache(id?: string) {
  revalidateTag(CONTENTS_CACHE_TAG, "max");
  if (id) {
    revalidateTag(contentCacheTag(id), "max");
  }
}
