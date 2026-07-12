// n8n Code node — Run Once for All Items

function log(step, message, data) {
  const suffix =
    data === undefined ? "" : ` ${JSON.stringify(data, null, 2)}`;
  console.log(`[content-approved] ${step} | ${message}${suffix}`);
}

const results = [];

for (const item of $input.all()) {
  const { contentId, contentCode, platform, bufferPostId } = item.json;

  const apiKey = $env.N8N_API_KEY;
  const url = `http://app:3000/api/content/${contentId}`;

  log("4/4 Mark Posted", "start PATCH", {
    contentCode,
    contentId,
    platform,
    bufferPostId,
    url,
    hasApiKey: Boolean(apiKey),
  });

  if (!apiKey) {
    throw new Error("N8N_API_KEY is missing in n8n environment.");
  }

  try {
    const response = await this.helpers.httpRequest({
      method: "PATCH",
      url,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: { status: "posted" },
    });

    log("4/4 Mark Posted", "SUCCESS — flow complete", {
      contentCode,
      contentId,
      platform,
      bufferPostId,
      newStatus: response?.status ?? "posted",
    });

    results.push({
      json: {
        ...item.json,
        markPostedResponse: response,
      },
    });
  } catch (error) {
    const status = error.statusCode ?? error.httpCode ?? "?";
    const detail =
      typeof error.message === "string"
        ? error.message
        : JSON.stringify(error).slice(0, 300);

    log("4/4 Mark Posted", "ERROR PATCH failed", {
      contentCode,
      contentId,
      status,
      detail,
    });

    throw new Error(`Mark Posted HTTP ${status}: ${detail}`);
  }
}

return results;
