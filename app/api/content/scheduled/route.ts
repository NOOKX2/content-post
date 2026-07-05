import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireN8nApiKey } from "@/lib/content/api-auth";
import { filterDueContent } from "@/lib/content/scheduled";
import { toContentItem } from "@/lib/content/mappers";
import {
  getAppPublicUrl,
  resolvePublicMediaUrl,
} from "@/lib/content/media-url";

export async function GET(request: Request) {
  const authResult = requireN8nApiKey(request);
  if ("error" in authResult) return authResult.error;

  const records = await prisma.content.findMany({
    where: {
      status: { in: ["approved", "scheduled"] },
    },
    orderBy: [{ scheduledDate: "asc" }, { scheduledTime: "asc" }],
  });

  const due = filterDueContent(records);
  const appPublicUrl = getAppPublicUrl();

  return NextResponse.json({
    count: due.length,
    items: due.map((record) => {
      const item = toContentItem(record);
      return {
        ...item,
        mediaUrl: resolvePublicMediaUrl(
          item.attachments,
          item.mediaType,
          appPublicUrl
        ),
      };
    }),
  });
}
