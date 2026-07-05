// n8n Code node — Run Once for All Items
// Input: content item(s) from Split Out (field: items)
// Output: one item per platform (e.g. IG + TikTok = 2 items)

const bufferChannels = {
  instagram: $env.BUFFER_IG_CHANNEL_ID,
  tiktok: $env.BUFFER_TIKTOK_CHANNEL_ID,
  facebook: $env.BUFFER_FB_CHANNEL_ID,
};

const appUrl = ($env.APP_PUBLIC_URL || "http://localhost:3001").replace(/\/$/, "");

function toPublicUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${appUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

const results = [];

for (const item of $input.all()) {
  const content = item.json;

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

  for (const platform of content.platforms || []) {
    const channelId = bufferChannels[platform];
    if (!channelId) continue;

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
      throw new Error(
        "BUFFER_API_KEY is missing in n8n environment. Check .env and restart n8n."
      );
    }

    results.push({
      json: {
        contentId: content.id,
        contentCode: content.contentId,
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
  throw new Error(
    "No supported Buffer platforms. Check BUFFER_*_CHANNEL_ID env vars."
  );
}

return results;
