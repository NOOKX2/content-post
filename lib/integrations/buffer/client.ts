type BufferGraphqlResponse<T> = {
  data?: T;
  errors?: { message: string; extensions?: { code?: string; window?: string } }[];
};

type RateLimitState = {
  untilMs: number;
  window: string;
  message: string;
};

let rateLimitState: RateLimitState | null = null;

function parseRateLimitWindow(body: string): string {
  try {
    const json = JSON.parse(body) as BufferGraphqlResponse<unknown>;
    return json.errors?.[0]?.extensions?.window ?? "";
  } catch {
    return "";
  }
}

function cooldownMsForWindow(window: string): number {
  if (window === "24h") return 30 * 60 * 1000;
  if (window === "15m") return 15 * 60 * 1000;
  return 5 * 60 * 1000;
}

function rateLimitError(state: RateLimitState): Error {
  const minutesLeft = Math.max(
    1,
    Math.ceil((state.untilMs - Date.now()) / 60_000)
  );
  return new Error(
    `Buffer API error: HTTP 429 (${state.window || "unknown"} quota exceeded, retry in ~${minutesLeft}m)`
  );
}

function rememberRateLimit(body: string) {
  const window = parseRateLimitWindow(body) || "15m";
  rateLimitState = {
    untilMs: Date.now() + cooldownMsForWindow(window),
    window,
    message: body.slice(0, 300),
  };
  console.error("[buffer] rate limit cooldown started", {
    window,
    cooldownMinutes: cooldownMsForWindow(window) / 60_000,
    until: new Date(rateLimitState.untilMs).toISOString(),
  });
}

export async function bufferGraphql<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const apiKey = process.env.BUFFER_API_KEY;
  if (!apiKey) {
    throw new Error("BUFFER_API_KEY is not configured");
  }

  if (rateLimitState && Date.now() < rateLimitState.untilMs) {
    throw rateLimitError(rateLimitState);
  }
  rateLimitState = null;

  const response = await fetch("https://api.buffer.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 },
  });

  if (response.status === 429) {
    const body = await response.text().catch(() => "");
    console.error("[buffer] rate limited (HTTP 429)", {
      body: body.slice(0, 500),
      variables,
    });
    rememberRateLimit(body);
    throw rateLimitError(rateLimitState!);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("[buffer] HTTP error", {
      status: response.status,
      body: body.slice(0, 500),
      variables,
    });
    throw new Error(`Buffer API error: HTTP ${response.status}`);
  }

  const json = (await response.json()) as BufferGraphqlResponse<T>;
  if (json.errors?.length) {
    const isRateLimit = json.errors.some(
      (error) => error.extensions?.code === "RATE_LIMIT_EXCEEDED"
    );
    console.error("[buffer] GraphQL errors", {
      errors: json.errors,
      variables,
    });
    if (isRateLimit) {
      rememberRateLimit(JSON.stringify(json));
      throw rateLimitError(rateLimitState!);
    }
    throw new Error(json.errors.map((e) => e.message).join(", "));
  }

  if (!json.data) {
    console.error("[buffer] empty GraphQL data", { variables });
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
