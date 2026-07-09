import { NextResponse } from "next/server";
import { requireSession } from "@/lib/content/api-auth";
import { fetchSocialAnalytics } from "@/lib/buffer/metrics";
import { getDateRangeForPeriod } from "@/lib/dashboard/filters";
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
  const data = await fetchSocialAnalytics({
    startDate: range.start,
    endDate: range.end,
    platform: platform === "all" ? undefined : platform,
  });

  return NextResponse.json(data);
}
