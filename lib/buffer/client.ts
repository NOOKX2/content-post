type BufferGraphqlResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

export async function bufferGraphql<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const apiKey = process.env.BUFFER_API_KEY;
  if (!apiKey) {
    throw new Error("BUFFER_API_KEY is not configured");
  }

  const response = await fetch("https://api.buffer.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Buffer API error: HTTP ${response.status}`);
  }

  const json = (await response.json()) as BufferGraphqlResponse<T>;
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join(", "));
  }

  if (!json.data) {
    throw new Error("Buffer API returned empty data");
  }

  return json.data;
}

export function getBufferChannelIdsForPlatform(
  platform?: string
): string[] | undefined {
  const mapping: Record<string, string | undefined> = {
    instagram: process.env.BUFFER_IG_CHANNEL_ID,
    tiktok: process.env.BUFFER_TIKTOK_CHANNEL_ID,
    facebook: process.env.BUFFER_FB_CHANNEL_ID,
  };

  if (!platform || platform === "all") {
    return Object.values(mapping).filter((id): id is string => Boolean(id));
  }

  const channelId = mapping[platform];
  return channelId ? [channelId] : [];
}

export function isBufferConfigured(): boolean {
  return Boolean(
    process.env.BUFFER_API_KEY &&
      process.env.BUFFER_ORG_ID &&
      getBufferChannelIdsForPlatform()?.length
  );
}
