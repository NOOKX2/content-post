"use client";

import { createContext, useContext } from "react";
import type { Session } from "next-auth";

const AppSessionContext = createContext<Session | null>(null);

export function AppSessionProvider({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  return (
    <AppSessionContext.Provider value={session}>
      {children}
    </AppSessionContext.Provider>
  );
}

export function useAppSession() {
  return useContext(AppSessionContext);
}
