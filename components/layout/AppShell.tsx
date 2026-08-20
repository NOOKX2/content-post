"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { DashboardNavProvider } from "@/lib/navigation/client/dashboard-nav";
import { AppSessionProvider } from "@/lib/auth/client/app-session";
import { prefetchCollaboration } from "@/lib/collaboration/client/prefetch-collaboration";
import { cn } from "@/lib/shared/utils";
import type { Session } from "next-auth";

const AUTH_PATHS = ["/login", "/register"];

function AppShellMain({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isFullHeightView =
    pathname === "/dashboard" || pathname === "/collaboration";

  useEffect(() => {
    if (session?.user) {
      void prefetchCollaboration();
    }
  }, [session?.user]);

  return (
    <div className="flex h-dvh bg-stone-50 md:flex-row">
      <Sidebar session={session} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <main
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            isFullHeightView ? "overflow-hidden" : "overflow-y-auto"
          )}
        >
          {children}
        </main>
        <MobileBottomNav session={session} />
      </div>
    </div>
  );
}

export function AppShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.includes(pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <AppSessionProvider session={session}>
      <DashboardNavProvider>
        <AppShellMain session={session}>{children}</AppShellMain>
      </DashboardNavProvider>
    </AppSessionProvider>
  );
}
