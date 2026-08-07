import type { Content } from "@prisma/client";
import { parsePostingTargets } from "@/lib/integrations/buffer/posting-targets";
import { resolveBufferTargets } from "@/lib/integrations/buffer/channel-map";
import { toContentItem } from "@/lib/content/data/mappers";
import {
  getAppPublicUrl,
  resolvePublicMediaUrl,
} from "@/lib/content/domain/media-url";
import type { Platform } from "@/lib/types";

export async function buildN8nContentPayload(record: Content) {
  const item = toContentItem(record);
  const appPublicUrl = getAppPublicUrl();
  const postingTargets = parsePostingTargets(record.postingTargets);
  const bufferTargets =
    postingTargets.length > 0
      ? postingTargets.map((target) => ({
          platform: target.platform,
          bufferChannelId: target.bufferChannelId,
        }))
      : await resolveBufferTargets(
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
      `Content ${item.contentId} เป็นวิดีโอแต่ไม่มีลิงก์หรือไฟล์วิดีโอใน attachments`
    );
  }

  return {
    ...item,
    mediaUrl,
    bufferTargets,
  };
}
