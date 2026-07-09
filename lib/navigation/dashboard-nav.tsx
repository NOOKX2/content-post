"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

type DashboardNavContextValue = {
  activePath: string;
  navigate: (href: string) => void;
};

const DashboardNavContext = createContext<DashboardNavContextValue | null>(null);

export function DashboardNavProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [activePath, setActivePath] = useState(pathname);

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  const navigate = useCallback(
    (href: string) => {
      if (href === activePath) {
        return;
      }

      setActivePath(href);
      startTransition(() => {
        router.push(href);
      });
    },
    [activePath, router]
  );

  return (
    <DashboardNavContext.Provider value={{ activePath, navigate }}>
      {children}
    </DashboardNavContext.Provider>
  );
}

export function useDashboardNav() {
  const context = useContext(DashboardNavContext);
  if (!context) {
    throw new Error("useDashboardNav must be used within DashboardNavProvider");
  }
  return context;
}

export type DashboardRoute =
  | { view: "dashboard" }
  | { view: "calendar" }
  | { view: "admin" }
  | { view: "create" }
  | { view: "posts" }
  | { view: "content-detail"; id: string }
  | null;

export function parseDashboardRoute(path: string): DashboardRoute {
  if (path === "/dashboard") {
    return { view: "dashboard" };
  }
  if (path === "/calendar" || path === "/content-calendar") {
    return { view: "calendar" };
  }
  if (path === "/admin") {
    return { view: "admin" };
  }
  if (path === "/create") {
    return { view: "create" };
  }
  if (path === "/posts") {
    return { view: "posts" };
  }

  const match = path.match(/^\/content\/([^/]+)$/);
  if (match) {
    return { view: "content-detail", id: match[1] };
  }

  return null;
}
