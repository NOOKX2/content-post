// n8n Code node — Run Once for All Items

function log(step, message, data) {
  const suffix =
    data === undefined ? "" : ` ${JSON.stringify(data, null, 2)}`;
  console.log(`[content-approved] ${step} | ${message}${suffix}`);
}

const legacyBufferChannels = {
  instagram: $env.BUFFER_IG_CHANNEL_ID,
  tiktok: $env.BUFFER_TIKTOK_CHANNEL_ID,
  facebook: $env.BUFFER_FB_CHANNEL_ID,
  youtube: $env.BUFFER_YOUTUBE_CHANNEL_ID,
};

const appUrl = ($env.APP_PUBLIC_URL || "http://localhost:3001").replace(/\/$/, "");

function toPublicUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${appUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

function resolveTargets(content) {
  if (Array.isArray(content.bufferTargets) && content.bufferTargets.length > 0) {
    return content.bufferTargets;
  }

  return (content.platforms || [])
    .map((platform) => ({
      platform,
      bufferChannelId: legacyBufferChannels[platform],
    }))
    .filter((target) => Boolean(target.bufferChannelId));
}

const results = [];

for (const item of $input.all()) {
  const content = item.json;

  log("2/5 Prepare Buffer Posts", "start", {
    contentId: content.contentId,
    id: content.id,
    channel: content.channel,
    isDue: content.isDue,
    checkedAt: content.checkedAt,
  });

  const captionParts = [content.name, content.details];
  if (content.tags?.length) {
    captionParts.push(
      content.tags.map((tag) => `#${String(tag).replace(/^#/, "")}`).join(" ")
    );
  }
  const text = captionParts.filter(Boolean).join("\n\n");

  const mediaUrl =
    toPublicUrl(content.mediaUrl) ||
    (content.attachments || []).map(toPublicUrl).find(Boolean);

  if (!mediaUrl) {
    log("2/5 Prepare Buffer Posts", "ERROR no media URL", {
      contentId: content.contentId,
      attachments: content.attachments,
    });
    throw new Error(
      `Content ${content.id} (${content.contentId}) has no media URL`
    );
  }

  const videoExt = /\.(mp4|mov|webm|m4v)$/i;
  const assetKey = videoExt.test(mediaUrl.split("?")[0]) ? "video" : "image";

  function instagramMetadata() {
    if (assetKey === "video") {
      return "metadata: { instagram: { type: reel } }";
    }
    return "metadata: { instagram: { type: post, shouldShareToFeed: true } }";
  }

  const targets = resolveTargets(content);
  if (targets.length === 0) {
    log("2/5 Prepare Buffer Posts", "ERROR no buffer targets", {
      contentId: content.contentId,
      channel: content.channel,
      platforms: content.platforms,
      bufferTargets: content.bufferTargets,
    });
    throw new Error(
      `No Buffer channel mapping for content ${content.contentId} (ช่องที่ลง: ${content.channel || "ไม่ระบุ"}). ตั้งค่า BUFFER_CHANNEL_MAP ใน .env`
    );
  }

  log("2/5 Prepare Buffer Posts", "resolved targets", {
    contentId: content.contentId,
    assetKey,
    mediaUrl,
    targetCount: targets.length,
    targets: targets.map(({ platform, bufferChannelId }) => ({
      platform,
      bufferChannelId,
    })),
  });

  for (const { platform, bufferChannelId: channelId } of targets) {
    const instagramLine =
      platform === "instagram" ? `\n    ${instagramMetadata()}` : "";

    const query = `mutation CreatePost {
  createPost(input: {
    channelId: ${JSON.stringify(channelId)}
    text: ${JSON.stringify(text)}
    schedulingType: automatic
    mode: shareNow
    assets: [{ ${assetKey}: { url: ${JSON.stringify(mediaUrl)} } }]${instagramLine}
  }) {
    ... on PostActionSuccess {
      post { id }
    }
    ... on MutationError {
      message
    }
  }
}`;

    const bufferApiKey = $env.BUFFER_API_KEY;
    if (!bufferApiKey) {
      log("2/5 Prepare Buffer Posts", "ERROR BUFFER_API_KEY missing", {
        contentId: content.contentId,
      });
      throw new Error(
        "BUFFER_API_KEY is missing in n8n environment. Check .env and restart n8n."
      );
    }

    results.push({
      json: {
        contentId: content.id,
        contentCode: content.contentId,
        contentChannel: content.channel,
        platform,
        channelId,
        mediaUrl,
        caption: text,
        graphqlQuery: query,
        bufferBody: JSON.stringify({ query }),
        bufferAuth: `Bearer ${bufferApiKey}`,
      },
    });
  }
}

if (results.length === 0) {
  log("2/5 Prepare Buffer Posts", "ERROR no results", {});
  throw new Error(
    "No supported Buffer platforms. Check BUFFER_CHANNEL_MAP or BUFFER_*_CHANNEL_ID env vars."
  );
}

log("2/5 Prepare Buffer Posts", "done", {
  contentId: results[0]?.json?.contentCode,
  itemCount: results.length,
});

return results;
