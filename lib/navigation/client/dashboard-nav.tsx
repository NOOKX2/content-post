"use client";

import { createContext, useCallback, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import { prefetchCollaboration } from "@/lib/collaboration/client/prefetch-collaboration";

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

  const navigate = useCallback(
    (href: string) => {
      const targetPath = href.split("?")[0];
      if (targetPath === "/collaboration") {
        void prefetchCollaboration();
      }
      router.push(href);
    },
    [router]
  );

  return (
    <DashboardNavContext.Provider value={{ activePath: pathname, navigate }}>
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
