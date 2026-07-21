import { NextResponse } from "next/server";
import { requireSession } from "@/lib/content/api-auth";
import {
  addGroupMembers,
  assertCanAccessChannel,
  leaveGroupChannel,
  listGroupMembers,
} from "@/lib/collaboration/service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const allowed = await assertCanAccessChannel(id, authResult.session.user.id);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const members = await listGroupMembers(id);
    return NextResponse.json({ members });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "โหลดสมาชิกไม่สำเร็จ" },
      { status: 400 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const allowed = await assertCanAccessChannel(id, authResult.session.user.id);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { memberIds?: string[] };
    if (!Array.isArray(body.memberIds)) {
      return NextResponse.json(
        { error: "กรุณาเลือกสมาชิก" },
        { status: 400 }
      );
    }

    await addGroupMembers({
      channelId: id,
      memberIds: body.memberIds,
      actor: {
        id: authResult.session.user.id,
        name: authResult.session.user.name ?? "ผู้ใช้",
      },
    });

    const members = await listGroupMembers(id);
    return NextResponse.json({ members });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "เชิญสมาชิกไม่สำเร็จ" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;

  try {
    await leaveGroupChannel({
      channelId: id,
      user: {
        id: authResult.session.user.id,
        name: authResult.session.user.name ?? "ผู้ใช้",
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ออกจากกลุ่มไม่สำเร็จ" },
      { status: 400 }
    );
  }
}
