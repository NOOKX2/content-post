// n8n Code node — Run Once for All Items

function log(step, message, data) {
  const suffix =
    data === undefined ? "" : ` ${JSON.stringify(data, null, 2)}`;
  console.log(`[content-approved] ${step} | ${message}${suffix}`);
}

function extractHttpError(error) {
  const status = error.statusCode ?? error.httpCode ?? "?";
  const responseBody =
    error.response?.body ??
    error.response?.data ??
    error.body ??
    error.cause?.response?.body ??
    null;

  return {
    status,
    message:
      typeof error.message === "string"
        ? error.message
        : JSON.stringify(error).slice(0, 500),
    responseBody,
    errorKeys: Object.keys(error ?? {}),
  };
}

function isAlreadyOnBufferError(message) {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("already got this") ||
    lower.includes("already scheduled or posted") ||
    lower.includes("not able to post the same thing twice")
  );
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
    graphqlQuery,
  } = item.json;

  log("3/5 Post to Buffer", "start", {
    contentCode,
    contentId,
    platform,
    channelId,
    mediaUrl,
    captionPreview: caption?.slice(0, 120) ?? null,
    graphqlQuery: graphqlQuery ?? JSON.parse(bufferBody || "{}").query ?? null,
    hasBufferAuth: Boolean(bufferAuth),
  });

  if (!bufferAuth || !bufferBody) {
    log("3/5 Post to Buffer", "ERROR missing buffer request fields", {
      contentCode,
      contentId,
      platform,
      hasBufferAuth: Boolean(bufferAuth),
      hasBufferBody: Boolean(bufferBody),
    });
    throw new Error(
      `Missing bufferAuth/bufferBody for content ${contentId}. Update Prepare Buffer Posts code.`
    );
  }

  const startedAt = Date.now();
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
    const detail = extractHttpError(error);
    log("3/5 Post to Buffer", "ERROR HTTP request failed", {
      contentCode,
      contentId,
      platform,
      durationMs: Date.now() - startedAt,
      ...detail,
      graphqlQuery: graphqlQuery ?? JSON.parse(bufferBody).query,
    });
    throw new Error(
      `Buffer HTTP ${detail.status} (${platform}): ${detail.message}`
    );
  }

  log("3/5 Post to Buffer", "raw Buffer response", {
    contentCode,
    platform,
    durationMs: Date.now() - startedAt,
    response: data,
  });

  const bufferPostId = data?.data?.createPost?.post?.id;
  const errorMessage = data?.data?.createPost?.message;
  const typename = data?.data?.createPost?.__typename;

  log("3/5 Post to Buffer", "parsed Buffer response", {
    contentCode,
    platform,
    bufferPostId: bufferPostId ?? null,
    errorMessage: errorMessage ?? null,
    typename: typename ?? null,
  });

  if (!bufferPostId && errorMessage) {
    if (isAlreadyOnBufferError(errorMessage)) {
      log("3/5 Post to Buffer", "WARN duplicate on Buffer — treating as success", {
        contentCode,
        platform,
        errorMessage,
        note: "Post likely already queued from a prior attempt; will Mark Posted",
      });

      results.push({
        json: {
          contentId,
          contentCode,
          platform,
          channelId,
          mediaUrl,
          caption,
          bufferPostId: "already-on-buffer",
          duplicateSkipped: true,
          data,
        },
      });
      continue;
    }

    log("3/5 Post to Buffer", "ERROR Buffer mutation rejected", {
      contentCode,
      platform,
      errorMessage,
      fullResponse: data,
    });
    throw new Error(`Buffer mutation error (${platform}): ${errorMessage}`);
  }

  if (!bufferPostId) {
    log("3/5 Post to Buffer", "ERROR Buffer returned no post id", {
      contentCode,
      platform,
      fullResponse: data,
    });
    throw new Error(
      `Buffer returned no post id for ${contentCode} (${platform}). Response: ${JSON.stringify(data).slice(0, 500)}`
    );
  }

  log("3/5 Post to Buffer", "success", {
    contentCode,
    platform,
    bufferPostId,
    durationMs: Date.now() - startedAt,
  });

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
