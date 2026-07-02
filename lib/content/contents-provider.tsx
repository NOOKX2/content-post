"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import useSWR, { mutate as globalMutate } from "swr";
import {
  fetchContentByIdForClient,
  fetchContentsForClient,
} from "@/lib/content/fetch-actions";
import type { ContentItem } from "@/lib/types";

export const CONTENTS_KEY = "contents";

type ContentsContextValue = {
  contents: ContentItem[];
  mutateContents: ReturnType<typeof useSWR<ContentItem[]>>["mutate"];
};

const ContentsContext = createContext<ContentsContextValue | null>(null);

export function ContentsProvider({
  children,
  initialContents,
}: {
  children: React.ReactNode;
  initialContents?: ContentItem[];
}) {
  const { data, mutate } = useSWR(CONTENTS_KEY, fetchContentsForClient, {
    fallbackData: initialContents,
    revalidateOnMount: initialContents === undefined,
    revalidateOnFocus: true,
    dedupingInterval: 5000,
    keepPreviousData: true,
  });

  const value = useMemo(
    () => ({
      contents: data ?? [],
      mutateContents: mutate,
    }),
    [data, mutate]
  );

  return (
    <ContentsContext.Provider value={value}>{children}</ContentsContext.Provider>
  );
}

export function useContents() {
  const context = useContext(ContentsContext);
  if (!context) {
    throw new Error("useContents must be used within ContentsProvider");
  }
  return context;
}

export function usePendingCount() {
  const { contents } = useContents();
  return useMemo(
    () => contents.filter((content) => content.status === "pending").length,
    [contents]
  );
}

export function useContentById(id: string): ContentItem | null | undefined {
  const { contents } = useContents();
  const cached = useMemo(
    () => contents.find((content) => content.id === id) ?? null,
    [contents, id]
  );

  const { data } = useSWR(
    cached ? null : ["content", id],
    () => fetchContentByIdForClient(id),
    {
      fallbackData: cached ?? undefined,
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  if (cached) {
    return cached;
  }

  return data;
}

export function useRefreshContents() {
  return useCallback(() => globalMutate(CONTENTS_KEY), []);
}
