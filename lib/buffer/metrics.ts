import {
  bufferGraphql,
  fetchAccessibleBufferChannels,
  getBufferChannelIdsForPlatform,
  isBufferConfigured,
} from "@/lib/buffer/client";
import type {
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
    return {
      summary: emptySummary(),
      popularPosts: [],
      unpopularPosts: [],
      comparison: [],
      trend: [],
      configured: false,
      error: "ยังไม่ได้ตั้งค่า Buffer API",
    };
  }

  const organizationId = process.env.BUFFER_ORG_ID!;
  const mappedChannelIds = await getBufferChannelIdsForPlatform(
    options.platform
  );
  const { startDateTime, endDateTime } = {
    startDateTime: `${options.startDate}T00:00:00Z`,
    endDateTime: `${options.endDate}T23:59:59Z`,
  };

  try {
    // Buffer rejects the whole query if any channelId is inaccessible
    // (e.g. a channel that was reconnected/removed and now has a new id).
    // Keep only channels the current token can actually access.
    let channelIds = mappedChannelIds;
    if (mappedChannelIds?.length) {
      const accessible = await fetchAccessibleBufferChannels(organizationId);
      const accessibleIds = new Set(
        accessible
          .filter((channel) => !channel.isDisconnected)
          .map((channel) => channel.id)
      );
      const usable = mappedChannelIds.filter((id) => accessibleIds.has(id));
      const skipped = mappedChannelIds.filter((id) => !accessibleIds.has(id));

      if (skipped.length) {
        console.warn(
          "[dashboard/social] skipping inaccessible Buffer channels",
          {
            skipped,
            usable,
            hint: "Update or remove stale channel mapping in /admin/channels",
          }
        );
      }

      if (usable.length === 0) {
        return {
          summary: emptySummary(),
          popularPosts: [],
          unpopularPosts: [],
          comparison: [],
          trend: [],
          configured: true,
          error:
            "Buffer channel ที่ตั้งค่าไว้เข้าถึงไม่ได้ (อาจถูก reconnect หรือเปลี่ยนบัญชี) — อัปเดตการแมปช่องที่ /admin/channels",
        };
      }

      channelIds = usable;
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

    const comparison = sorted.slice(0, 8).map((post, index) => ({
      label: `โพสต์ ${index + 1}`,
      engagement: post.reactions + post.comments + post.shares,
      reach: post.reach,
    }));

    return {
      summary,
      popularPosts,
      unpopularPosts,
      comparison,
      trend: buildTrend(posts),
      configured: true,
    };
  } catch (error) {
    return {
      summary: emptySummary(),
      popularPosts: [],
      unpopularPosts: [],
      comparison: [],
      trend: [],
      configured: true,
      error:
        error instanceof Error ? error.message : "ไม่สามารถดึงข้อมูล Buffer ได้",
    };
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
