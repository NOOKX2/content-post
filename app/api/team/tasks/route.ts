import { NextResponse } from "next/server";
import type { TaskStatus } from "@prisma/client";
import { requireSession } from "@/lib/content/api-auth";
import {
  createTask,
  listTasks,
} from "@/lib/collaboration/team-service";

export async function GET(request: Request) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const { searchParams } = new URL(request.url);
  const contentId = searchParams.get("contentId") ?? undefined;
  const mine = searchParams.get("mine") === "1";

  try {
    const tasks = await listTasks({
      contentId,
      assigneeId: mine ? authResult.session.user.id : undefined,
    });
    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "โหลดงานไม่สำเร็จ",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  try {
    const body = (await request.json()) as {
      title?: string;
      contentId?: string | null;
      assigneeId?: string | null;
      dueDate?: string;
      status?: TaskStatus;
    };

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "กรุณาระบุชื่องาน" }, { status: 400 });
    }

    const task = await createTask({
      title: body.title,
      contentId: body.contentId,
      assigneeId: body.assigneeId,
      dueDate: body.dueDate,
      createdById: authResult.session.user.id,
      createdByName: authResult.session.user.name ?? "ผู้ใช้",
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "สร้างงานไม่สำเร็จ",
      },
      { status: 500 }
    );
  }
}
