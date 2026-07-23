import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { Providers } from "./providers";
import { AppShell } from "@/components/layout/app-shell";
import { getCollaborationBootstrap } from "@/lib/collaboration/queries";
import { getAllContents } from "@/lib/content/queries";
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
  const pathname = (await headers()).get("x-pathname") ?? "";
  const shouldPrefetchCollaboration =
    Boolean(session?.user?.id) && pathname.startsWith("/collaboration");

  const [initialContents, initialCollaboration] = await Promise.all([
    session?.user ? getAllContents() : Promise.resolve(undefined),
    shouldPrefetchCollaboration && session?.user?.id
      ? getCollaborationBootstrap(session.user.id)
      : Promise.resolve(undefined),
  ]);

  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <Providers
          initialContents={initialContents}
          initialCollaboration={initialCollaboration}
          session={session}
        >
          <AppShell session={session}>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
