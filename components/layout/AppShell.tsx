"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { DashboardNavProvider } from "@/lib/navigation/client/dashboard-nav";
import { AppSessionProvider } from "@/lib/auth/client/app-session";
import { prefetchCollaboration } from "@/lib/collaboration/client/prefetch-collaboration";
import { cn } from "@/lib/shared/utils";

const AUTH_PATHS = ["/login", "/register"];

function AppShellMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isFullHeightView =
    pathname === "/dashboard" ||
    pathname === "/collaboration" ||
    pathname === "/my-tasks";

  useEffect(() => {
    if (session?.user) {
      void prefetchCollaboration();
    }
  }, [session?.user]);

  return (
    <div className="flex h-dvh bg-stone-50 md:flex-row">
      <Sidebar session={session ?? null} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <main
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            isFullHeightView ? "overflow-hidden" : "overflow-y-auto"
          )}
        >
          {children}
        </main>
        <MobileBottomNav session={session ?? null} />
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.includes(pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <AppSessionProvider>
      <DashboardNavProvider>
        <AppShellMain>{children}</AppShellMain>
      </DashboardNavProvider>
    </AppSessionProvider>
  );
}
