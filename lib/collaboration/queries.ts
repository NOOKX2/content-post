import { toCollaborationMessageItem } from "@/lib/collaboration/mappers";
import {
  getChannelMessages,
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
    const messages = await getChannelMessages(defaultChannel.id);
    await markChannelAsRead(defaultChannel.id, userId);
    initialMessagesByChannelId[defaultChannel.id] = messages.map(
      toCollaborationMessageItem
    );
  }

  return {
    channels,
    members,
    defaultChannelId: defaultChannel?.id ?? null,
    initialMessagesByChannelId,
  };
}
