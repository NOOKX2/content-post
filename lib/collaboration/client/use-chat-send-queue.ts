"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CollaborationMessageItem } from "@/lib/collaboration/types";
import { postChannelMessage } from "@/lib/collaboration/actions/fetch";
import {
  listChatOutboxForChannel,
  readChatOutbox,
  removeChatOutboxEntry,
  upsertChatOutboxEntry,
  type ChatOutboxEntry,
} from "@/lib/collaboration/data/chat-outbox";

export type ChatDisplayMessage = CollaborationMessageItem & {
  sendStatus?: ChatOutboxEntry["status"];
};

function toDisplayMessage(entry: ChatOutboxEntry): ChatDisplayMessage {
  return {
    id: entry.clientId,
    channelId: entry.channelId,
    authorId: entry.authorId,
    authorName: entry.authorName,
    body: entry.body,
    messageType: "text",
    metadata: {},
    createdAt: entry.createdAt,
    editedAt: null,
    deletedAt: null,
    sendStatus: entry.status === "failed" ? "failed" : undefined,
  };
}

function isLikelyDuplicate(
  entry: ChatOutboxEntry,
  serverMessages: CollaborationMessageItem[]
) {
  const entryTime = new Date(entry.createdAt).getTime();
  return serverMessages.some((message) => {
    if (message.authorId !== entry.authorId || message.body !== entry.body) {
      return false;
    }
    const messageTime = new Date(message.createdAt).getTime();
    return Math.abs(messageTime - entryTime) < 15_000;
  });
}

export function mergeMessagesWithOutbox(
  serverMessages: CollaborationMessageItem[],
  outbox: ChatOutboxEntry[]
): ChatDisplayMessage[] {
  const serverIds = new Set(serverMessages.map((message) => message.id));
  const pending = outbox
    .filter((entry) => !serverIds.has(entry.clientId))
    .filter((entry) => !isLikelyDuplicate(entry, serverMessages))
    .map(toDisplayMessage);

  return [...serverMessages, ...pending].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
}

export function useChatSendQueue({
  channelId,
  authorId,
  authorName,
  serverMessages,
  onMessageSaved,
}: {
  channelId: string;
  authorId?: string;
  authorName: string;
  serverMessages: CollaborationMessageItem[];
  onMessageSaved: (saved: CollaborationMessageItem) => void;
}) {
  const [outbox, setOutbox] = useState<ChatOutboxEntry[]>(() =>
    listChatOutboxForChannel(channelId)
  );
  const processingRef = useRef(false);
  const onMessageSavedRef = useRef(onMessageSaved);
  onMessageSavedRef.current = onMessageSaved;

  const syncOutbox = useCallback(() => {
    setOutbox(listChatOutboxForChannel(channelId));
  }, [channelId]);

  const processQueue = useCallback(async () => {
    if (!authorId || processingRef.current) {
      return;
    }

    processingRef.current = true;
    try {
      while (true) {
        const next = readChatOutbox().find(
          (entry) =>
            entry.channelId === channelId &&
            (entry.status === "pending" || entry.status === "failed")
        );
        if (!next) {
          break;
        }

        upsertChatOutboxEntry({ ...next, status: "sending" });
        syncOutbox();

        try {
          const saved = await postChannelMessage(channelId, next.body);
          removeChatOutboxEntry(next.clientId);
          syncOutbox();
          onMessageSavedRef.current(saved);
        } catch {
          upsertChatOutboxEntry({ ...next, status: "failed" });
          syncOutbox();
        }
      }
    } finally {
      processingRef.current = false;
    }
  }, [authorId, channelId, syncOutbox]);

  useEffect(() => {
    syncOutbox();
    void processQueue();
  }, [channelId, processQueue, syncOutbox]);

  useEffect(() => {
    let changed = false;
    for (const entry of readChatOutbox().filter(
      (item) => item.channelId === channelId
    )) {
      if (isLikelyDuplicate(entry, serverMessages)) {
        removeChatOutboxEntry(entry.clientId);
        changed = true;
      }
    }
    if (changed) {
      syncOutbox();
    }
  }, [channelId, serverMessages, syncOutbox]);

  const enqueue = useCallback(
    (body: string) => {
      if (!authorId) {
        return;
      }

      const entry: ChatOutboxEntry = {
        clientId: `client-${crypto.randomUUID()}`,
        channelId,
        authorId,
        authorName,
        body,
        createdAt: new Date().toISOString(),
        status: "pending",
      };

      upsertChatOutboxEntry(entry);
      syncOutbox();
      void processQueue();
    },
    [authorId, authorName, channelId, processQueue, syncOutbox]
  );

  const retry = useCallback(
    (clientId: string) => {
      const entry = readChatOutbox().find((item) => item.clientId === clientId);
      if (!entry || entry.channelId !== channelId) {
        return;
      }

      upsertChatOutboxEntry({ ...entry, status: "pending" });
      syncOutbox();
      void processQueue();
    },
    [channelId, processQueue, syncOutbox]
  );

  return { outbox, enqueue, retry };
}
