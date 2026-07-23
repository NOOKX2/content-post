// n8n Code node — Run Once for All Items
// Reports post failure to the app before the workflow errors out.

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

async function reportPostFailed({
  contentId,
  contentCode,
  step,
  postError,
  details,
}) {
  const apiKey = $env.N8N_API_KEY;
  const appUrl = ($env.APP_PUBLIC_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
  const url = `${appUrl}/api/content/${contentId}`;
  const requestBody = {
    status: "post_failed",
    postError: postError.slice(0, 4000),
  };

  log("Mark Post Failed", "start PATCH app", {
    contentCode,
    contentId,
    step,
    url,
    requestBody,
    hasApiKey: Boolean(apiKey),
    details: details ?? null,
  });

  if (!apiKey) {
    log("Mark Post Failed", "WARN N8N_API_KEY missing — cannot update app", {
      contentCode,
      contentId,
      step,
      postError,
    });
    return { ok: false, reason: "missing_api_key" };
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

    log("Mark Post Failed", "SUCCESS — status is now post_failed", {
      contentCode,
      contentId,
      step,
      durationMs: Date.now() - startedAt,
      response,
      postError,
      hint: "Check app UI tab โพสต์ไม่สำเร็จ and [content-pipeline] logs",
    });

    return { ok: true, response };
  } catch (error) {
    const detail = extractHttpError(error);

    log("Mark Post Failed", "ERROR PATCH failed", {
      contentCode,
      contentId,
      step,
      durationMs: Date.now() - startedAt,
      postError,
      ...detail,
    });

    return { ok: false, reason: "patch_failed", detail };
  }
}

const item = $input.first().json;
const contentId = item.id ?? item.contentId;
const contentCode = item.contentId ?? item.contentCode ?? contentId;
const step = item.failureStep ?? item.step ?? "unknown";
const postError =
  item.postError ??
  item.errorMessage ??
  item.error ??
  "โพสต์ไม่สำเร็จ (ไม่มีรายละเอียด)";

await reportPostFailed.call(this, {
  contentId,
  contentCode,
  step,
  postError: String(postError),
  details: item.failureDetails ?? null,
});

return [{ json: { ...item, reportedPostFailed: true } }];
