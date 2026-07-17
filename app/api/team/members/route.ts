import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { requireAdmin, requireSession } from "@/lib/content/api-auth";
import {
  listTeamMembers,
  updateMemberRole,
} from "@/lib/collaboration/team-service";
import { TEAM_ROLES } from "@/lib/auth/roles";

export async function GET() {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  try {
    const members = await listTeamMembers();
    return NextResponse.json({ members });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "โหลดรายชื่อสมาชิกไม่สำเร็จ",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const authResult = await requireAdmin();
  if ("error" in authResult) return authResult.error;

  try {
    const body = (await request.json()) as { userId?: string; role?: Role };
    if (!body.userId || !body.role || !TEAM_ROLES.includes(body.role)) {
      return NextResponse.json(
        { error: "userId และ role ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    if (body.userId === authResult.session.user.id && body.role !== "ADMIN") {
      return NextResponse.json(
        { error: "ไม่สามารถลดบทบาทของตัวเองได้" },
        { status: 400 }
      );
    }

    const member = await updateMemberRole(body.userId, body.role);
    return NextResponse.json({ member });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "อัปเดตบทบาทไม่สำเร็จ",
      },
      { status: 500 }
    );
  }
}
