// n8n Code node — Run Once for All Items

function log(step, message, data) {
  const suffix =
    data === undefined ? "" : ` ${JSON.stringify(data, null, 2)}`;
  console.log(`[content-approved] ${step} | ${message}${suffix}`);
}

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

  log("3/4 Post to Buffer", "start", {
    contentCode,
    contentId,
    platform,
    channelId,
  });

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
    log("3/4 Post to Buffer", "ERROR HTTP request failed", {
      contentCode,
      platform,
      status,
      detail,
    });
    throw new Error(`Buffer HTTP ${status} (${platform}): ${detail}`);
  }

  const bufferPostId = data?.data?.createPost?.post?.id;
  const errorMessage = data?.data?.createPost?.message;

  log("3/4 Post to Buffer", "Buffer response", {
    contentCode,
    platform,
    bufferPostId: bufferPostId ?? null,
    errorMessage: errorMessage ?? null,
  });

  if (!bufferPostId && errorMessage) {
    throw new Error(`Buffer mutation error (${platform}): ${errorMessage}`);
  }

  if (!bufferPostId) {
    throw new Error(
      `Buffer returned no post id for ${contentCode} (${platform}). Response: ${JSON.stringify(data).slice(0, 500)}`
    );
  }

  log("3/4 Post to Buffer", "success", { contentCode, platform, bufferPostId });

  results.push({
    json: {
      contentId,
      contentCode,
      platform,
      channelId,
      mediaUrl,
      caption,
      bufferPostId,
      data,
    },
  });
}

return results;
