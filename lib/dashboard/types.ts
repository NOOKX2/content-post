import type { MediaType, Platform } from "@/lib/types";

export type DashboardPeriod = "7d" | "30d" | "90d" | "year" | "custom";

export type DashboardFilters = {
  period: DashboardPeriod;
  startDate?: string;
  endDate?: string;
  channel?: string;
  platform?: Platform | "all";
  mediaType?: MediaType | "all";
  memberId?: string | "all";
};

export type SocialMetricSummary = {
  reach: number;
  views: number;
  impressions: number;
  engagementRate: number;
  ctr: number;
  reactions: number;
  comments: number;
  shares: number;
  postCount: number;
};

export type SocialPostMetric = {
  id: string;
  text: string;
  channelService: string;
  sentAt: string | null;
  reach: number;
  views: number;
  impressions: number;
  engagementRate: number;
  ctr: number;
  reactions: number;
  comments: number;
  shares: number;
  score: number;
};

export type SocialAnalyticsDebug = {
  organizationId?: string;
  mappedChannelIds: string[];
  missingFromBuffer: string[];
  /** Channel IDs that Buffer rejected with Actor access denied (when known) */
  postsAccessDenied: string[];
  rateLimited?: boolean;
  bufferMessage?: string;
};

export type SocialAnalyticsResponse = {
  summary: SocialMetricSummary;
  popularPosts: SocialPostMetric[];
  unpopularPosts: SocialPostMetric[];
  comparison: {
    label: string;
    engagement: number;
    reach: number;
    views: number;
  }[];
  platformBreakdown: { label: string; value: number; color: string }[];
  trend: { date: string; engagement: number; reach: number }[];
  configured: boolean;
  error?: string;
  /** Present when Buffer fetch fails — use for debugging channel mapping */
  debug?: SocialAnalyticsDebug;
};

export type WorkflowSummary = {
  total: number;
  inProgress: number;
  published: number;
  overdue: number;
  nearDeadline: number;
  rejected: number;
  todo: number;
  done: number;
};

export type WorkflowStatusSlice = {
  status: string;
  label: string;
  count: number;
  color: string;
};

export type WorkflowTrendPoint = {
  label: string;
  created: number;
  published: number;
};

export type MemberPerformance = {
  memberId: string;
  name: string;
  done: number;
  inProgress: number;
  todo: number;
};

export type MediaTypeSlice = {
  key: string;
  label: string;
  count: number;
  percent: number;
  color: string;
};

export type UpcomingDeadlineItem = {
  id: string;
  title: string;
  status: string;
  statusLabel: string;
  priority?: string;
  dueDate: string;
  assigneeName: string;
  assigneeId: string | null;
};

export type WorkflowAnalytics = {
  summary: WorkflowSummary;
  statusBreakdown: WorkflowStatusSlice[];
  channelBreakdown: { channel: string; count: number }[];
  mediaTypeBreakdown: MediaTypeSlice[];
  memberPerformance: MemberPerformance[];
  upcomingDeadlines: UpcomingDeadlineItem[];
  trend: WorkflowTrendPoint[];
};
