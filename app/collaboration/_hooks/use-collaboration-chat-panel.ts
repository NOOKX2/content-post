"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useSession } from "next-auth/react";
import type { CollaborationChannelItem, CollaborationMessageItem } from "@/lib/collaboration/types";
import { COLLAB_MESSAGES_PAGE_SIZE } from "@/lib/collaboration/types";
import {
  COLLAB_CHANNELS_KEY,
  patchChannelsUnread,
  TEAM_MEMBERS_KEY,
  useCollaborationBootstrap,
} from "@/lib/collaboration/client/collaboration-provider";
import { usePaginatedChannelMessages } from "@/lib/collaboration/client/use-paginated-channel-messages";
import {
  mergeMessagesWithOutbox,
  useChatSendQueue,
} from "@/lib/collaboration/client/use-chat-send-queue";
import { fetchTeamMembers } from "@/lib/collaboration/actions/team";
import { useT } from "@/lib/i18n";

export function useCollaborationChatPanel(
  channel: CollaborationChannelItem,
  onLeave?: () => void
) {
  const { data: session } = useSession();
  const { t } = useT();
  const bootstrap = useCollaborationBootstrap();
  const { mutate: mutateGlobal } = useSWRConfig();

  const [text, setText] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [showChannelCalendar, setShowChannelCalendar] = useState(false);

  const {
    messages,
    hasMoreOlder,
    loadingOlder,
    loadingInitial,
    scrollRef,
    handleScroll,
    appendMessage,
    refreshMessages,
    scrollToBottom,
  } = usePaginatedChannelMessages(channel.id);

  const { data: members = [] } = useSWR(TEAM_MEMBERS_KEY, fetchTeamMembers, {
    fallbackData: bootstrap?.members,
    revalidateOnMount: !bootstrap,
  });

  const onMessageSaved = useCallback(
    (saved: CollaborationMessageItem) => {
      appendMessage(saved);
      void mutateGlobal(COLLAB_CHANNELS_KEY);
    },
    [appendMessage, mutateGlobal]
  );

  const { outbox, enqueue, retry } = useChatSendQueue({
    channelId: channel.id,
    authorId: session?.user?.id,
    authorName: session?.user?.name ?? "ผู้ใช้",
    serverMessages: messages,
    onMessageSaved,
  });

  const displayMessages = useMemo(
    () =>
      mergeMessagesWithOutbox(messages, outbox).filter(
        (message) => !message.deletedAt
      ),
    [messages, outbox]
  );

  const headerPeople =
    channel.kind === "dm"
      ? [channel.name]
      : channel.kind === "group" && channel.memberNames?.length
        ? channel.memberNames
        : members.map((member) => member.name);

  const memberCount =
    channel.kind === "dm"
      ? 2
      : channel.kind === "group"
        ? (channel.memberCount ?? headerPeople.length)
        : Math.max(members.length, headerPeople.length);

  const peerMember = members.find((member) => member.id === channel.peerUserId);
  const peerOnline = channel.kind === "dm" && peerMember && !peerMember.busy;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom(messages.length <= COLLAB_MESSAGES_PAGE_SIZE ? "auto" : "smooth");
  }, [displayMessages, scrollToBottom, messages.length]);

  // Reset calendar view when channel changes
  useEffect(() => {
    setShowChannelCalendar(false);
  }, [channel.id]);

  // Clear unread badge only when channel changes — not on every message poll
  useEffect(() => {
    void mutateGlobal(
      COLLAB_CHANNELS_KEY,
      (current) => patchChannelsUnread(current, channel.id, 0),
      { revalidate: false }
    );
  }, [channel.id, mutateGlobal]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !session?.user?.id) return;
    enqueue(text.trim());
    setText("");
  };

  const handleOpenCalendar = (onOpenCalendar?: (peerUserId?: string) => void) => {
    if (onOpenCalendar) {
      onOpenCalendar(channel.peerUserId ?? undefined);
      return;
    }
    setShowChannelCalendar(true);
  };

  const handleGroupChanged = () => {
    void refreshMessages();
    void mutateGlobal(COLLAB_CHANNELS_KEY);
  };

  const handleGroupLeft = () => {
    setShowMembers(false);
    void mutateGlobal(COLLAB_CHANNELS_KEY);
    onLeave?.();
  };

  return {
    // session
    session,
    t,
    // messages
    messages,
    displayMessages,
    hasMoreOlder,
    loadingOlder,
    loadingInitial,
    scrollRef,
    handleScroll,
    refreshMessages,
    retry,
    // compose
    text,
    setText,
    handleSend,
    // members
    members,
    memberCount,
    peerOnline,
    // member dialog
    showMembers,
    setShowMembers,
    handleGroupChanged,
    handleGroupLeft,
    // calendar
    showChannelCalendar,
    setShowChannelCalendar,
    handleOpenCalendar,
  };
}
