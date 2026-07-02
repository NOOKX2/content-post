"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { DashboardRouter } from "./dashboard-router";
import { DashboardNavProvider } from "@/lib/navigation/dashboard-nav";
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

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <DashboardNavProvider>
      <div className="flex h-screen bg-stone-50">
        <Sidebar session={session} />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <DashboardRouter />
        </main>
      </div>
      <div className="hidden" aria-hidden>
        {children}
      </div>
    </DashboardNavProvider>
  );
}
