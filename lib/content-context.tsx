"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { ContentItem, ContentFormData } from "./types";
import { MOCK_CONTENT } from "./mock-data";
import { generateContentId, generateId } from "./utils";

interface ContentContextValue {
  contents: ContentItem[];
  addContent: (data: ContentFormData) => ContentItem;
  updateContent: (id: string, data: Partial<ContentItem>) => void;
  approveContent: (id: string, approver: string) => void;
  rejectContent: (id: string) => void;
  getContentByDate: (date: string) => ContentItem[];
  pendingCount: number;
}

const ContentContext = createContext<ContentContextValue | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [contents, setContents] = useState<ContentItem[]>(MOCK_CONTENT);

  const addContent = useCallback((data: ContentFormData): ContentItem => {
    const newItem: ContentItem = {
      id: generateId(),
      contentId: generateContentId(),
      ...data,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setContents((prev) => [...prev, newItem]);
    return newItem;
  }, []);

  const updateContent = useCallback(
    (id: string, data: Partial<ContentItem>) => {
      setContents((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...data } : item))
      );
    },
    []
  );

  const approveContent = useCallback((id: string, approver: string) => {
    setContents((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: "approved", approver }
          : item
      )
    );
  }, []);

  const rejectContent = useCallback((id: string) => {
    setContents((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "rejected" } : item
      )
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
        addContent,
        updateContent,
        approveContent,
        rejectContent,
        getContentByDate,
        pendingCount,
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
