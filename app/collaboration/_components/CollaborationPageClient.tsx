"use client";

import { useEffect, useState } from "react";
import { CollaborationView } from "@/app/collaboration/_components/CollaborationView";
import { CollaborationProvider } from "@/lib/collaboration/client/collaboration-provider";
import {
  getPrefetchedCollaborationBootstrap,
  hydrateCollaborationCache,
  prefetchCollaboration,
} from "@/lib/collaboration/client/prefetch-collaboration";
import type { CollaborationBootstrap } from "@/lib/collaboration/data/queries";

export function CollaborationPageClient() {
  const [bootstrap, setBootstrap] = useState<CollaborationBootstrap | null>(
    () => getPrefetchedCollaborationBootstrap()
  );

  useEffect(() => {
    if (bootstrap) {
      void hydrateCollaborationCache(bootstrap);
      return;
    }

    void prefetchCollaboration().then((data) => {
      if (data) setBootstrap(data);
    });
  }, [bootstrap]);

  return (
    <CollaborationProvider bootstrap={bootstrap ?? undefined}>
      <CollaborationView />
    </CollaborationProvider>
  );
}
