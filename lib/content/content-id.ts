import type { PrismaClient } from "@prisma/client";

export const CHANNEL_PREFIXES = {
  วังวาน: "VWW",
  "ลูกสาว วังวาน": "VDW",
  สามพี่น้องวังวาน: "V3W",
  ของชำร่วย: "VWG",
  วังน้ำเขียวฟาร์ม: "VWF",
} as const;

export type ContentChannel = keyof typeof CHANNEL_PREFIXES;

export const CONTENT_CHANNELS = Object.keys(
  CHANNEL_PREFIXES
) as ContentChannel[];

export const MAX_CONTENT_ID_SEQUENCE = 9999;

export function isValidChannel(channel: string): channel is ContentChannel {
  return channel in CHANNEL_PREFIXES;
}

export function getChannelPrefix(channel: string): string | undefined {
  if (!isValidChannel(channel)) return undefined;
  return CHANNEL_PREFIXES[channel];
}

export function formatChannelContentId(
  prefix: string,
  sequence: number
): string {
  return `${prefix}${String(sequence).padStart(4, "0")}`;
}

export function parseChannelContentIdSequence(
  contentId: string,
  prefix: string
): number | null {
  if (!contentId.startsWith(prefix)) return null;
  const num = Number.parseInt(contentId.slice(prefix.length), 10);
  return Number.isFinite(num) ? num : null;
}

export async function resolveNextContentIdForChannel(
  channel: string,
  db: PrismaClient
): Promise<string> {
  const prefix = getChannelPrefix(channel);
  if (!prefix) {
    throw new Error("ช่องที่ลงไม่ถูกต้อง");
  }

  const latest = await db.content.findFirst({
    where: { contentId: { startsWith: prefix } },
    select: { contentId: true },
    orderBy: { contentId: "desc" },
  });

  const currentMax = latest
    ? (parseChannelContentIdSequence(latest.contentId, prefix) ?? 0)
    : 0;
  const next = currentMax + 1;

  if (next > MAX_CONTENT_ID_SEQUENCE) {
    throw new Error(
      `รหัส Content สำหรับช่องนี้เต็มแล้ว (${formatChannelContentId(prefix, MAX_CONTENT_ID_SEQUENCE)})`
    );
  }

  return formatChannelContentId(prefix, next);
}

export function resolveNextContentIdFromList(
  channel: string,
  contents: Array<{ contentId: string }>
): string | null {
  const prefix = getChannelPrefix(channel);
  if (!prefix) return null;

  let maxSequence = 0;
  for (const item of contents) {
    const sequence = parseChannelContentIdSequence(item.contentId, prefix);
    if (sequence !== null && sequence > maxSequence) {
      maxSequence = sequence;
    }
  }

  const next = maxSequence + 1;
  if (next > MAX_CONTENT_ID_SEQUENCE) return null;

  return formatChannelContentId(prefix, next);
}
