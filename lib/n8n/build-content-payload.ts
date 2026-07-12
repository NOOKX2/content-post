import type { Content } from "@prisma/client";
import { resolveBufferTargets } from "@/lib/buffer/channel-map";
import { toContentItem } from "@/lib/content/mappers";
import {
  getAppPublicUrl,
  resolvePublicMediaUrl,
} from "@/lib/content/media-url";
import type { Platform } from "@/lib/types";

export async function buildN8nContentPayload(record: Content) {
  const item = toContentItem(record);
  const appPublicUrl = getAppPublicUrl();
  const bufferTargets = await resolveBufferTargets(
    item.channel,
    item.platforms as Platform[]
  );

  return {
    ...item,
    mediaUrl: resolvePublicMediaUrl(
      item.attachments,
      item.mediaType,
      appPublicUrl
    ),
    bufferTargets,
  };
}
