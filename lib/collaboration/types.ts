export type ApprovalCardMetadata = {
  contentId: string;
  contentCode: string;
  contentName: string;
  requesterName: string;
  channel: string;
  remarks: string;
  status: "pending" | "approved" | "rejected";
  rejectReason?: string;
  resolvedBy?: string;
};

export type MeetingCardMetadata = {
  title: string;
  meetUrl: string;
  startsAt: string;
  endsAt: string;
};

export type CollaborationMessageItem = {
  id: string;
  channelId: string;
  authorId: string | null;
  authorName: string;
  body: string;
  messageType: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type CollaborationChannelItem = {
  id: string;
  slug: string;
  name: string;
  kind: "team" | "dm";
  contentId: string | null;
  contentCode?: string;
  peerUserId?: string | null;
  peerEmail?: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
};
