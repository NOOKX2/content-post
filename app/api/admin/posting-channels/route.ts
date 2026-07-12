import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/content/api-auth";
import {
  createPostingChannel,
  listPostingChannelsForAdmin,
} from "@/lib/content/posting-channels";

export async function GET() {
  const authResult = await requireAdmin();
  if ("error" in authResult) return authResult.error;

  try {
    const channels = await listPostingChannelsForAdmin();
    return NextResponse.json({ channels });
  } catch (error) {
    console.error("[posting-channels] GET failed", error);
    return NextResponse.json(
      {
        channels: [],
        error:
          error instanceof Error
            ? error.message
            : "โหลดรายการช่องไม่สำเร็จ",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authResult = await requireAdmin();
  if ("error" in authResult) return authResult.error;

  const body = (await request.json()) as {
    label?: string;
    prefix?: string;
  };

  if (!body.label?.trim() || !body.prefix?.trim()) {
    return NextResponse.json(
      { error: "กรุณากรอกชื่อแสดง และ prefix" },
      { status: 400 }
    );
  }

  try {
    const channel = await createPostingChannel({
      label: body.label,
      prefix: body.prefix,
    });
    return NextResponse.json({ channel });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "ไม่สามารถสร้างช่องได้",
      },
      { status: 400 }
    );
  }
}
