export type ApprovalCardMetadata = {
  contentId: string;
  contentCode: string;
  contentName: string;
  requesterName: string;
  channel: string;
  remarks: string;
  status: "pending" | "approved" | "rejected";
  approvalRound?: 1 | 2;
  rejectReason?: string;
  resolvedBy?: string;
  resolvedAt?: string;
};

export type MeetingCardMetadata = {
  title: string;
  meetUrl: string;
  startsAt: string;
  endsAt: string;
  eventId?: string;
  calendarLink?: string;
  attendeeCount?: number;
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
  editedAt: string | null;
  deletedAt: string | null;
};

export type MeetingItem = {
  id: string;
  channelId: string;
  channelName: string;
  channelKind: "team" | "dm" | "group";
  title: string;
  meetUrl: string;
  startsAt: string;
  endsAt: string;
  calendarLink: string;
  attendeeCount: number;
  authorName: string;
};

export type GroupMemberItem = {
  id: string;
  name: string;
  email: string;
  isCreator: boolean;
  joinedAt: string;
};

export type CollaborationChannelItem = {
  id: string;
  slug: string;
  name: string;
  kind: "team" | "dm" | "group";
  contentId: string | null;
  contentCode?: string;
  peerUserId?: string | null;
  peerEmail?: string | null;
  memberNames?: string[];
  memberCount?: number;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
};
