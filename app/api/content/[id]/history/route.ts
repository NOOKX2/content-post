import { NextResponse } from "next/server";
import { requireSession } from "@/lib/shared/api-auth";
import { listContentAuditLogs } from "@/lib/collaboration/data/team-service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;

  try {
    const logs = await listContentAuditLogs(id);
    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "โหลดประวัติไม่สำเร็จ",
      },
      { status: 500 }
    );
  }
}
