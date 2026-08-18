"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { prefetchCollaboration } from "@/lib/collaboration/client/prefetch-collaboration";

export function useDashboardLinkPrefetch(href: string) {
  const router = useRouter();

  return useCallback(() => {
    router.prefetch(href);

    if (href === "/collaboration") {
      void prefetchCollaboration();
    }
  }, [href, router]);
}
