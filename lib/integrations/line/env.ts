function stripWrappingQuotes(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function readLineEnv(name: string): string {
  return stripWrappingQuotes(process.env[name] ?? "");
}

export function getLineChannelAccessToken(): string {
  return readLineEnv("LINE_CHANNEL_ACCESS_TOKEN");
}

export function getLineChannelSecret(): string {
  return readLineEnv("LINE_CHANNEL_SECRET");
}

export function getLineGroupId(): string {
  return readLineEnv("LINE_GROUP_ID");
}

export function isLineMessagingConfigured(): boolean {
  return Boolean(getLineChannelAccessToken());
}

export function getAppPublicUrl(): string {
  return (
    process.env.APP_PUBLIC_URL ||
    process.env.AUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}
