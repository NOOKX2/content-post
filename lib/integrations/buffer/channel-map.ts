import {
  getAvailablePlatformsForPostingChannel,
  getBufferChannelIdForPostingChannel,
  listPostingChannels,
  resolveBufferTargetsForPostingChannel,
} from "@/lib/content/posting/posting-channels";
import {
  ensurePostingChannelsSyncedFromEnv,
  getEnvMappedBufferChannelIds,
  parseBufferChannelMapFromEnv,
} from "@/lib/integrations/buffer/env-channel-map";
import { findBufferPostingTarget } from "@/lib/integrations/buffer/posting-targets";
import type { Platform } from "@/lib/types";

export type BufferPlatformTarget = {
  platform: Platform;
  bufferChannelId: string;
};

export async function resolveBufferTargets(
  contentChannel: string,
  platforms?: Platform[]
): Promise<BufferPlatformTarget[]> {
  if (!platforms?.length) return [];
  return resolveBufferTargetsForPostingChannel(contentChannel, platforms);
}

export async function getAllMappedBufferChannelIds(
  contentChannel?: string,
  platform?: string
): Promise<string[]> {
  const envIds = getEnvMappedBufferChannelIds({ contentChannel, platform });
  if (envIds.length) {
    await ensurePostingChannelsSyncedFromEnv().catch((error) => {
      console.error("[buffer] failed to sync PostingChannelPlatform from env", {
        error: error instanceof Error ? error.message : error,
      });
    });
    return envIds;
  }

  if (contentChannel) {
    const platformFilter =
      platform && platform !== "all" ? (platform as Platform) : undefined;
    const target = await findBufferPostingTarget(contentChannel, platformFilter);
    if (target) return [target.bufferChannelId];
  }

  const ids = new Set<string>();
  const channels = contentChannel
    ? [{ slug: contentChannel }]
    : (await listPostingChannels()).map((channel) => ({ slug: channel.slug }));

  for (const { slug } of channels) {
    const platforms = await getAvailablePlatformsForPostingChannel(slug);
    const filtered =
      platform && platform !== "all"
        ? platforms.filter((p) => p === platform)
        : platforms;

    for (const p of filtered) {
      const id = await getBufferChannelIdForPostingChannel(slug, p);
      if (id) ids.add(id);
    }
  }

  return [...ids];
}
