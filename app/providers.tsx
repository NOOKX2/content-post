"use client";

import { SessionProvider } from "next-auth/react";
import { ContentProvider } from "@/lib/content-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ContentProvider>{children}</ContentProvider>
    </SessionProvider>
  );
}
