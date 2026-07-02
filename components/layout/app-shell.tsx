"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import type { Session } from "next-auth";

const AUTH_PATHS = ["/login", "/register"];

export function AppShell({
  children,
  session,
  pendingCount,
}: {
  children: React.ReactNode;
  session: Session | null;
  pendingCount: number;
}) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.includes(pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-stone-50">
      <Sidebar session={session} pendingCount={pendingCount} />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
