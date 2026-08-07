import { listBufferChannels } from "@/lib/integrations/buffer/list-channels";
import { isBufferConfigured } from "@/lib/integrations/buffer/client";
import { prisma } from "@/lib/shared/prisma";
import { PLATFORMS } from "@/lib/constants";
import type { Platform, PostingTarget } from "@/lib/types";

export type BufferPostingTarget = {
  /** Buffer channel id — used as form option value */
  slug: string;
  /** Display label e.g. nook__th · Instagram */
  label: string;
  /** Stored in Content.channel */
  name: string;
  platform: Platform;
  bufferChannelId: string;
  prefix: string;
  platforms: Platform[];
};

const SERVICE_TO_PLATFORM: Record<string, Platform | null> = {
  instagram: "instagram",
  tiktok: "tiktok",
  facebook: "facebook",
  youtube: "youtube",
};

export function mapBufferServiceToPlatform(service: string): Platform | null {
  return SERVICE_TO_PLATFORM[service.toLowerCase()] ?? null;
}

function platformLabel(platform: Platform): string {
  return PLATFORMS.find((item) => item.id === platform)?.label ?? platform;
}

function derivePrefixFromName(name: string): string {
  const alnum = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (alnum.length >= 3) return alnum.slice(0, 3);
  return alnum.padEnd(3, "X");
}

async function resolvePrefix(name: string, platform: Platform): Promise<string> {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]+/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  const dbChannel = slug
    ? await prisma.postingChannel.findFirst({
        where: { OR: [{ slug }, { label: name }] },
        select: { prefix: true },
      })
    : null;

  if (dbChannel?.prefix) return dbChannel.prefix;

  const base = derivePrefixFromName(name);
  const suffix = platform.slice(0, 1).toUpperCase();
  return `${base.slice(0, 2)}${suffix}`;
}

export async function listBufferPostingTargets(): Promise<BufferPostingTarget[]> {
  if (!isBufferConfigured()) return [];

  const channels = await listBufferChannels();
  const targets: BufferPostingTarget[] = [];

  for (const channel of channels) {
    if (channel.isDisconnected) continue;

    const platform = mapBufferServiceToPlatform(channel.service);
    if (!platform) continue;

    const prefix = await resolvePrefix(channel.name, platform);
    const label = `${channel.name} · ${platformLabel(platform)}`;

    targets.push({
      slug: channel.id,
      label,
      name: channel.name,
      platform,
      bufferChannelId: channel.id,
      prefix,
      platforms: [platform],
    });
  }

  return targets.sort((a, b) => a.label.localeCompare(b.label, "th"));
}

export async function findBufferPostingTarget(
  channel: string,
  platform?: Platform
): Promise<BufferPostingTarget | null> {
  const targets = await listBufferPostingTargets();

  const byId = targets.find((target) => target.bufferChannelId === channel);
  if (byId) {
    return platform && byId.platform !== platform ? null : byId;
  }

  if (platform) {
    return (
      targets.find(
        (target) => target.name === channel && target.platform === platform
      ) ?? null
    );
  }

  const matches = targets.filter((target) => target.name === channel);
  return matches.length === 1 ? matches[0] : null;
}

export async function isValidBufferPostingChannel(
  channel: string,
  platforms: Platform[]
): Promise<boolean> {
  if (!platforms.length) return false;
  const target = await findBufferPostingTarget(channel, platforms[0]);
  return Boolean(target);
}

export async function resolvePostingTargetsFromSlugs(
  slugs: string[]
): Promise<PostingTarget[]> {
  if (!slugs.length) return [];

  const targets = await listBufferPostingTargets();
  return slugs
    .map((slug) => targets.find((target) => target.slug === slug))
    .filter((target): target is BufferPostingTarget => Boolean(target))
    .map((target) => ({
      bufferChannelId: target.bufferChannelId,
      platform: target.platform,
      name: target.name,
    }));
}

export function formatChannelLabelFromTargets(targets: PostingTarget[]): string {
  if (targets.length === 0) return "";
  if (targets.length === 1) return targets[0].name;
  return `${targets[0].name} +${targets.length - 1}`;
}

export function platformsFromPostingTargets(targets: PostingTarget[]): Platform[] {
  return [...new Set(targets.map((target) => target.platform))];
}

export function parsePostingTargets(value: unknown): PostingTarget[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const target = item as Partial<PostingTarget>;
      if (
        typeof target.bufferChannelId !== "string" ||
        typeof target.platform !== "string" ||
        typeof target.name !== "string"
      ) {
        return null;
      }
      return {
        bufferChannelId: target.bufferChannelId,
        platform: target.platform as Platform,
        name: target.name,
      };
    })
    .filter((target): target is PostingTarget => Boolean(target));
}
