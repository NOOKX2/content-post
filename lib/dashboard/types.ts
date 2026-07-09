import type { MediaType, Platform } from "@/lib/types";

export type DashboardPeriod = "day" | "month" | "year" | "custom";

export type DashboardFilters = {
  period: DashboardPeriod;
  startDate?: string;
  endDate?: string;
  channel?: string;
  platform?: Platform | "all";
  mediaType?: MediaType | "all";
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

export type SocialAnalyticsResponse = {
  summary: SocialMetricSummary;
  popularPosts: SocialPostMetric[];
  unpopularPosts: SocialPostMetric[];
  comparison: { label: string; engagement: number; reach: number }[];
  trend: { date: string; engagement: number; reach: number }[];
  configured: boolean;
  error?: string;
};

export type WorkflowSummary = {
  total: number;
  inProgress: number;
  published: number;
  nearDeadline: number;
  rejected: number;
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

export type WorkflowAnalytics = {
  summary: WorkflowSummary;
  statusBreakdown: WorkflowStatusSlice[];
  channelBreakdown: { channel: string; count: number }[];
  trend: WorkflowTrendPoint[];
};
