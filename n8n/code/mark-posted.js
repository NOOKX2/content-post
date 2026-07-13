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

const results = [];

for (const item of $input.all()) {
  const { contentId, contentCode, platform, bufferPostId } = item.json;

  const apiKey = $env.N8N_API_KEY;
  const url = `http://app:3000/api/content/${contentId}`;
  const requestBody = { status: "posted" };

  log("4/5 Mark Posted", "start PATCH app", {
    contentCode,
    contentId,
    platform,
    bufferPostId,
    url,
    requestBody,
    hasApiKey: Boolean(apiKey),
    note: "If this fails, content stays posting even though Buffer may have posted",
  });

  if (!apiKey) {
    throw new Error("N8N_API_KEY is missing in n8n environment.");
  }

  const startedAt = Date.now();

  try {
    const response = await this.helpers.httpRequest({
      method: "PATCH",
      url,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: requestBody,
    });

    log("4/5 Mark Posted", "SUCCESS — flow complete", {
      contentCode,
      contentId,
      platform,
      bufferPostId,
      durationMs: Date.now() - startedAt,
      response,
      newStatus: response?.status ?? "posted",
    });

    results.push({
      json: {
        ...item.json,
        markPostedResponse: response,
      },
    });
  } catch (error) {
    const detail = extractHttpError(error);

    log("4/5 Mark Posted", "ERROR PATCH failed", {
      contentCode,
      contentId,
      platform,
      bufferPostId,
      durationMs: Date.now() - startedAt,
      ...detail,
      note: "Content likely still shows posting in app UI",
    });

    throw new Error(`Mark Posted HTTP ${detail.status}: ${detail.message}`);
  }
}

return results;
