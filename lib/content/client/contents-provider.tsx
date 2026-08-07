"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { useSession } from "next-auth/react";
import useSWR, { mutate as globalMutate } from "swr";
import {
  fetchContentByIdForClient,
  fetchContentsForClient,
} from "@/lib/content/actions/fetch";
import {
  getContentRefreshInterval,
  getContentsRefreshInterval,
} from "@/lib/content/client/live-status-polling";
import { isAwaitingAdminApproval } from "@/lib/content/domain/workflow";
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
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const { data, mutate } = useSWR(
    isAuthenticated ? CONTENTS_KEY : null,
    fetchContentsForClient,
    {
      fallbackData: initialContents,
      revalidateOnMount: isAuthenticated && initialContents === undefined,
      revalidateOnFocus: isAuthenticated,
      dedupingInterval: 2000,
      keepPreviousData: true,
      refreshInterval: (latestData) => getContentsRefreshInterval(latestData),
      refreshWhenHidden: false,
    }
  );

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
    () =>
      contents.filter((content) => isAwaitingAdminApproval(content.status))
        .length,
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
      revalidateOnFocus: true,
      keepPreviousData: true,
      refreshInterval: (latestData) =>
        getContentRefreshInterval(latestData ?? cached),
      refreshWhenHidden: false,
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
