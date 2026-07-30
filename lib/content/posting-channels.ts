import { prisma } from "@/lib/prisma";
import type { Platform } from "@/lib/types";
import {
  findBufferPostingTarget,
  isValidBufferPostingChannel,
  listBufferPostingTargets,
} from "@/lib/buffer/posting-targets";
import { isBufferConfigured } from "@/lib/buffer/client";

const DEFAULT_CHANNELS: Array<{
  slug: string;
  label: string;
  prefix: string;
  sortOrder: number;
  links: Array<{
    platform: Platform;
    bufferChannelId: string;
    bufferChannelName: string;
  }>;
}> = [
  {
    slug: "nook__th",
    label: "nook__th",
    prefix: "NKT",
    sortOrder: 0,
    links: [
      {
        platform: "instagram",
        bufferChannelId: "6a473ba65ab6d2f1069bd878",
        bufferChannelName: "nook__th",
      },
      {
        platform: "tiktok",
        bufferChannelId: "6a473d135ab6d2f1069bdc4a",
        bufferChannelName: "nook_down",
      },
    ],
  },
  {
    slug: "idea_content_post",
    label: "idea_content_post",
    prefix: "ICP",
    sortOrder: 1,
    links: [
      {
        platform: "instagram",
        bufferChannelId: "6a4f72e44048344628883dee",
        bufferChannelName: "idea_content_post",
      },
    ],
  },
  {
    slug: "nook_down",
    label: "nook_down",
    prefix: "NKD",
    sortOrder: 2,
    links: [
      {
        platform: "tiktok",
        bufferChannelId: "6a473d135ab6d2f1069bdc4a",
        bufferChannelName: "nook_down",
      },
    ],
  },
];

export type PostingChannelOption = {
  slug: string;
  label: string;
  prefix: string;
  platforms: Platform[];
  /** Buffer account name stored in Content.channel */
  name: string;
};

export type PostingChannelAdmin = PostingChannelOption & {
  id: string;
  enabled: boolean;
  links: Array<{
    id: string;
    platform: Platform;
    bufferChannelId: string;
    bufferChannelName: string;
    enabled: boolean;
  }>;
};

function mapChannelOption(
  channel: Awaited<ReturnType<typeof listPostingChannels>>[number]
): PostingChannelOption {
  return {
    slug: channel.slug,
    label: channel.label,
    prefix: channel.prefix,
    platforms: channel.links
      .filter((link) => link.enabled)
      .map((link) => link.platform as Platform),
    name: channel.label,
  };
}

export async function seedDefaultPostingChannels() {
  const count = await prisma.postingChannel.count();
  if (count > 0) return;

  for (const channel of DEFAULT_CHANNELS) {
    await prisma.postingChannel.create({
      data: {
        slug: channel.slug,
        label: channel.label,
        prefix: channel.prefix,
        sortOrder: channel.sortOrder,
        links: {
          create: channel.links.map((link) => ({
            platform: link.platform,
            bufferChannelId: link.bufferChannelId,
            bufferChannelName: link.bufferChannelName,
          })),
        },
      },
    });
  }
}

export async function listPostingChannels() {
  return prisma.postingChannel.findMany({
    where: { enabled: true },
    include: {
      links: {
        where: { enabled: true },
        orderBy: { platform: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export type PostingChannelsForForm = {
  channels: PostingChannelOption[];
  source: "buffer" | "legacy";
};

export async function listPostingChannelsForForm(): Promise<PostingChannelsForForm> {
  if (isBufferConfigured()) {
    const bufferTargets = await listBufferPostingTargets();
    if (bufferTargets.length > 0) {
      return {
        source: "buffer",
        channels: bufferTargets.map((target) => ({
          slug: target.slug,
          label: target.label,
          prefix: target.prefix,
          platforms: target.platforms,
          name: target.name,
        })),
      };
    }
  }

  const channels = await listPostingChannels();
  return {
    source: "legacy",
    channels: channels.map(mapChannelOption),
  };
}

export async function listPostingChannelsForAdmin(): Promise<PostingChannelAdmin[]> {
  const channels = await prisma.postingChannel.findMany({
    include: {
      links: { orderBy: { platform: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return channels.map((channel) => ({
    id: channel.id,
    slug: channel.slug,
    label: channel.label,
    prefix: channel.prefix,
    name: channel.label,
    enabled: channel.enabled,
    platforms: channel.links
      .filter((link) => link.enabled)
      .map((link) => link.platform as Platform),
    links: channel.links.map((link) => ({
      id: link.id,
      platform: link.platform as Platform,
      bufferChannelId: link.bufferChannelId,
      bufferChannelName: link.bufferChannelName,
      enabled: link.enabled,
    })),
  }));
}

export async function isValidPostingChannel(
  channel: string,
  platforms?: Platform[]
): Promise<boolean> {
  if (platforms?.length && (await isValidBufferPostingChannel(channel, platforms))) {
    return true;
  }

  const record = await prisma.postingChannel.findFirst({
    where: { slug: channel, enabled: true },
    select: { id: true },
  });
  return Boolean(record);
}

export async function getPostingChannelPrefix(
  channel: string,
  platform?: Platform
): Promise<string | undefined> {
  const bufferTarget = await findBufferPostingTarget(channel, platform);
  if (bufferTarget) return bufferTarget.prefix;

  const record = await prisma.postingChannel.findFirst({
    where: { slug: channel, enabled: true },
    select: { prefix: true },
  });
  return record?.prefix;
}

export async function getAvailablePlatformsForPostingChannel(
  channel: string,
  platform?: Platform
): Promise<Platform[]> {
  const bufferTarget = await findBufferPostingTarget(channel, platform);
  if (bufferTarget) return [bufferTarget.platform];

  const links = await prisma.postingChannelPlatform.findMany({
    where: {
      enabled: true,
      postingChannel: { slug: channel, enabled: true },
    },
    select: { platform: true },
    orderBy: { platform: "asc" },
  });
  return links.map((link) => link.platform as Platform);
}

export async function getBufferChannelIdForPostingChannel(
  slug: string,
  platform: Platform
): Promise<string | undefined> {
  const link = await prisma.postingChannelPlatform.findFirst({
    where: {
      enabled: true,
      platform,
      postingChannel: { slug, enabled: true },
    },
    select: { bufferChannelId: true },
  });
  return link?.bufferChannelId;
}

export async function resolveBufferTargetsForPostingChannel(
  channel: string,
  platforms: Platform[]
) {
  const targets = [];
  for (const platform of platforms) {
    const bufferTarget = await findBufferPostingTarget(channel, platform);
    if (bufferTarget) {
      targets.push({
        platform,
        bufferChannelId: bufferTarget.bufferChannelId,
      });
      continue;
    }

    const bufferChannelId = await getBufferChannelIdForPostingChannel(
      channel,
      platform
    );
    if (bufferChannelId) {
      targets.push({ platform, bufferChannelId });
    }
  }
  return targets;
}

export async function upsertPostingChannelPlatformLink(input: {
  channelId: string;
  platform: Platform;
  bufferChannelId: string;
  bufferChannelName: string;
}) {
  return prisma.postingChannelPlatform.upsert({
    where: {
      postingChannelId_platform: {
        postingChannelId: input.channelId,
        platform: input.platform,
      },
    },
    create: {
      postingChannelId: input.channelId,
      platform: input.platform,
      bufferChannelId: input.bufferChannelId,
      bufferChannelName: input.bufferChannelName,
      enabled: true,
    },
    update: {
      bufferChannelId: input.bufferChannelId,
      bufferChannelName: input.bufferChannelName,
      enabled: true,
    },
  });
}

export async function removePostingChannelPlatformLink(
  channelId: string,
  platform: Platform
) {
  await prisma.postingChannelPlatform.deleteMany({
    where: { postingChannelId: channelId, platform },
  });
}

function slugifyPostingChannelLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]+/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

export async function generateUniquePostingChannelSlug(
  label: string,
  prefix?: string
): Promise<string> {
  let base = slugifyPostingChannelLabel(label);
  if (!base && prefix) {
    base = slugifyPostingChannelLabel(prefix);
  }
  if (!base) {
    base = "channel";
  }

  let slug = base;
  let suffix = 2;
  while (await prisma.postingChannel.findUnique({ where: { slug } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function createPostingChannel(input: {
  label: string;
  prefix: string;
}) {
  const label = input.label.trim();
  const prefix = input.prefix.trim().toUpperCase();
  const slug = await generateUniquePostingChannelSlug(label, prefix);

  return prisma.postingChannel.create({
    data: {
      slug,
      label,
      prefix,
      sortOrder: await prisma.postingChannel.count(),
    },
  });
}

export async function deletePostingChannel(id: string) {
  const channel = await prisma.postingChannel.findUnique({
    where: { id },
    select: { id: true, label: true },
  });
  if (!channel) {
    throw new Error("ไม่พบช่องนี้");
  }

  await prisma.postingChannel.delete({ where: { id } });
  return channel;
}
