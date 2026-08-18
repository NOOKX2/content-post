import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { auth } from "@/auth";
import { Providers } from "./providers";
import { AppShell } from "@/components/layout/AppShell";
import { getLocale } from "@/lib/i18n/server";
import { getArchivePayload } from "@/lib/archive/data/queries";
import type { ArchivePayload } from "@/lib/archive/types";
import { getMyProfile } from "@/lib/profile/data";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iDea Content — Content Management",
  description: "ระบบจัดการ Content สร้าง อนุมัติ และโพสต์อัตโนมัติ",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const locale = await getLocale();
  let initialProfile = null;
  let initialArchive: ArchivePayload | null = null;
  let archiveError = "";

  if (session?.user?.id) {
    const [profileResult, archiveResult] = await Promise.allSettled([
      getMyProfile(session.user.id),
      getArchivePayload(),
    ]);

    if (profileResult.status === "fulfilled") {
      initialProfile = profileResult.value;
    } else {
      console.error("[layout] failed to load profile", profileResult.reason);
    }

    if (archiveResult.status === "fulfilled") {
      initialArchive = archiveResult.value;
    } else {
      console.error("[layout] failed to load archive", archiveResult.reason);
      const message =
        archiveResult.reason instanceof Error
          ? archiveResult.reason.message
          : String(archiveResult.reason);
      if (/does not exist|P2021|P2010|undefined/i.test(message)) {
        archiveError =
          "ฐานข้อมูลยังไม่มีตารางคลังข้อมูล กรุณารัน bunx prisma migrate deploy";
      } else {
        archiveError = `โหลดคลังข้อมูลไม่สำเร็จ — ${message}`;
      }
    }

  }

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <Providers
          session={session}
          locale={locale}
          initialProfile={initialProfile}
          initialArchive={initialArchive}
          archiveError={archiveError}
        >
          <AppShell session={session}>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
