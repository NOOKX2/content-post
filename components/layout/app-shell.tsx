"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { DashboardRouter } from "./dashboard-router";
import { DashboardNavProvider } from "@/lib/navigation/dashboard-nav";
import { AppSessionProvider } from "@/lib/auth/app-session";
import { cn } from "@/lib/utils";
import type { Session } from "next-auth";

const AUTH_PATHS = ["/login", "/register"];

export function AppShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.includes(pathname);
  const isDashboard = pathname === "/dashboard";
  const isCollaboration = pathname === "/collaboration";
  const isFullHeightView = isDashboard || isCollaboration;

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <AppSessionProvider session={session}>
      <DashboardNavProvider>
        <div className="flex h-screen bg-stone-50">
          <Sidebar session={session} />
          <main
            className={cn(
              "flex min-h-0 flex-1 flex-col",
              isFullHeightView ? "overflow-hidden" : "overflow-y-auto"
            )}
          >
            <DashboardRouter />
          </main>
        </div>
        <div className="hidden" aria-hidden>
          {children}
        </div>
      </DashboardNavProvider>
    </AppSessionProvider>
  );
}
