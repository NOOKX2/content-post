import { prisma } from "@/lib/prisma";
import { createNotification, createNotifications } from "@/lib/notifications/service";
import {
  getContentCreatorId,
  getContentStakeholderIds,
} from "@/lib/notifications/targets";
import {
  isFirstDayOfMonthBangkok,
  previousMonthKey,
  tomorrowBangkokYmd,
} from "@/lib/notifications/dates";
import { PLATFORMS } from "@/lib/constants";

const PLATFORM_LABELS = Object.fromEntries(
  PLATFORMS.map((p) => [p.id, p.shortLabel])
) as Record<string, string>;

export async function processDeadlineReminders(): Promise<number> {
  const targetDate = tomorrowBangkokYmd();
  let created = 0;

  const ideaContents = await prisma.content.findMany({
    where: {
      status: "pending",
      scheduledDate: targetDate,
    },
  });

  for (const content of ideaContents) {
    const creatorId = await getContentCreatorId(content);
    if (!creatorId) continue;

    await createNotification({
      userId: creatorId,
      type: "idea_deadline_reminder",
      title: "ใกล้ถึงกำหนดส่งงาน",
      message: `คอนเทนต์ ${content.contentId} — ${content.name} ครบกำหนดส่งงานพรุ่งนี้ (${targetDate})`,
      contentId: content.id,
      link: `/content/${content.id}`,
      dedupeKey: `idea_deadline:${content.id}:${targetDate}`,
    });
    created++;
  }

  const shootContents = await prisma.content.findMany({
    where: {
      mediaType: "video",
      status: { in: ["approved", "scheduled", "posting"] },
      scheduledDate: targetDate,
    },
  });

  for (const content of shootContents) {
    const userIds = await getContentStakeholderIds(content);
    if (userIds.length === 0) continue;

    await createNotifications(userIds, {
      type: "shoot_reminder",
      title: "ใกล้ถึงวันถ่าย",
      message: `คอนเทนต์ ${content.contentId} — ${content.name} มีนัดถ่ายพรุ่งนี้ (${targetDate})`,
      contentId: content.id,
      link: `/content/${content.id}`,
      dedupeKey: `shoot_reminder:${content.id}:${targetDate}`,
    });
    created++;
  }

  return created;
}

async function buildMonthlySummaryMessage(monthKey: string): Promise<string> {
  const [year, month] = monthKey.split("-").map(Number);
  const start = `${monthKey}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const end = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

  const contents = await prisma.content.findMany({
    where: {
      createdAt: {
        gte: new Date(`${start}T00:00:00+07:00`),
        lt: new Date(`${end}T00:00:00+07:00`),
      },
    },
    select: { status: true, platforms: true },
  });

  const posted = contents.filter((c) => c.status === "posted").length;
  const scheduled = contents.filter((c) => c.status === "scheduled").length;
  const pending = contents.filter((c) =>
    ["pending", "approved"].includes(c.status)
  ).length;

  const platformCounts: Record<string, number> = {};
  for (const content of contents) {
    const platforms = Array.isArray(content.platforms)
      ? (content.platforms as string[])
      : [];
    for (const platform of platforms) {
      platformCounts[platform] = (platformCounts[platform] ?? 0) + 1;
    }
  }

  const platformSummary = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([platform, count]) =>
        `${PLATFORM_LABELS[platform] ?? platform}: ${count}`
    )
    .join(", ");

  return `สรุปเดือน ${monthKey}: โพสแล้ว ${posted}, รอโพส ${scheduled}, กำลังดำเนินการ ${pending}${
    platformSummary ? ` | แพลตฟอร์ม: ${platformSummary}` : ""
  }`;
}

export async function processMonthlySummaries(): Promise<number> {
  if (!isFirstDayOfMonthBangkok()) return 0;

  const monthKey = previousMonthKey();
  const message = await buildMonthlySummaryMessage(monthKey);
  const users = await prisma.user.findMany({ select: { id: true } });

  let created = 0;
  for (const user of users) {
    await createNotification({
      userId: user.id,
      type: "monthly_summary",
      title: "สรุปคอนเทนต์รายเดือน",
      message,
      link: "/calendar",
      dedupeKey: `monthly_summary:${monthKey}:${user.id}`,
    });
    created++;
  }

  return created;
}

export async function processAllReminders(): Promise<{
  deadlineReminders: number;
  monthlySummaries: number;
}> {
  const [deadlineReminders, monthlySummaries] = await Promise.all([
    processDeadlineReminders(),
    processMonthlySummaries(),
  ]);
  return { deadlineReminders, monthlySummaries };
}
