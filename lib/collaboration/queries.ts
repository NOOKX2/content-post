import { toCollaborationMessageItem } from "@/lib/collaboration/mappers";
import {
  getChannelMessagesPage,
  listChannels,
  markChannelAsRead,
} from "@/lib/collaboration/service";
import { listTeamMembers } from "@/lib/collaboration/team-service";
import type {
  CollaborationChannelItem,
  CollaborationMessageItem,
} from "@/lib/collaboration/types";
import type { TeamMemberItem } from "@/lib/collaboration/team-types";

export type CollaborationBootstrap = {
  channels: CollaborationChannelItem[];
  members: TeamMemberItem[];
  defaultChannelId: string | null;
  initialMessagesByChannelId: Record<string, CollaborationMessageItem[]>;
};

function pickDefaultChannel(
  channels: CollaborationChannelItem[]
): CollaborationChannelItem | null {
  return channels.find((channel) => channel.kind === "team") ?? channels[0] ?? null;
}

export async function getCollaborationBootstrap(
  userId: string
): Promise<CollaborationBootstrap> {
  const [channels, members] = await Promise.all([
    listChannels(userId),
    listTeamMembers(),
  ]);

  const defaultChannel = pickDefaultChannel(channels);
  const initialMessagesByChannelId: Record<string, CollaborationMessageItem[]> =
    {};

  if (defaultChannel) {
    const page = await getChannelMessagesPage(defaultChannel.id);
    initialMessagesByChannelId[defaultChannel.id] = page.messages.map(
      toCollaborationMessageItem
    );
  }

  if (defaultChannel) {
    await markChannelAsRead(defaultChannel.id, userId);
    const defaultIndex = channels.findIndex(
      (channel) => channel.id === defaultChannel.id
    );
    if (defaultIndex >= 0) {
      channels[defaultIndex] = {
        ...channels[defaultIndex],
        unreadCount: 0,
      };
    }
  }

  return {
    channels,
    members,
    defaultChannelId: defaultChannel?.id ?? null,
    initialMessagesByChannelId,
  };
}
