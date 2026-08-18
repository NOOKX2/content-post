"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { mutate } from "swr";
import type { CollaborationMessageItem } from "@/lib/collaboration/types";
import {
  fetchChannelMessagesPage,
  fetchNewChannelMessages,
} from "@/lib/collaboration/actions/fetch";
import {
  collabMessagesKey,
  useCollaborationBootstrap,
} from "@/lib/collaboration/client/collaboration-provider";
import {
  getCachedChannelMessages,
  resolveChannelMessageSeed,
} from "@/lib/collaboration/client/channel-message-seed";
import { prefetchCollaboration } from "@/lib/collaboration/client/prefetch-collaboration";

function mergeUniqueMessages(
  existing: CollaborationMessageItem[],
  incoming: CollaborationMessageItem[]
) {
  if (!incoming.length) return existing;
  const ids = new Set(existing.map((message) => message.id));
  const toAdd = incoming.filter((message) => !ids.has(message.id));
  if (!toAdd.length) return existing;
  return [...existing, ...toAdd].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
}

function prependUniqueMessages(
  existing: CollaborationMessageItem[],
  older: CollaborationMessageItem[]
) {
  if (!older.length) return existing;
  const ids = new Set(existing.map((message) => message.id));
  const toAdd = older.filter((message) => !ids.has(message.id));
  if (!toAdd.length) return existing;
  return [...toAdd, ...existing];
}

function syncMessagesCache(
  channelId: string,
  messages: CollaborationMessageItem[]
) {
  void mutate(collabMessagesKey(channelId), messages, { revalidate: false });
}

export function usePaginatedChannelMessages(channelId: string) {
  const bootstrap = useCollaborationBootstrap();
  const bootstrapMessages = bootstrap?.initialMessagesByChannelId[channelId];
  const seedMessages = resolveChannelMessageSeed(channelId, bootstrapMessages);
  const hasSeed = seedMessages !== undefined;

  const [messages, setMessages] = useState<CollaborationMessageItem[]>(
    () => seedMessages ?? []
  );
  const [hasMoreOlder, setHasMoreOlder] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(() => !hasSeed);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const hasMoreOlderRef = useRef(true);
  const loadingOlderRef = useRef(false);
  const newestCreatedAtRef = useRef<string | null>(null);

  useEffect(() => {
    newestCreatedAtRef.current =
      messages[messages.length - 1]?.createdAt ?? null;
  }, [messages]);

  const applyPage = useCallback(
    (page: { messages: CollaborationMessageItem[]; hasMore: boolean }) => {
      setMessages(page.messages);
      setHasMoreOlder(page.hasMore);
      hasMoreOlderRef.current = page.hasMore;
      syncMessagesCache(channelId, page.messages);
    },
    [channelId]
  );

  const revalidateInBackground = useCallback(
    (isCancelled: () => boolean) => {
      void fetchChannelMessagesPage(channelId).then((page) => {
        if (isCancelled()) return;
        applyPage(page);
      });
    },
    [applyPage, channelId]
  );

  const loadInitial = useCallback(async () => {
    setLoadingInitial(true);
    try {
      const page = await fetchChannelMessagesPage(channelId);
      applyPage(page);
    } finally {
      setLoadingInitial(false);
    }
  }, [applyPage, channelId]);

  useEffect(() => {
    let cancelled = false;

    const resolvedSeed = resolveChannelMessageSeed(channelId, bootstrapMessages);

    if (resolvedSeed !== undefined) {
      setMessages(resolvedSeed);
      setLoadingInitial(false);
      setHasMoreOlder(true);
      hasMoreOlderRef.current = true;
      syncMessagesCache(channelId, resolvedSeed);
      revalidateInBackground(() => cancelled);
    } else {
      setMessages([]);
      setHasMoreOlder(true);
      hasMoreOlderRef.current = true;

      void prefetchCollaboration().then(() => {
        if (cancelled) return;

        const cached = getCachedChannelMessages(channelId);
        if (cached !== undefined) {
          setMessages(cached);
          setLoadingInitial(false);
          syncMessagesCache(channelId, cached);
          revalidateInBackground(() => cancelled);
          return;
        }

        void loadInitial();
      });
    }

    isNearBottomRef.current = true;

    return () => {
      cancelled = true;
    };
  }, [
    channelId,
    bootstrapMessages,
    loadInitial,
    revalidateInBackground,
  ]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const since = newestCreatedAtRef.current;
      if (!since) return;

      void fetchNewChannelMessages(channelId, since).then((incoming) => {
        if (!incoming.length) return;
        setMessages((current) => {
          const merged = mergeUniqueMessages(current, incoming);
          syncMessagesCache(channelId, merged);
          return merged;
        });
      });
    }, 5000);

    return () => window.clearInterval(interval);
  }, [channelId]);

  const loadOlder = useCallback(async () => {
    if (loadingOlderRef.current || !hasMoreOlderRef.current) return;

    const oldest = messages[0];
    if (!oldest) return;

    loadingOlderRef.current = true;
    setLoadingOlder(true);

    const container = scrollRef.current;
    const previousScrollHeight = container?.scrollHeight ?? 0;

    try {
      const page = await fetchChannelMessagesPage(channelId, {
        before: oldest.id,
      });
      setMessages((current) => {
        const merged = prependUniqueMessages(current, page.messages);
        syncMessagesCache(channelId, merged);
        return merged;
      });
      setHasMoreOlder(page.hasMore);
      hasMoreOlderRef.current = page.hasMore;

      requestAnimationFrame(() => {
        if (!container) return;
        container.scrollTop = container.scrollHeight - previousScrollHeight;
      });
    } finally {
      loadingOlderRef.current = false;
      setLoadingOlder(false);
    }
  }, [channelId, messages]);

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    isNearBottomRef.current = distanceFromBottom < 80;

    if (
      container.scrollTop < 80 &&
      hasMoreOlderRef.current &&
      !loadingOlderRef.current
    ) {
      void loadOlder();
    }
  }, [loadOlder]);

  const appendMessage = useCallback(
    (saved: CollaborationMessageItem) => {
      setMessages((current) => {
        const merged = mergeUniqueMessages(current, [saved]);
        syncMessagesCache(channelId, merged);
        return merged;
      });
    },
    [channelId]
  );

  const refreshMessages = useCallback(async () => {
    const page = await fetchChannelMessagesPage(channelId);
    setMessages((current) => {
      const next = !hasMoreOlderRef.current
        ? page.messages
        : (() => {
            const oldestInPage = page.messages[0]?.createdAt;
            if (!oldestInPage) {
              return page.messages;
            }

            const olderPrefix = current.filter(
              (message) => message.createdAt < oldestInPage
            );
            return [...olderPrefix, ...page.messages];
          })();

      syncMessagesCache(channelId, next);
      return next;
    });
  }, [channelId]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (!isNearBottomRef.current) return;
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  }, []);

  return {
    messages,
    hasMoreOlder,
    loadingOlder,
    loadingInitial,
    scrollRef,
    isNearBottomRef,
    handleScroll,
    appendMessage,
    refreshMessages,
    scrollToBottom,
    loadOlder,
  };
}
