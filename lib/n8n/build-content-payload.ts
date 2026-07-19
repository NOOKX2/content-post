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

  const mediaUrl = resolvePublicMediaUrl(
    item.attachments,
    item.mediaType,
    appPublicUrl
  );

  if (item.mediaType === "video" && !mediaUrl) {
    throw new Error(
      `Content ${item.contentId} เป็นวิดีโอแต่ไม่มีไฟล์ .mp4/.mov/.webm ใน attachments`
    );
  }

  return {
    ...item,
    mediaUrl,
    bufferTargets,
  };
}
