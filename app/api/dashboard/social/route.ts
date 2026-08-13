import { NextResponse } from "next/server";
import { requireSession } from "@/lib/shared/api-auth";
import { fetchSocialAnalytics } from "@/lib/integrations/buffer/metrics";
import { getDateRangeForPeriod } from "@/lib/dashboard/domain/filters";
import type { DashboardPeriod } from "@/lib/dashboard/types";

export async function GET(request: Request) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") ?? "month") as DashboardPeriod;
  const startDate = searchParams.get("startDate") ?? undefined;
  const endDate = searchParams.get("endDate") ?? undefined;
  const platform = searchParams.get("platform") ?? "all";

  const range = getDateRangeForPeriod(period, startDate, endDate);

  try {
    const data = await fetchSocialAnalytics({
      startDate: range.start,
      endDate: range.end,
      platform: platform === "all" ? undefined : platform,
    });

    if (data.error) {
      console.error("[api/dashboard/social] analytics error", {
        period,
        platform,
        startDate: range.start,
        endDate: range.end,
        error: data.error,
        debug: data.debug,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ดึงข้อมูล Buffer ไม่สำเร็จ";
    console.error("[api/dashboard/social] unhandled error", {
      period,
      platform,
      startDate: range.start,
      endDate: range.end,
      error: message,
    });
    return NextResponse.json({
      summary: {
        reach: 0,
        views: 0,
        impressions: 0,
        engagementRate: 0,
        ctr: 0,
        reactions: 0,
        comments: 0,
        shares: 0,
        postCount: 0,
      },
      popularPosts: [],
      unpopularPosts: [],
      comparison: [],
      trend: [],
      configured: true,
      error: `ดึงข้อมูล Buffer ไม่สำเร็จ — ${message}`,
    });
  }
}
