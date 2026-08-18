"use client";

import { useEffect } from "react";
import { CollaborationView } from "@/app/collaboration/_components/CollaborationView";
import { CollaborationProvider } from "@/lib/collaboration/client/collaboration-provider";
import { hydrateCollaborationCache } from "@/lib/collaboration/client/prefetch-collaboration";
import type { CollaborationBootstrap } from "@/lib/collaboration/data/queries";

export function CollaborationPageClient({
  bootstrap,
}: {
  bootstrap: CollaborationBootstrap;
}) {
  useEffect(() => {
    void hydrateCollaborationCache(bootstrap);
  }, [bootstrap]);

  return (
    <CollaborationProvider bootstrap={bootstrap}>
      <CollaborationView />
    </CollaborationProvider>
  );
}
