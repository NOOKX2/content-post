"use client";

import { SessionProvider } from "next-auth/react";
import { ArchiveProvider } from "@/lib/archive/client/archive-provider";
import type { ArchivePayload } from "@/lib/archive/types";
import { CollaborationProvider } from "@/lib/collaboration/client/collaboration-provider";
import { ContentsProvider } from "@/lib/content/client/contents-provider";
import { ProfileProvider } from "@/lib/profile/client/profile-provider";
import type { UserProfile } from "@/lib/profile/types";
import type { ContentItem } from "@/lib/types";
import type { Session } from "next-auth";
import { LocaleProvider, type Locale } from "@/lib/i18n";

export function Providers({
  children,
  initialContents,
  initialProfile,
  initialArchive,
  archiveError,
  session,
  locale,
}: {
  children: React.ReactNode;
  initialContents?: ContentItem[];
  initialProfile?: UserProfile | null;
  initialArchive?: ArchivePayload | null;
  archiveError?: string;
  session?: Session | null;
  locale?: Locale;
}) {
  return (
    <SessionProvider session={session}>
      <LocaleProvider initialLocale={locale}>
        <ProfileProvider initialProfile={initialProfile}>
          <ArchiveProvider
            initialArchive={initialArchive}
            initialError={archiveError}
          >
            <ContentsProvider initialContents={initialContents}>
              <CollaborationProvider>
                {children}
              </CollaborationProvider>
            </ContentsProvider>
          </ArchiveProvider>
        </ProfileProvider>
      </LocaleProvider>
    </SessionProvider>
  );
}
