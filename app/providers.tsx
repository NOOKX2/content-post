"use client";

import { SessionProvider } from "next-auth/react";
import { ContentsProvider } from "@/lib/content/contents-provider";
import type { ContentItem } from "@/lib/types";
import type { Session } from "next-auth";

export function Providers({
  children,
  initialContents,
  session,
}: {
  children: React.ReactNode;
  initialContents?: ContentItem[];
  session?: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <ContentsProvider initialContents={initialContents}>
        {children}
      </ContentsProvider>
    </SessionProvider>
  );
}
