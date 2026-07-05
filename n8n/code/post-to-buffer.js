// n8n Code node — Run Once for All Items
// Input: items from Prepare Buffer Posts (bufferAuth + bufferBody)
// Uses this.helpers.httpRequest (fetch is not available in n8n task runner)

const results = [];

for (const item of $input.all()) {
  const {
    bufferAuth,
    bufferBody,
    contentId,
    contentCode,
    platform,
    channelId,
    mediaUrl,
    caption,
  } = item.json;

  if (!bufferAuth || !bufferBody) {
    throw new Error(
      `Missing bufferAuth/bufferBody for content ${contentId}. Update Prepare Buffer Posts code.`
    );
  }

  let data;
  try {
    data = await this.helpers.httpRequest({
      method: "POST",
      url: "https://api.buffer.com",
      headers: {
        "Content-Type": "application/json",
        Authorization: bufferAuth,
      },
      body: JSON.parse(bufferBody),
    });
  } catch (error) {
    const status = error.statusCode ?? error.httpCode ?? "?";
    const detail =
      typeof error.message === "string"
        ? error.message
        : JSON.stringify(error).slice(0, 300);
    throw new Error(`Buffer HTTP ${status} (${platform}): ${detail}`);
  }

  const postId = data?.data?.createPost?.post?.id;
  const errorMessage = data?.data?.createPost?.message;

  if (!postId && errorMessage) {
    throw new Error(`Buffer mutation error (${platform}): ${errorMessage}`);
  }

  results.push({
    json: {
      contentId,
      contentCode,
      platform,
      channelId,
      mediaUrl,
      caption,
      data,
    },
  });
}

return results;
