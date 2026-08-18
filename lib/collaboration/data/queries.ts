import { toCollaborationMessageItem } from "@/lib/collaboration/data/mappers";
import {
  getChannelMessagesPage,
  listChannels,
  listUserMeetings,
  markChannelAsRead,
} from "@/lib/collaboration/data/service";
import { listTeamMembers, listTasks } from "@/lib/collaboration/data/team-service";
import type {
  CollaborationChannelItem,
  CollaborationMessageItem,
  MeetingItem,
} from "@/lib/collaboration/types";
import type { TaskItem, TeamMemberItem } from "@/lib/collaboration/types/team";

export type CollaborationBootstrap = {
  channels: CollaborationChannelItem[];
  members: TeamMemberItem[];
  meetings: MeetingItem[];
  tasks: TaskItem[];
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
  const [channels, members, meetings, tasks] = await Promise.all([
    listChannels(userId),
    listTeamMembers(),
    listUserMeetings(userId),
    listTasks(),
  ]);

  const defaultChannel = pickDefaultChannel(channels);
  const messagePages = await Promise.all(
    channels.map(async (channel) => {
      const page = await getChannelMessagesPage(channel.id);
      return [
        channel.id,
        page.messages.map(toCollaborationMessageItem),
      ] as const;
    })
  );
  const initialMessagesByChannelId = Object.fromEntries(messagePages);

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
    meetings,
    tasks,
    defaultChannelId: defaultChannel?.id ?? null,
    initialMessagesByChannelId,
  };
}
