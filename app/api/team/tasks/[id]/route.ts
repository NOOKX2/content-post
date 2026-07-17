import { NextResponse } from "next/server";
import type { TaskStatus } from "@prisma/client";
import { requireSession } from "@/lib/content/api-auth";
import { deleteTask, updateTask } from "@/lib/collaboration/team-service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;

  try {
    const body = (await request.json()) as {
      title?: string;
      status?: TaskStatus;
      assigneeId?: string | null;
      dueDate?: string;
    };

    const task = await updateTask(id, {
      title: body.title,
      status: body.status,
      assigneeId: body.assigneeId,
      dueDate: body.dueDate,
      actorId: authResult.session.user.id,
      actorName: authResult.session.user.name ?? "ผู้ใช้",
    });

    return NextResponse.json({ task });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "อัปเดตงานไม่สำเร็จ",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;

  try {
    await deleteTask(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "ลบงานไม่สำเร็จ",
      },
      { status: 500 }
    );
  }
}
