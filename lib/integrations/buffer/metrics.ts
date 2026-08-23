import {
  bufferGraphql,
  fetchAccessibleBufferChannels,
  getBufferChannelIdsForPlatform,
  isBufferConfigured,
} from "@/lib/integrations/buffer/client";
import { readBufferEnv } from "@/lib/integrations/buffer/env";
import type {
  SocialAnalyticsDebug,
  SocialAnalyticsResponse,
  SocialMetricSummary,
  SocialPostMetric,
} from "@/lib/dashboard/types";

type PostMetric = {
  type: string;
  name: string;
  value: number;
  unit: string;
};

type BufferPost = {
  id: string;
  text: string;
  sentAt: string | null;
  channelService: string;
  metrics: PostMetric[] | null;
};

function metricValue(metrics: PostMetric[] | null | undefined, type: string) {
  return metrics?.find((m) => m.type === type)?.value ?? 0;
}

function buildSummary(metrics: PostMetric[]): SocialMetricSummary {
  const get = (type: string) =>
    metrics.find((m) => m.type === type)?.value ?? 0;

  const impressions = get("impressions") || get("views");
  const clicks = get("clicks");
  const reach = get("reach");
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : get("ctr");

  return {
    reach,
    views: get("views") || impressions,
    impressions,
    engagementRate: get("engagementRate"),
    ctr,
    reactions: get("reactions"),
    comments: get("comments"),
    shares: get("shares") || get("reposts"),
    postCount: get("postCount"),
  };
}

function toPostMetric(post: BufferPost): SocialPostMetric {
  const reach = metricValue(post.metrics, "reach");
  const impressions =
    metricValue(post.metrics, "impressions") ||
    metricValue(post.metrics, "views");
  const views = metricValue(post.metrics, "views") || impressions;
  const clicks = metricValue(post.metrics, "clicks");
  const reactions = metricValue(post.metrics, "reactions");
  const comments = metricValue(post.metrics, "comments");
  const shares =
    metricValue(post.metrics, "shares") || metricValue(post.metrics, "reposts");
  const engagementRate = metricValue(post.metrics, "engagementRate");
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const score = reactions + comments + shares + engagementRate;

  return {
    id: post.id,
    text: post.text,
    channelService: post.channelService,
    sentAt: post.sentAt,
    reach,
    views,
    impressions,
    engagementRate,
    ctr,
    reactions,
    comments,
    shares,
    score,
  };
}

async function fetchAggregatedMetrics(
  organizationId: string,
  startDateTime: string,
  endDateTime: string,
  channelIds?: string[]
): Promise<SocialMetricSummary> {
  const data = await bufferGraphql<{
    aggregatedPostMetrics: { metrics: PostMetric[] };
  }>(
    `query AggregatePostMetrics($input: AggregatedPostMetricsInput!) {
      aggregatedPostMetrics(input: $input) {
        metrics { type name value unit }
      }
    }`,
    {
      input: {
        organizationId,
        startDateTime,
        endDateTime,
        channelIds: channelIds?.length ? channelIds : null,
      },
    }
  );

  return buildSummary(data.aggregatedPostMetrics.metrics);
}

type PostsQueryResult = {
  posts: {
    edges: { node: BufferPost; cursor: string }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

function isActorChannelAccessError(error: unknown) {
  return (
    error instanceof Error &&
    /Actor can not access the specified channels/i.test(error.message)
  );
}

function isRateLimitError(error: unknown) {
  return (
    error instanceof Error && /Buffer API error: HTTP 429/i.test(error.message)
  );
}

function emptyAnalytics(
  partial: Pick<SocialAnalyticsResponse, "configured" | "error" | "debug">
): SocialAnalyticsResponse {
  return {
    summary: emptySummary(),
    popularPosts: [],
    unpopularPosts: [],
    comparison: [],
    platformBreakdown: [],
    trend: [],
    ...partial,
  };
}

function logSocialError(message: string, details: Record<string, unknown>) {
  console.error(`[dashboard/social] ${message}`, details);
}

function formatAnalyticsError(debug: SocialAnalyticsDebug): string {
  if (debug.rateLimited) {
    return (
      "ดึงข้อมูล Buffer ไม่สำเร็จ — โควต้า Buffer API เต็มแล้ว (HTTP 429). " +
      "ตอนนี้ติดโควต้า 24 ชั่วโมง ไม่ใช่ช่องพัง — อย่ารีเฟรชซ้ำ จะยิ่งถูกบล็อกต่อ. " +
      `(${debug.bufferMessage ?? "HTTP 429"})`
    );
  }

  const parts: string[] = ["ดึงข้อมูล Buffer ไม่สำเร็จ"];

  if (debug.missingFromBuffer.length) {
    parts.push(
      `ช่องที่ไม่มีใน Buffer ListChannels: ${debug.missingFromBuffer.join(", ")}`
    );
  }
  if (debug.postsAccessDenied.length) {
    parts.push(
      `ช่องที่ Buffer ปฏิเสธสิทธิ์ posts (Actor access denied): ${debug.postsAccessDenied.join(", ")}`
    );
  }
  if (debug.bufferMessage) {
    parts.push(`Buffer: ${debug.bufferMessage}`);
  }
  if (debug.missingFromBuffer.length || debug.postsAccessDenied.length) {
    parts.push(
      "แก้ที่ตาราง PostingChannelPlatform หรือ reconnect ช่องใน Buffer แล้วอัปเดต bufferChannelId"
    );
  }

  return parts.join(" — ");
}

async function fetchPostsWithMetrics(
  organizationId: string,
  startDate: string,
  endDate: string,
  channelIds?: string[]
): Promise<SocialPostMetric[]> {
  const posts: BufferPost[] = [];
  let after: string | null = null;
  let hasNextPage = true;

  while (hasNextPage && posts.length < 100) {
    const data: PostsQueryResult = await bufferGraphql<PostsQueryResult>(
      `query PostsWithMetrics($input: PostsInput!, $first: Int, $after: String) {
        posts(input: $input, first: $first, after: $after) {
          edges {
            cursor
            node {
              id
              text
              sentAt
              channelService
              metrics { type name value unit }
            }
          }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      {
        input: {
          organizationId,
          filter: {
            channelIds: channelIds?.length ? channelIds : undefined,
            startDate: `${startDate}T00:00:00Z`,
            endDate: `${endDate}T23:59:59Z`,
            status: ["sent"],
          },
          sort: [{ field: "dueAt", direction: "desc" }],
        },
        first: 25,
        after,
      }
    );

    for (const edge of data.posts.edges) {
      if (edge.node.metrics?.length) {
        posts.push(edge.node);
      }
    }

    hasNextPage = data.posts.pageInfo.hasNextPage;
    after = data.posts.pageInfo.endCursor;
  }

  return posts.map(toPostMetric);
}

function buildTrend(posts: SocialPostMetric[]) {
  const buckets = new Map<string, { engagement: number; reach: number }>();

  for (const post of posts) {
    if (!post.sentAt) continue;
    const date = post.sentAt.slice(0, 10);
    const bucket = buckets.get(date) ?? { engagement: 0, reach: 0 };
    bucket.engagement += post.reactions + post.comments + post.shares;
    bucket.reach += post.reach;
    buckets.set(date, bucket);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({ date, ...values }));
}

export async function fetchSocialAnalytics(options: {
  startDate: string;
  endDate: string;
  platform?: string;
}): Promise<SocialAnalyticsResponse> {
  if (!isBufferConfigured()) {
    return emptyAnalytics({
      configured: false,
      error: "ยังไม่ได้ตั้งค่า Buffer API",
    });
  }

  const organizationId = readBufferEnv("BUFFER_ORG_ID");
  const mappedChannelIds =
    (await getBufferChannelIdsForPlatform(options.platform)) ?? [];
  const { startDateTime, endDateTime } = {
    startDateTime: `${options.startDate}T00:00:00Z`,
    endDateTime: `${options.endDate}T23:59:59Z`,
  };

  let missingFromBuffer: string[] = [];
  let channelIds = mappedChannelIds.length ? mappedChannelIds : undefined;

  try {
    // One ListChannels call only — do NOT probe posts per channel (causes HTTP 429).
    if (mappedChannelIds.length) {
      const accessible = await fetchAccessibleBufferChannels(organizationId);
      const accessibleIds = new Set(
        accessible
          .filter((channel) => !channel.isDisconnected)
          .map((channel) => channel.id)
      );
      missingFromBuffer = mappedChannelIds.filter(
        (id) => !accessibleIds.has(id)
      );

      if (missingFromBuffer.length) {
        const debug: SocialAnalyticsDebug = {
          organizationId,
          mappedChannelIds,
          missingFromBuffer,
          postsAccessDenied: [],
          bufferMessage: "mapped channel id not returned by ListChannels",
        };
        logSocialError("mapped channels missing from Buffer", {
          ...debug,
          accessibleChannelIds: [...accessibleIds],
          accessibleChannels: accessible,
          platform: options.platform ?? "all",
        });
        return emptyAnalytics({
          configured: true,
          error: formatAnalyticsError(debug),
          debug,
        });
      }

      channelIds = mappedChannelIds;
    }

    const [summary, posts] = await Promise.all([
      fetchAggregatedMetrics(
        organizationId,
        startDateTime,
        endDateTime,
        channelIds
      ),
      fetchPostsWithMetrics(
        organizationId,
        options.startDate,
        options.endDate,
        channelIds
      ),
    ]);

    const sorted = [...posts].sort((a, b) => b.score - a.score);
    const popularPosts = sorted.slice(0, 5);
    const unpopularPosts = [...sorted].reverse().slice(0, 5);

    const comparison = sorted.slice(0, 8).map((post) => {
      const text = post.text.replace(/\s+/g, " ").trim() || "โพสต์";
      return {
        label: text.length > 14 ? `${text.slice(0, 14)}...` : text,
        engagement: post.reactions + post.comments + post.shares,
        reach: post.reach,
        views: post.views,
      };
    });

    const PLATFORM_COLORS: Record<string, string> = {
      instagram: "#ec4899",
      tiktok: "#111827",
      facebook: "#3b82f6",
      youtube: "#ef4444",
      twitter: "#22d3ee",
      x: "#22d3ee",
      linkedin: "#0ea5e9",
    };

    const platformMap = new Map<string, number>();
    for (const post of posts) {
      const key = (post.channelService || "other").toLowerCase();
      platformMap.set(key, (platformMap.get(key) ?? 0) + (post.reach || post.views || 1));
    }
    const platformBreakdown = [...platformMap.entries()]
      .map(([label, value]) => ({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        value,
        color: PLATFORM_COLORS[label] ?? "#94a3b8",
      }))
      .sort((a, b) => b.value - a.value);

    return {
      summary,
      popularPosts,
      unpopularPosts,
      comparison,
      platformBreakdown,
      trend: buildTrend(posts),
      configured: true,
    };
  } catch (error) {
    const bufferMessage =
      error instanceof Error ? error.message : "ไม่สามารถดึงข้อมูล Buffer ได้";

    const debug: SocialAnalyticsDebug = {
      organizationId,
      mappedChannelIds,
      missingFromBuffer,
      postsAccessDenied: isActorChannelAccessError(error)
        ? (channelIds ?? mappedChannelIds)
        : [],
      rateLimited: isRateLimitError(error),
      bufferMessage,
    };

    logSocialError("social analytics fetch failed", {
      ...debug,
      platform: options.platform ?? "all",
      startDate: options.startDate,
      endDate: options.endDate,
      error: bufferMessage,
    });

    return emptyAnalytics({
      configured: true,
      error: formatAnalyticsError(debug),
      debug,
    });
  }
}

function emptySummary(): SocialMetricSummary {
  return {
    reach: 0,
    views: 0,
    impressions: 0,
    engagementRate: 0,
    ctr: 0,
    reactions: 0,
    comments: 0,
    shares: 0,
    postCount: 0,
  };
}
