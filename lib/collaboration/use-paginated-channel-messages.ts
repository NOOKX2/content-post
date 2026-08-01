"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CollaborationMessageItem } from "@/lib/collaboration/types";
import {
  fetchChannelMessagesPage,
  fetchNewChannelMessages,
} from "@/lib/collaboration/fetch-actions";

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

export function usePaginatedChannelMessages(
  channelId: string,
  options?: {
    fallbackMessages?: CollaborationMessageItem[];
  }
) {
  const fallbackMessages = options?.fallbackMessages;
  const [messages, setMessages] = useState<CollaborationMessageItem[]>(
    () => fallbackMessages ?? []
  );
  const [hasMoreOlder, setHasMoreOlder] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(
    () => !fallbackMessages?.length
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const hasMoreOlderRef = useRef(true);
  const loadingOlderRef = useRef(false);
  const newestCreatedAtRef = useRef<string | null>(null);

  useEffect(() => {
    newestCreatedAtRef.current =
      messages[messages.length - 1]?.createdAt ?? null;
  }, [messages]);

  const loadInitial = useCallback(async () => {
    setLoadingInitial(true);
    try {
      const page = await fetchChannelMessagesPage(channelId);
      setMessages(page.messages);
      setHasMoreOlder(page.hasMore);
      hasMoreOlderRef.current = page.hasMore;
    } finally {
      setLoadingInitial(false);
    }
  }, [channelId]);

  useEffect(() => {
    let cancelled = false;

    if (fallbackMessages?.length) {
      setMessages(fallbackMessages);
      setLoadingInitial(false);
      setHasMoreOlder(true);
      hasMoreOlderRef.current = true;

      void fetchChannelMessagesPage(channelId).then((page) => {
        if (cancelled) return;
        setMessages(page.messages);
        setHasMoreOlder(page.hasMore);
        hasMoreOlderRef.current = page.hasMore;
      });
    } else {
      setMessages([]);
      setHasMoreOlder(true);
      hasMoreOlderRef.current = true;
      void loadInitial().then(() => {
        if (cancelled) return;
      });
    }

    isNearBottomRef.current = true;

    return () => {
      cancelled = true;
    };
  }, [channelId, fallbackMessages, loadInitial]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const since = newestCreatedAtRef.current;
      if (!since) return;

      void fetchNewChannelMessages(channelId, since).then((incoming) => {
        if (!incoming.length) return;
        setMessages((current) => mergeUniqueMessages(current, incoming));
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
      setMessages((current) => prependUniqueMessages(current, page.messages));
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

  const appendMessage = useCallback((saved: CollaborationMessageItem) => {
    setMessages((current) => mergeUniqueMessages(current, [saved]));
  }, []);

  const refreshMessages = useCallback(async () => {
    const page = await fetchChannelMessagesPage(channelId);
    setMessages((current) => {
      if (!hasMoreOlderRef.current) {
        return page.messages;
      }

      const oldestInPage = page.messages[0]?.createdAt;
      if (!oldestInPage) {
        return page.messages;
      }

      const olderPrefix = current.filter(
        (message) => message.createdAt < oldestInPage
      );
      return [...olderPrefix, ...page.messages];
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
