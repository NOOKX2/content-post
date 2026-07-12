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
  contentId: string | null;
  contentCode?: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
};
