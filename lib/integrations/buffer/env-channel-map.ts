import { prisma } from "@/lib/shared/prisma";
import type { Platform } from "@/lib/types";

const ENV_PLATFORMS: Platform[] = [
  "instagram",
  "tiktok",
  "facebook",
  "youtube",
];

export type EnvBufferChannelLink = {
  slug: string;
  platform: Platform;
  bufferChannelId: string;
  bufferChannelName: string;
};

function isPlatform(value: string): value is Platform {
  return ENV_PLATFORMS.includes(value as Platform);
}

function stripEnvQuotes(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseChannelMapJson(raw: string): EnvBufferChannelLink[] {
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("BUFFER_CHANNEL_MAP must be a JSON object");
  }

  const links: EnvBufferChannelLink[] = [];

  for (const [slug, value] of Object.entries(
    parsed as Record<string, unknown>
  )) {
    if (typeof value === "string" && value.trim()) {
      links.push({
        slug,
        platform: "instagram",
        bufferChannelId: value.trim(),
        bufferChannelName: slug,
      });
      continue;
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [platform, id] of Object.entries(
        value as Record<string, unknown>
      )) {
        if (!isPlatform(platform) || typeof id !== "string" || !id.trim()) {
          continue;
        }
        links.push({
          slug,
          platform,
          bufferChannelId: id.trim(),
          bufferChannelName: slug,
        });
      }
    }
  }

  return links;
}

function legacyEnvLinks(): EnvBufferChannelLink[] {
  const pairs: Array<[Platform, string | undefined]> = [
    ["instagram", process.env.BUFFER_IG_CHANNEL_ID],
    ["tiktok", process.env.BUFFER_TIKTOK_CHANNEL_ID],
    ["facebook", process.env.BUFFER_FB_CHANNEL_ID],
    ["youtube", process.env.BUFFER_YOUTUBE_CHANNEL_ID],
  ];

  return pairs.flatMap(([platform, id]) => {
    const bufferChannelId = id?.trim();
    if (!bufferChannelId) return [];
    return [
      {
        slug: platform,
        platform,
        bufferChannelId,
        bufferChannelName: platform,
      },
    ];
  });
}

export function parseBufferChannelMapFromEnv(): EnvBufferChannelLink[] {
  const raw = process.env.BUFFER_CHANNEL_MAP
    ? stripEnvQuotes(process.env.BUFFER_CHANNEL_MAP)
    : "";

  if (raw) {
    try {
      const mapped = parseChannelMapJson(raw);
      if (mapped.length) return mapped;
    } catch (error) {
      console.error("[buffer] invalid BUFFER_CHANNEL_MAP", {
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  return legacyEnvLinks();
}

export function getEnvMappedBufferChannelIds(options?: {
  contentChannel?: string;
  platform?: string;
}): string[] {
  const links = parseBufferChannelMapFromEnv();
  const contentChannel = options?.contentChannel?.trim();
  const platform = options?.platform;

  return [
    ...new Set(
      links
        .filter((link) => {
          if (
            contentChannel &&
            link.slug !== contentChannel &&
            link.bufferChannelId !== contentChannel
          ) {
            return false;
          }
          if (platform && platform !== "all" && link.platform !== platform) {
            return false;
          }
          return true;
        })
        .map((link) => link.bufferChannelId)
    ),
  ];
}

function derivePrefix(slug: string) {
  const alnum = slug.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (alnum.length >= 3) return alnum.slice(0, 3);
  return alnum.padEnd(3, "X");
}

let syncPromise: Promise<void> | null = null;

async function syncPostingChannelsFromEnv(
  links: EnvBufferChannelLink[]
): Promise<void> {
  const envKeys = new Set(
    links.map((link) => `${link.slug}:${link.platform}:${link.bufferChannelId}`)
  );
  const envSlugs = [...new Set(links.map((link) => link.slug))];

  for (const [index, slug] of envSlugs.entries()) {
    const slugLinks = links.filter((link) => link.slug === slug);
    const existing = await prisma.postingChannel.findUnique({
      where: { slug },
    });

    const channel =
      existing ??
      (await prisma.postingChannel.create({
        data: {
          slug,
          label: slug,
          prefix: `${derivePrefix(slug)}${index || ""}`.slice(0, 8),
          sortOrder: index,
          enabled: true,
        },
      }));

    if (!channel.enabled) {
      await prisma.postingChannel.update({
        where: { id: channel.id },
        data: { enabled: true },
      });
    }

    for (const link of slugLinks) {
      await prisma.postingChannelPlatform.upsert({
        where: {
          postingChannelId_platform: {
            postingChannelId: channel.id,
            platform: link.platform,
          },
        },
        create: {
          postingChannelId: channel.id,
          platform: link.platform,
          bufferChannelId: link.bufferChannelId,
          bufferChannelName: link.bufferChannelName,
          enabled: true,
        },
        update: {
          bufferChannelId: link.bufferChannelId,
          bufferChannelName: link.bufferChannelName,
          enabled: true,
        },
      });
    }
  }

  const rows = await prisma.postingChannelPlatform.findMany({
    include: { postingChannel: { select: { slug: true } } },
  });

  for (const row of rows) {
    const key = `${row.postingChannel.slug}:${row.platform}:${row.bufferChannelId}`;
    const keep = envKeys.has(key);
    if (row.enabled !== keep) {
      await prisma.postingChannelPlatform.update({
        where: { id: row.id },
        data: { enabled: keep },
      });
    }
  }
}

export async function ensurePostingChannelsSyncedFromEnv(): Promise<void> {
  if (syncPromise) return syncPromise;

  syncPromise = (async () => {
    const links = parseBufferChannelMapFromEnv();
    if (!links.length) return;
    await syncPostingChannelsFromEnv(links);
  })().catch((error) => {
    syncPromise = null;
    throw error;
  });

  return syncPromise;
}
