"use client";

import { createContext, useContext } from "react";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";

const AppSessionContext = createContext<Session | null>(null);

export function AppSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <AppSessionContext.Provider value={session ?? null}>
      {children}
    </AppSessionContext.Provider>
  );
}

export function useAppSession() {
  return useContext(AppSessionContext);
}
