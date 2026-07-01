"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { ContentItem, ContentFormData } from "./types";

interface ContentContextValue {
  contents: ContentItem[];
  loading: boolean;
  addContent: (data: ContentFormData, contentId?: string) => Promise<ContentItem>;
  updateContent: (id: string, data: Partial<ContentItem>) => Promise<void>;
  approveContent: (id: string, approver: string) => Promise<void>;
  rejectContent: (id: string) => Promise<void>;
  getContentByDate: (date: string) => ContentItem[];
  pendingCount: number;
  refresh: () => Promise<void>;
}

const ContentContext = createContext<ContentContextValue | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/content");
    if (!res.ok) return;
    const data = (await res.json()) as ContentItem[];
    setContents(data);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const addContent = useCallback(
    async (data: ContentFormData, contentId?: string): Promise<ContentItem> => {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, contentId }),
      });

      if (!res.ok) {
        throw new Error("Failed to create content");
      }

      const item = (await res.json()) as ContentItem;
      setContents((prev) => [item, ...prev]);
      return item;
    },
    []
  );

  const updateContent = useCallback(
    async (id: string, data: Partial<ContentItem>) => {
      const res = await fetch(`/api/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) return;

      const updated = (await res.json()) as ContentItem;
      setContents((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    },
    []
  );

  const approveContent = useCallback(
    async (id: string, approver: string) => {
      const res = await fetch(`/api/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved", approver }),
      });

      if (!res.ok) return;

      const updated = (await res.json()) as ContentItem;
      setContents((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    },
    []
  );

  const rejectContent = useCallback(async (id: string) => {
    const res = await fetch(`/api/content/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected" }),
    });

    if (!res.ok) return;

    const updated = (await res.json()) as ContentItem;
    setContents((prev) =>
      prev.map((item) => (item.id === id ? updated : item))
    );
  }, []);

  const getContentByDate = useCallback(
    (date: string) =>
      contents.filter(
        (c) =>
          c.scheduledDate === date &&
          (c.status === "approved" ||
            c.status === "scheduled" ||
            c.status === "posted")
      ),
    [contents]
  );

  const pendingCount = contents.filter((c) => c.status === "pending").length;

  return (
    <ContentContext.Provider
      value={{
        contents,
        loading,
        addContent,
        updateContent,
        approveContent,
        rejectContent,
        getContentByDate,
        pendingCount,
        refresh,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within ContentProvider");
  return ctx;
}
