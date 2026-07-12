// n8n Code node — Run Once for All Items

function log(step, message, data) {
  const suffix =
    data === undefined ? "" : ` ${JSON.stringify(data, null, 2)}`;
  console.log(`[content-approved] ${step} | ${message}${suffix}`);
}

function unwrapContent(raw) {
  if (raw?.body && typeof raw.body === "object" && !Array.isArray(raw.body)) {
    return raw.body;
  }
  return raw;
}

const raw = $input.first().json;
log("1/5 Compute Wait Until", "webhook payload received", {
  topLevelKeys: Object.keys(raw ?? {}),
  hasBody: Boolean(raw?.body),
});

const content = unwrapContent(raw);
const date = content.scheduledDate;
const time = content.scheduledTime || "00:00";

log("1/5 Compute Wait Until", "unwrapped content", {
  contentId: content.contentId,
  id: content.id,
  scheduledDate: date,
  scheduledTime: time,
  channel: content.channel,
  platforms: content.platforms,
});

if (!date) {
  log("1/5 Compute Wait Until", "ERROR missing scheduledDate", { content });
  throw new Error(
    `Content ${content.contentId || content.id || "unknown"} has no scheduledDate`
  );
}

const normalizedTime = time.length === 5 ? `${time}:00` : time;
const scheduledAt = new Date(`${date}T${normalizedTime}+07:00`);
const now = new Date();
const isDue = scheduledAt.getTime() <= now.getTime();

log("1/5 Compute Wait Until", "schedule check", {
  contentId: content.contentId,
  scheduledAt: scheduledAt.toISOString(),
  now: now.toISOString(),
  isDue,
  nextStep: isDue ? "Due Now? → true → Prepare Buffer Posts" : "Due Now? → false → Wait Until Post Time",
});

return [
  {
    json: {
      ...content,
      isDue,
      scheduledAt: scheduledAt.toISOString(),
      resumeAt: scheduledAt.toISOString(),
      checkedAt: now.toISOString(),
    },
  },
];
