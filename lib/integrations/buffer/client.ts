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

import { getAllMappedBufferChannelIds } from "@/lib/integrations/buffer/channel-map";

export async function getBufferChannelIdsForPlatform(
  platform?: string,
  contentChannel?: string
): Promise<string[] | undefined> {
  const ids = await getAllMappedBufferChannelIds(contentChannel, platform);
  return ids.length > 0 ? ids : undefined;
}

type BufferChannel = {
  id: string;
  name: string;
  service: string;
  isDisconnected: boolean;
};

export async function fetchAccessibleBufferChannels(
  organizationId: string
): Promise<BufferChannel[]> {
  const data = await bufferGraphql<{ channels: BufferChannel[] }>(
    `query ListChannels($input: ChannelsInput!) {
      channels(input: $input) {
        id
        name
        service
        isDisconnected
      }
    }`,
    { input: { organizationId } }
  );

  return data.channels ?? [];
}

export function isBufferConfigured(): boolean {
  return Boolean(process.env.BUFFER_API_KEY && process.env.BUFFER_ORG_ID);
}
