"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { prefetchCollaboration } from "@/lib/collaboration/client/prefetch-collaboration";

type DashboardNavContextValue = {
  activePath: string;
  navigate: (href: string) => void;
};

const DashboardNavContext = createContext<DashboardNavContextValue | null>(null);

function readBrowserHref(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.pathname + window.location.search;
}

function shouldSyncRouter(href: string, previousHref: string): boolean {
  const targetPath = href.split("?")[0];
  const route = parseDashboardRoute(targetPath);

  if (!route) {
    return true;
  }

  if (route.view === "content-detail" || route.view === "archive-product-form") {
    return true;
  }

  if (href.includes("?")) {
    return true;
  }

  // /create uses search params for workflow state — keep Next.js in sync.
  if (targetPath === "/create") {
    return true;
  }

  if (previousHref.includes("?") && targetPath === previousHref.split("?")[0]) {
    return true;
  }

  return false;
}

export function DashboardNavProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [activePath, setActivePath] = useState(pathname);
  const activeHrefRef = useRef(readBrowserHref() || pathname);

  useEffect(() => {
    const browserHref = readBrowserHref();
    activeHrefRef.current = browserHref || pathname;
    setActivePath(pathname);
  }, [pathname]);

  useEffect(() => {
    const onPopState = () => {
      const previousHref = activeHrefRef.current;
      const href = readBrowserHref();
      activeHrefRef.current = href;
      setActivePath(window.location.pathname);

      if (shouldSyncRouter(href, previousHref)) {
        router.replace(href);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [router]);

  const navigate = useCallback(
    (href: string) => {
      const previousHref = activeHrefRef.current;
      if (href === previousHref) {
        return;
      }

      const targetPath = href.split("?")[0];
      activeHrefRef.current = href;
      setActivePath(targetPath);

      if (targetPath === "/collaboration") {
        void prefetchCollaboration();
      }

      if (typeof window === "undefined") {
        return;
      }

      window.history.pushState(null, "", href);

      if (shouldSyncRouter(href, previousHref)) {
        router.replace(href);
      }
    },
    [router]
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
  | { view: "admin-settings" }
  | { view: "create" }
  | { view: "posts" }
  | { view: "my-tasks" }
  | { view: "archive" }
  | { view: "archive-product-form"; productId: string | null }
  | { view: "settings" }
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
  if (path === "/admin/settings") {
    return { view: "admin-settings" };
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
  if (path === "/settings") {
    return { view: "settings" };
  }
  if (path === "/archive/products/new") {
    return { view: "archive-product-form", productId: null };
  }

  const productEdit = path.match(/^\/archive\/products\/([^/]+)\/edit$/);
  if (productEdit) {
    return { view: "archive-product-form", productId: productEdit[1] };
  }

  if (path === "/archive" || path.startsWith("/archive/")) {
    return { view: "archive" };
  }

  const match = path.match(/^\/content\/([^/]+)$/);
  if (match) {
    return { view: "content-detail", id: match[1] };
  }

  return null;
}
