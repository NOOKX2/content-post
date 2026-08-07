export type ChatOutboxStatus = "pending" | "sending" | "failed";

export type ChatOutboxEntry = {
  clientId: string;
  channelId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
  status: ChatOutboxStatus;
};

const STORAGE_KEY = "collab-chat-outbox";

export function readChatOutbox(): ChatOutboxEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as ChatOutboxEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeChatOutbox(entries: ChatOutboxEntry[]) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function upsertChatOutboxEntry(entry: ChatOutboxEntry) {
  const entries = readChatOutbox();
  const index = entries.findIndex((item) => item.clientId === entry.clientId);
  if (index >= 0) {
    entries[index] = entry;
  } else {
    entries.push(entry);
  }
  writeChatOutbox(entries);
}

export function removeChatOutboxEntry(clientId: string) {
  writeChatOutbox(readChatOutbox().filter((item) => item.clientId !== clientId));
}

export function listChatOutboxForChannel(channelId: string) {
  return readChatOutbox().filter((item) => item.channelId === channelId);
}

export function isClientMessageId(id: string) {
  return id.startsWith("client-");
}
