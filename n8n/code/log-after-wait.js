// n8n Code node — Run Once for All Items
// Placed after Wait Until Post Time

function log(step, message, data) {
  const suffix =
    data === undefined ? "" : ` ${JSON.stringify(data, null, 2)}`;
  console.log(`[content-approved] ${step} | ${message}${suffix}`);
}

const item = $input.first().json;
const now = new Date();
const scheduledAt = item.scheduledAt ? new Date(item.scheduledAt) : null;
const isDueNow = scheduledAt ? scheduledAt.getTime() <= now.getTime() : null;

log("Wait Until Post Time", "wait finished — resuming workflow", {
  contentId: item.contentId,
  contentCode: item.contentCode ?? item.contentId,
  scheduledAt: item.scheduledAt,
  resumeAt: item.resumeAt,
  checkedAt: item.checkedAt,
  now: now.toISOString(),
  isDueNow,
  msUntilDue: scheduledAt ? scheduledAt.getTime() - now.getTime() : null,
});

return [{ json: item }];
