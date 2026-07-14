// n8n Code node — Run Once for All Items
// Runs right before Prepare Buffer Posts (after wait or when due immediately)

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

const item = $input.first().json;
const contentId = item.id;
const contentCode = item.contentId;

const apiKey = $env.N8N_API_KEY;
const appUrl = ($env.APP_PUBLIC_URL || "http://localhost:3001").replace(
  /\/$/,
  ""
);
const url = `${appUrl}/api/content/${contentId}`;
const requestBody = { status: "posting" };

log("3/5 Mark Posting", "start PATCH app", {
  contentCode,
  contentId,
  url,
  requestBody,
  hasApiKey: Boolean(apiKey),
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

  log("3/5 Mark Posting", "SUCCESS — status is now posting", {
    contentCode,
    contentId,
    durationMs: Date.now() - startedAt,
    response,
    newStatus: response?.status ?? "posting",
  });

  return [{ json: item }];
  } catch (error) {
    const detail = extractHttpError(error);

    log("3/5 Mark Posting", "ERROR PATCH failed", {
      contentCode,
      contentId,
      url,
      durationMs: Date.now() - startedAt,
      ...detail,
    });

    const bodyHint =
      detail.responseBody === null || detail.responseBody === undefined
        ? ""
        : ` body=${typeof detail.responseBody === "string" ? detail.responseBody : JSON.stringify(detail.responseBody)}`;

    throw new Error(
      `Mark Posting HTTP ${detail.status}: ${detail.message}${bodyHint}`
    );
  }
