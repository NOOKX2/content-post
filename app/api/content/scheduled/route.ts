import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireN8nApiKey } from "@/lib/content/api-auth";
import { filterDueContent } from "@/lib/content/scheduled";
import { buildN8nContentPayload } from "@/lib/n8n/build-content-payload";

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

  return NextResponse.json({
    count: due.length,
    items: await Promise.all(due.map((record) => buildN8nContentPayload(record))),
  });
}
