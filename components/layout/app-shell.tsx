"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { DashboardRouter } from "./dashboard-router";
import {
  DashboardNavProvider,
  useDashboardNav,
} from "@/lib/navigation/dashboard-nav";
import { AppSessionProvider } from "@/lib/auth/app-session";
import { cn } from "@/lib/utils";
import type { Session } from "next-auth";

const AUTH_PATHS = ["/login", "/register"];

function AppShellMain({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  const { activePath } = useDashboardNav();
  const isDashboard = activePath === "/dashboard";
  const isCollaboration = activePath === "/collaboration";
  const isFullHeightView = isDashboard || isCollaboration;

  return (
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
      <div className="hidden" aria-hidden>
        {children}
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
