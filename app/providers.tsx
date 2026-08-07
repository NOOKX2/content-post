"use client";

import { SessionProvider } from "next-auth/react";
import { CollaborationProvider } from "@/lib/collaboration/client/collaboration-provider";
import type { CollaborationBootstrap } from "@/lib/collaboration/data/queries";
import { ContentsProvider } from "@/lib/content/client/contents-provider";
import type { ContentItem } from "@/lib/types";
import type { Session } from "next-auth";

export function Providers({
  children,
  initialContents,
  initialCollaboration,
  session,
}: {
  children: React.ReactNode;
  initialContents?: ContentItem[];
  initialCollaboration?: CollaborationBootstrap;
  session?: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <ContentsProvider initialContents={initialContents}>
        <CollaborationProvider bootstrap={initialCollaboration}>
          {children}
        </CollaborationProvider>
      </ContentsProvider>
    </SessionProvider>
  );
}
