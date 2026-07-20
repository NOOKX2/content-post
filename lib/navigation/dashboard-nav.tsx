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
  | { view: "collaboration" }
  | { view: "calendar" }
  | { view: "admin" }
  | { view: "admin-channels" }
  | { view: "create" }
  | { view: "posts" }
  | { view: "my-tasks" }
  | { view: "content-detail"; id: string }
  | null;

export function parseDashboardRoute(path: string): DashboardRoute {
  if (path === "/dashboard") {
    return { view: "dashboard" };
  }
  if (path === "/collaboration") {
    return { view: "collaboration" };
  }
  if (path === "/calendar" || path === "/content-calendar") {
    return { view: "calendar" };
  }
  if (path === "/admin/channels") {
    return { view: "admin-channels" };
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
  if (path === "/my-tasks") {
    return { view: "my-tasks" };
  }

  const match = path.match(/^\/content\/([^/]+)$/);
  if (match) {
    return { view: "content-detail", id: match[1] };
  }

  return null;
}
