"use client";

import { SessionProvider } from "next-auth/react";
import { ArchiveProvider } from "@/lib/archive/client/archive-provider";
import { CollaborationProvider } from "@/lib/collaboration/client/collaboration-provider";
import { ContentsProvider } from "@/lib/content/client/contents-provider";
import { ProfileProvider } from "@/lib/profile/client/profile-provider";
import { LocaleProvider } from "@/lib/i18n";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LocaleProvider>
        <ProfileProvider>
          <ArchiveProvider>
            <ContentsProvider>
              <CollaborationProvider>{children}</CollaborationProvider>
            </ContentsProvider>
          </ArchiveProvider>
        </ProfileProvider>
      </LocaleProvider>
    </SessionProvider>
  );
}
