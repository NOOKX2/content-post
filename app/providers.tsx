"use client";

import { SessionProvider } from "next-auth/react";
import { ContentsProvider } from "@/lib/content/contents-provider";
import type { ContentItem } from "@/lib/types";

export function Providers({
  children,
  initialContents,
}: {
  children: React.ReactNode;
  initialContents?: ContentItem[];
}) {
  return (
    <SessionProvider>
      <ContentsProvider initialContents={initialContents}>
        {children}
      </ContentsProvider>
    </SessionProvider>
  );
}
