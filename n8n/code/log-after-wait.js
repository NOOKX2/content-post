// n8n Code node — Run Once for All Items
// Placed after Wait Until Post Time

function log(step, message, data) {
  const suffix =
    data === undefined ? "" : ` ${JSON.stringify(data, null, 2)}`;
  console.log(`[content-approved] ${step} | ${message}${suffix}`);
}

const item = $input.first().json;

log("Wait Until Post Time", "wait finished — resuming workflow", {
  contentId: item.contentId,
  scheduledAt: item.scheduledAt,
  resumeAt: item.resumeAt,
  checkedAt: item.checkedAt,
});

return [{ json: item }];
